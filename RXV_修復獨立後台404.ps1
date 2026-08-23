$ErrorActionPreference = "Stop"

$project = "D:\Pomodoro-app"
$publicDir = Join-Path $project "public"
$distDir = Join-Path $project "dist"
$publicFile = Join-Path $publicDir "rxv-r2-image-admin.html"
$distFile = Join-Path $distDir "rxv-r2-image-admin.html"

if (-not (Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir -Force | Out-Null }
if (-not (Test-Path $distDir)) {
    Write-Host "[FAIL] 找不到 D:\Pomodoro-app\dist，請先 npm run build。" -ForegroundColor Red
    exit 1
}

$html = @'
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>RXV R2 圖片後台</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,"Segoe UI","Microsoft JhengHei",sans-serif;background:#f6f8fb;color:#172033}
  .wrap{max-width:900px;margin:30px auto;padding:0 18px}
  .card{background:#fff;border:1px solid #e3e8ef;border-radius:16px;padding:22px;margin-bottom:18px;box-shadow:0 4px 18px rgba(0,0,0,.04)}
  h1{font-size:28px;margin:0 0 8px}
  h2{font-size:20px;margin:0 0 16px}
  .muted{color:#667085}
  .ok{color:#067647}
  .err{color:#b42318}
  .warn{color:#b54708}
  label{display:block;font-weight:700;margin:14px 0 7px}
  input[type=text],input[type=password],select{width:100%;padding:12px 14px;border:1px solid #cfd7e3;border-radius:10px;font-size:16px;background:white}
  input[type=file]{width:100%;padding:12px;border:1px dashed #b8c2d1;border-radius:10px;background:#fafcff}
  button{border:0;border-radius:10px;padding:12px 18px;font-size:16px;cursor:pointer;background:#1f6feb;color:#fff}
  button.secondary{background:#eef4ff;color:#175cd3}
  button.danger{background:#fee4e2;color:#b42318}
  button:disabled{opacity:.45;cursor:not-allowed}
  .row{display:flex;gap:10px;flex-wrap:wrap}
  .row>*{flex:1;min-width:180px}
  .status{padding:12px 14px;border-radius:10px;background:#f2f4f7;margin-top:12px;white-space:pre-wrap;word-break:break-word}
  .progress{height:10px;background:#e9eef5;border-radius:999px;overflow:hidden;margin-top:12px}
  .bar{height:100%;width:0;background:#1f6feb;transition:width .2s}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th,td{text-align:left;border-bottom:1px solid #edf0f4;padding:9px 6px;font-size:14px}
  .pill{display:inline-block;padding:3px 8px;border-radius:999px;background:#ecfdf3;color:#067647;font-size:13px}
  code{background:#f2f4f7;padding:2px 5px;border-radius:5px}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <h1>RXV R2 圖片後台</h1>
    <div class="muted">獨立頁面，不使用舊的分類 API。原圖 → Private R2、縮圖 → Public R2、同步更新 catalog。</div>
  </div>

  <div class="card">
    <h2>1. 管理金鑰</h2>
    <label>RXV_IMAGE_ADMIN_KEY</label>
    <div class="row">
      <input id="key" type="password" autocomplete="off" placeholder="輸入圖片後台管理金鑰" />
      <button class="secondary" id="saveKey">儲存並載入</button>
      <button class="danger" id="clearKey">清除</button>
    </div>
    <div id="authStatus" class="status muted">尚未載入。</div>
  </div>

  <div class="card">
    <h2>2. 目前 R2 圖片庫</h2>
    <div class="row">
      <button id="reload">重新載入清單</button>
      <div class="status" style="margin:0">圖片總數：<strong id="total">-</strong><br>分類數：<strong id="catCount">-</strong></div>
    </div>

    <label>圖片分類</label>
    <select id="category" disabled>
      <option value="">請先載入圖片庫</option>
    </select>
  </div>

  <div class="card">
    <h2>3. 上傳圖片</h2>
    <div class="muted">新上傳固定為 <span class="pill">bundle</span>。可一次選多張，會逐張上傳。</div>

    <label>選擇圖片</label>
    <input id="files" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple />

    <div style="margin-top:14px">
      <button id="upload" disabled>開始上傳</button>
    </div>

    <div class="progress"><div class="bar" id="bar"></div></div>
    <div id="uploadStatus" class="status muted">尚未選擇圖片。</div>

    <table id="results" style="display:none">
      <thead><tr><th>檔案</th><th>結果</th><th>Manifest</th></tr></thead>
      <tbody></tbody>
    </table>
  </div>
</div>

<script>
const $ = (id) => document.getElementById(id);
const KEY_STORE = 'rxv_image_admin_key';

function getKey(){ return $('key').value.trim(); }
function headers(){
  return {'X-RXV-Image-Admin-Key': getKey()};
}
function setStatus(el, text, kind='muted'){
  el.className = 'status ' + kind;
  el.textContent = text;
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
async function api(path, options={}){
  const res = await fetch(path, {
    ...options,
    headers: {...(options.headers||{}), ...headers()}
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {error:text}; }
  if (!res.ok || data?.ok === false || data?.success === false) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function loadCatalog(){
  if (!getKey()){
    setStatus($('authStatus'),'請先輸入管理金鑰。','warn');
    return;
  }
  setStatus($('authStatus'),'正在讀取 R2 catalog...','muted');
  $('reload').disabled = true;
  $('category').disabled = true;
  try{
    const data = await api('/api/main?action=admin-list-images');
    const images = Array.isArray(data.images) ? data.images : [];
    const map = new Map();

    for (const img of images){
      const name = String(img.category_name || '').trim();
      const id = String(img.category_id || name).trim();
      if (!name || !id) continue;
      const k = name.toLowerCase();
      if (!map.has(k)) map.set(k,{id,name});
    }

    const cats = [...map.values()];
    $('total').textContent = data.total ?? images.length;
    $('catCount').textContent = cats.length;

    $('category').innerHTML = '';
    for (const c of cats){
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.dataset.name = c.name;
      opt.textContent = c.name;
      $('category').appendChild(opt);
    }
    $('category').disabled = cats.length === 0;
    $('upload').disabled = cats.length === 0 || $('files').files.length === 0;

    setStatus(
      $('authStatus'),
      `載入成功：${data.total ?? images.length} 張圖片、${cats.length} 個分類。`,
      'ok'
    );
  }catch(e){
    $('total').textContent='-';
    $('catCount').textContent='-';
    $('category').innerHTML='<option value="">載入失敗</option>';
    setStatus($('authStatus'),`載入失敗：${e.message}`,'err');
  }finally{
    $('reload').disabled = false;
  }
}

function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(r.error || new Error('讀取檔案失敗'));
    r.readAsDataURL(file);
  });
}

async function uploadAll(){
  const files = [...$('files').files];
  if (!files.length) return;

  const opt = $('category').selectedOptions[0];
  if (!opt || !opt.value){
    setStatus($('uploadStatus'),'請先選擇分類。','warn');
    return;
  }
  const categoryId = opt.value;
  const categoryName = opt.dataset.name || opt.textContent;

  $('upload').disabled = true;
  $('reload').disabled = true;
  $('results').style.display='table';
  $('results').querySelector('tbody').innerHTML='';

  let success = 0;
  for (let i=0;i<files.length;i++){
    const f=files[i];
    const pct = Math.round((i/files.length)*100);
    $('bar').style.width = pct+'%';
    setStatus($('uploadStatus'),`正在上傳 ${i+1}/${files.length}：${f.name}`,'muted');

    let result='失敗', manifest='-';
    try{
      const base64 = await fileToDataUrl(f);
      const body = {
        base64,
        category_id: categoryId,
        category_name: categoryName,
        price_type: 'bundle',
        file_name: f.name,
        mime_type: f.type || (
          /\.png$/i.test(f.name) ? 'image/png' :
          /\.webp$/i.test(f.name) ? 'image/webp' : 'image/jpeg'
        ),
        file_size: f.size
      };

      const data = await api('/api/main?action=uploadImage',{
        method:'POST',
        headers:{'Content-Type':'application/json; charset=utf-8'},
        body:JSON.stringify(body)
      });
      success++;
      result='成功';
      manifest=data.manifest_count ?? '-';
    }catch(e){
      result='失敗：'+e.message;
    }

    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${escapeHtml(f.name)}</td><td>${escapeHtml(result)}</td><td>${escapeHtml(manifest)}</td>`;
    $('results').querySelector('tbody').appendChild(tr);
  }

  $('bar').style.width='100%';
  setStatus(
    $('uploadStatus'),
    `完成：成功 ${success} 張，失敗 ${files.length-success} 張。`,
    success===files.length?'ok':'warn'
  );

  await loadCatalog();
  $('reload').disabled=false;
  $('upload').disabled = $('category').disabled || $('files').files.length===0;
}

$('saveKey').onclick=()=>{
  const k=getKey();
  if (!k){ setStatus($('authStatus'),'請輸入管理金鑰。','warn'); return; }
  sessionStorage.setItem(KEY_STORE,k);
  loadCatalog();
};
$('clearKey').onclick=()=>{
  sessionStorage.removeItem(KEY_STORE);
  $('key').value='';
  setStatus($('authStatus'),'已清除管理金鑰。','muted');
};
$('reload').onclick=loadCatalog;
$('files').onchange=()=>{
  const n=$('files').files.length;
  setStatus($('uploadStatus'), n ? `已選擇 ${n} 張圖片。` : '尚未選擇圖片。', n?'ok':'muted');
  $('upload').disabled = !n || $('category').disabled;
};
$('upload').onclick=uploadAll;

const saved=sessionStorage.getItem(KEY_STORE);
if(saved){
  $('key').value=saved;
  loadCatalog();
}
</script>
</body>
</html>

'@

[System.IO.File]::WriteAllText($publicFile, $html, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($distFile, $html, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "[OK] 已寫入：" -ForegroundColor Green
Write-Host "  $publicFile" -ForegroundColor Green
Write-Host "  $distFile" -ForegroundColor Green
Write-Host ""

if ((Test-Path $distFile) -and ((Get-Item $distFile).Length -gt 1000)) {
    Write-Host "[OK] dist 檔案存在，大小：" (Get-Item $distFile).Length "bytes" -ForegroundColor Green
    Start-Process "http://127.0.0.1:3011/rxv-r2-image-admin.html"
} else {
    Write-Host "[FAIL] dist 檔案寫入失敗。" -ForegroundColor Red
    exit 1
}

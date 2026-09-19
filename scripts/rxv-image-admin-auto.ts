import http from "node:http";
import path from "node:path";
import dotenv from "dotenv";
import imageAdminHandler from "../api/image-admin";

const ROOT = "D:\\Pomodoro-app";
const ENV_FILE = path.join(ROOT, ".env.local");
dotenv.config({ path: ENV_FILE, override: true, quiet: true });

const PORT = 3020;
const HOST = "127.0.0.1";
const required = ["RXV_IMAGE_ADMIN_KEY","R2_ACCOUNT_ID","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY","R2_PUBLIC_BUCKET_NAME","R2_PRIVATE_BUCKET_NAME"];
const missing = required.filter(k => !String(process.env[k] || "").trim());

const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RXV 本機圖片上傳器</title>
<style>body{font-family:Arial,"Microsoft JhengHei",sans-serif;background:#f5f7fb;margin:0;color:#172033}.w{max-width:860px;margin:30px auto;padding:20px}.c{background:#fff;border-radius:16px;padding:24px;box-shadow:0 8px 28px #0002}.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}label{display:block;font-weight:700;margin:16px 0 8px}select,input,button{font:inherit}select,input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #ccd4e0;border-radius:10px}button{border:0;border-radius:10px;padding:12px 18px;font-weight:700;cursor:pointer}.p{background:#2563eb;color:#fff;width:100%;font-size:18px;margin-top:18px}.s{background:#eef2ff;color:#334155;margin-top:8px}.st{padding:12px;border-radius:10px;margin-top:14px;white-space:pre-wrap}.ok{background:#ecfdf5;color:#166534}.er{background:#fef2f2;color:#b91c1c}.wa{background:#fff7ed;color:#9a3412}.bar{height:12px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-top:12px}.bar i{display:block;height:100%;width:0;background:#2563eb}.sm{font-size:13px;color:#64748b}</style></head>
<body><div class="w"><div class="c"><h1>RXV 本機圖片上傳器</h1><div class="sm">自動讀 D:\\Pomodoro-app\\.env.local，不需要輸入管理金鑰。</div>
<label>選擇圖片</label><input id="files" type="file" accept="image/jpeg,image/png,image/webp" multiple>
<label>圖片分類</label><select id="cat"></select><button id="customBtn" class="s">＋ 新增自訂分類</button>
<div id="custom" style="display:none" class="g"><div><label>分類名稱</label><input id="cname" placeholder="例如：佛像／佛教"></div><div><label>分類 ID</label><input id="cid" placeholder="例如：buddhist-images"></div></div>
<label>圖片下載權限</label><select id="perm"><option value="free">✅ 免費下載</option><option value="bundle">🔒 鎖住下載</option></select>
<button id="upload" class="p">開始上傳</button><div class="bar"><i id="bi"></i></div><div id="status"></div></div></div>
<script>
const $=id=>document.getElementById(id);
const fb=[["food-drink","食物／飲品"],["business-office","商業／辦公"],["product-display","商品展示"],["beauty-fashion","美容／時尚"],["home-lifestyle","居家／生活"],["education","教育／學習"],["pet-animal","寵物／動物"],["wedding-event","婚禮／活動"],["travel-hotel","旅遊／住宿"],["finance","金融／理財"],["professional-service","專業服務"],["taiwan-local","台灣在地生活"],["flower-plant","花卉／植物"],["nature-landscape","自然／風景"],["background-wallpaper","背景／桌布"],["festival","節慶／節日"],["religion-healing","宗教／療癒"],["technology","科技／數位"],["other","其他素材"]];
function st(t,c="wa"){$("status").className="st "+c;$("status").textContent=t}
async function api(a,o={}){const r=await fetch("/api/image-admin?action="+encodeURIComponent(a),o);const x=await r.text();let d={};try{d=x?JSON.parse(x):{}}catch{d={error:x||("HTTP "+r.status)}}if(!r.ok||d.ok===false||d.success===false)throw new Error(d.error||("HTTP "+r.status));return d}
async function cats(){const s=$("cat");s.innerHTML="";try{const d=await api("admin-list-images");const m=new Map();(d.images||[]).forEach(x=>{const id=String(x.category_id||"").trim(),n=String(x.category_name||x.category||id).trim();if(id&&n&&!m.has(id))m.set(id,n)});const rows=m.size?[...m.entries()]:fb;rows.forEach(([i,n])=>s.add(new Option(n,i)));if([...s.options].some(o=>o.value==="religion-healing"))s.value="religion-healing";st("✅ 本機 API 已連線。","ok")}catch(e){fb.forEach(([i,n])=>s.add(new Option(n,i)));s.value="religion-healing";st("⚠️ R2 分類讀取失敗，已使用固定分類。\n"+e.message,"wa")}}
$("customBtn").onclick=()=>{$("custom").style.display=$("custom").style.display==="none"?"grid":"none"};
function b64(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}
$("upload").onclick=async()=>{const fs=[...$("files").files];if(!fs.length)return st("請先選擇圖片","er");let id=$("cat").value,n=$("cat").selectedOptions[0]?.textContent||id;if($("custom").style.display!=="none"&&$("cname").value.trim()){n=$("cname").value.trim();id=$("cid").value.trim()||"custom-"+Date.now()}const p=$("perm").value;let ok=0,fail=0,errs=[];$("upload").disabled=true;for(let i=0;i<fs.length;i++){const f=fs[i];$("bi").style.width=Math.round(i/fs.length*100)+"%";st("上傳中 "+(i+1)+" / "+fs.length+"： "+f.name);try{await api("uploadImage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base64:await b64(f),category_id:id,category_name:n,price_type:p,file_name:f.name,mime_type:f.type||"image/webp",file_size:f.size})});ok++}catch(e){fail++;errs.push(f.name+"："+e.message)}}$("bi").style.width="100%";$("upload").disabled=false;fail?st("成功 "+ok+" 張，失敗 "+fail+" 張\n"+errs.join("\n"),"er"):st("✅ 成功上傳 "+ok+" 張\n分類："+n+"\n權限："+(p==="free"?"免費下載":"鎖住下載"),"ok");if(!fail)await cats()}
cats();
</script></body></html>`;

function send(res:any, code:number, body:string, type="text/html; charset=utf-8"){res.statusCode=code;res.setHeader("Content-Type",type);res.setHeader("Cache-Control","no-store");res.end(body)}

const server=http.createServer(async(req:any,res:any)=>{
  try{
    const url=new URL(req.url||"/",`http://${HOST}:${PORT}`);
    if(url.pathname==="/"){send(res,200,html);return}
    if(url.pathname==="/health"){send(res,missing.length?500:200,JSON.stringify({ok:!missing.length,missing}),"application/json; charset=utf-8");return}
    if(url.pathname==="/api/image-admin"){
      if(missing.length){send(res,500,JSON.stringify({ok:false,error:"ENV_MISSING:"+missing.join(",")}),"application/json; charset=utf-8");return}
      req.query=Object.fromEntries(url.searchParams.entries());
      let body="";for await(const ch of req)body+=ch;
      if(body){try{req.body=JSON.parse(body)}catch{req.body=body}}else req.body={};
      req.headers=req.headers||{};req.headers["x-rxv-image-admin-key"]=String(process.env.RXV_IMAGE_ADMIN_KEY||"");
      res.status=(c:number)=>{res.statusCode=c;return res};res.json=(p:any)=>{if(!res.headersSent)res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify(p));return res};
      await imageAdminHandler(req,res);return
    }
    send(res,404,"Not found","text/plain; charset=utf-8")
  }catch(e:any){if(!res.headersSent)res.statusCode=500;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify({ok:false,error:e?.message||"LOCAL_ADMIN_ERROR"}))}
});
server.listen(PORT,HOST,()=>{console.log("RXV IMAGE ADMIN AUTO");console.log("URL: http://127.0.0.1:"+PORT+"/");console.log("ENV STATUS: "+(missing.length?"MISSING "+missing.join(","):"OK"));});

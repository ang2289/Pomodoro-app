const el = document.getElementById("status");
const phaseLabels = {IDLE:"待命",JOB_RECEIVED:"已收到工作",OPENING_PLATFORM:"正在開平台",PLATFORM_TAB_READY:"平台頁已開",FACEBOOK_PREPARING:"正在準備 Facebook",TIKTOK_PREPARING:"正在準備 TikTok",TIKTOK_LOADING_LOCAL_MP4:"正在從本機載入 MP4（Blob 橋接）",TIKTOK_LOCAL_MP4_SENT:"MP4 已送入 TikTok，等待 Studio 處理",TIKTOK_WAITING_MANUAL_VIDEO:"等待你手動選影片，選好後會自動續填說明",TIKTOK_RECOVERING_AUTO_UPLOAD_ERROR:"TikTok 接片後出錯，正在重試頁面",TIKTOK_WAITING_MANUAL_VIDEO_AFTER_RETRY:"頁面已重試，請手動選影片；選好後自動續填說明",TIKTOK_FILLING_DESCRIPTION:"正在填入 TikTok 說明／分潤連結／Hashtag",PINTEREST_PREPARING:"正在準備 Pinterest",PINTEREST_UPLOADING_IMAGE:"正在上傳 Pinterest 圖片",PINTEREST_FILLING_FIELDS:"正在填入 Pinterest 標題／說明／連結",PINTEREST_SELECTING_BOARD:"正在選擇 Pinterest 圖版",PREPARED:"已準備到最後一步",PUBLISHED:"已自動發佈",FAILED:"執行失敗",QUEUE_FETCH_FAILED:"無法讀取工作佇列"};

async function getRuntimeState(){try{return await chrome.runtime.sendMessage({type:"RXV_PUBLISHER_STATE"})||{};}catch{return {};}}
async function getLatest(){try{const r=await fetch("http://localhost:3006/publisher-extension/latest-eligible?platform=tiktok");return await r.json().catch(()=>({}));}catch{return {};}}

async function refresh(){
  try{
    const [response,runtime,latest]=await Promise.all([
      fetch("http://localhost:3006/publisher-extension/status"),
      getRuntimeState(),
      getLatest(),
    ]);
    const d=await response.json();
    const online=Boolean(d?.online);
    const phase=String(runtime?.phase||"");
    const lastError=String(runtime?.lastError||"");
    const c=latest?.candidate;
    el.innerHTML=
      `<div class="${online?"ok":"bad"}"><strong>${online?"已連線 RxV":"尚未連線 RxV"}</strong></div>`+
      `<div class="small">擴充版本 ${d?.extension?.version||"未知"}｜待處理 ${d?.pending||0}｜處理中 ${d?.processing||0}｜待人工發佈 ${d?.prepared||0}｜已自動發佈 ${d?.published||0}</div>`+
      `<div class="small">目前狀態：${phaseLabels[phase]||phase||"未知"}${runtime?.activeJobId?`｜Job ${runtime.activeJobId}`:""}</div>`+
      `${runtime?.fileMode?`<div class="small">TikTok 選片模式：${runtime.fileMode}</div>`:""}`+
      `<div class="small">最近可送 TikTok：${c?`#${c.id}｜${c.productTitle||c.videoFilename||c.productKey}`:"目前沒有符合條件的工作"}</div>`+
      `${d?.lastEnqueue?`<div class="small">最近送入 Queue：Publisher #${d.lastEnqueue.publisherJobId||""}｜${d.lastEnqueue.status||""}｜${d.lastEnqueue.reused?"沿用":"新建"}${d.lastEnqueue.repairedQueue?"＋已修復 Queue":""}</div>`:""}`+
      `${d?.lastClaim?`<div class="small">最近領取：Publisher #${d.lastClaim.publisherJobId||""}｜${d.lastClaim.platform||""}</div>`:""}`+
      `${lastError?`<div class="small bad">最後錯誤：${lastError}</div>`:""}`+
      `<div class="small">支援：Facebook、TikTok</div>`;
  }catch{el.innerHTML='<div class="bad"><strong>localhost:3006 尚未啟動</strong></div>';}
}

async function wake(){await chrome.runtime.sendMessage({type:"RXV_PUBLISHER_WAKE",source:"popup"}).catch(()=>{});await refresh();}

async function sendLatestTikTok(){
  const b=document.getElementById("sendTikTok");
  b.disabled=true;b.textContent="正在送出 TikTok 工作...";
  try{
    const r=await fetch("http://localhost:3006/publisher-extension/requeue-latest",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({platform:"tiktok"})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||d?.ok===false) throw new Error(d?.message||d?.error||"TikTok 工作送出失敗");

    const helper=d?.helperJob||{};
    el.innerHTML+=`<div class="small ok">後端已送入：Publisher #${helper.publisherJobId||d?.candidate?.id||"?"}｜Helper ${String(helper.id||"").slice(0,8)}｜${helper.status||"pending"}｜Queue ${d?.queue?.pending??"?"}</div>`;

    const wakeResult=await chrome.runtime.sendMessage({type:"RXV_PUBLISHER_WAKE",source:"popup-direct-tiktok"}).catch((e)=>({ok:false,error:String(e?.message||e)}));
    if(wakeResult?.ok===false) throw new Error(wakeResult?.error||"EXTENSION_WAKE_FAILED");

    await new Promise((resolve)=>setTimeout(resolve,350));
    await refresh();
    setTimeout(()=>refresh().catch(()=>{}),1200);
  }catch(e){el.innerHTML+=`<div class="small bad">重新送出失敗：${String(e?.message||e)}</div>`;}
  finally{b.disabled=false;b.textContent="重新送出最近 TikTok 工作";}
}

document.getElementById("refresh").addEventListener("click",refresh);
document.getElementById("wake").addEventListener("click",wake);
document.getElementById("sendTikTok").addEventListener("click",sendLatestTikTok);
refresh();

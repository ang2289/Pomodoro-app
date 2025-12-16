// 自動導向新版 shopee-video 頁面（保留此檔避免 404）

import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { featureFlags } from "@/config/featureFlags";

export default function RedirectShorts() {
  // 🔒 功能開關檢查：防止直接輸入網址進入
  if (!featureFlags.videoTool) {
    return <Navigate to="/" replace />;
  }

  const navigate = useNavigate();

  useEffect(() => {
    navigate("/tools/shopee-video", { replace: true });
  }, [navigate]);



  return (

    <div style={{ padding: 40, fontSize: 20, textAlign: "center" }}>

      🚀 正在為您前往新版 AI 自動短影音工具...

    </div>

  );

}


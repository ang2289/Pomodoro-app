// 自動導向新版 shopee-video 頁面（保留此檔避免 404）

import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { featureFlags } from "@/config/featureFlags";
import { isLocalDevelopment } from "@/lib/isLocalDevelopment";
import VideoToolUnavailable from "@/components/VideoToolUnavailable";

export default function RedirectShorts() {
  const navigate = useNavigate();
  const local = isLocalDevelopment();
  const videoOn = featureFlags.videoTool;

  useEffect(() => {
    if (!local || !videoOn) return;
    navigate("/tools/shopee-video", { replace: true });
  }, [navigate, local, videoOn]);

  if (!local) {
    return <VideoToolUnavailable />;
  }

  if (!videoOn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: 40, fontSize: 20, textAlign: "center" }}>
      🚀 正在為您前往新版 AI 自動短影音工具...
    </div>
  );
}

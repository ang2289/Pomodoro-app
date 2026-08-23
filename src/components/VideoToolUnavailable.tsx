import React from "react";

/**
 * 正式環境直接開啟影音工具網址時顯示（不載入工具、不呼叫 API）。
 */
export default function VideoToolUnavailable() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "48px auto",
        padding: "28px 24px",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        textAlign: "center",
        color: "#0f172a",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>功能開發中</h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, margin: "0 0 12px", color: "#334155" }}>
        此影音工具目前僅限本地開發測試，網站版尚未開放。
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: "#64748b" }}>敬請期待後續版本。</p>
    </div>
  );
}

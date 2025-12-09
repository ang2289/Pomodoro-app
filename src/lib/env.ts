export const ENV = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
};

if (!ENV.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY 未設定！請確認 Vercel Environment Variables 或 .env.local 已加入。");
}


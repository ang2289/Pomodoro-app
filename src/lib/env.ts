export const ENV = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  GEMINI_API_KEY_HOMEWORK: import.meta.env.VITE_GEMINI_API_KEY_HOMEWORK,
  GOOGLE_TTS_KEY: import.meta.env.VITE_GOOGLE_TTS_KEY,
};

if (!ENV.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY 未設定！請確認 Vercel Environment Variables 或 .env.local 已加入。");
}


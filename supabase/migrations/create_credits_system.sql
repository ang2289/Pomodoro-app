-- 點數制資料結構建立腳本
-- 執行方式：在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 1. 建立 user_credits 表（點數帳戶）
CREATE TABLE IF NOT EXISTS user_credits (
  user_id TEXT PRIMARY KEY,
  remaining_chars INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立 updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 建立索引（如果需要查詢）
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_updated_at ON user_credits(updated_at);

-- 2. 建立 usage_logs 表（使用紀錄，僅紀錄，不影響扣點）
CREATE TABLE IF NOT EXISTS usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  used_chars INTEGER NOT NULL,
  service_type TEXT NOT NULL, -- 'summary', 'homework', 等
  content_preview TEXT, -- 內容預覽（可選）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以便查詢
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_service_type ON usage_logs(service_type);

-- 3. 建立初始化點數的函數（可選）
-- 當使用者第一次使用時，自動初始化點數
CREATE OR REPLACE FUNCTION init_user_credits(p_user_id TEXT, p_initial_chars INTEGER DEFAULT 10000)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_credits (user_id, remaining_chars)
  VALUES (p_user_id, p_initial_chars)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 4. 建立 RLS (Row Level Security) 政策（如果需要）
-- 啟用 RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- 允許使用者讀取自己的點數
CREATE POLICY "Users can read own credits"
  ON user_credits
  FOR SELECT
  USING (auth.uid()::text = user_id OR true); -- 暫時允許所有人讀取，實際應根據需求調整

-- 允許使用者讀取自己的使用紀錄
CREATE POLICY "Users can read own usage logs"
  ON usage_logs
  FOR SELECT
  USING (auth.uid()::text = user_id OR true); -- 暫時允許所有人讀取，實際應根據需求調整

-- 注意：扣點數操作應由後端服務（Edge Function）使用 SERVICE_ROLE_KEY 執行，不通過 RLS


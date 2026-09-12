-- 創建 guest_trials 表，用於追蹤免登入使用者的免費試用次數
-- 規則：每個 guestId + tool 組合最多可使用對應次數（summary: 3次, homework: 1次等）

CREATE TABLE IF NOT EXISTS guest_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,
  tool TEXT NOT NULL DEFAULT 'summary',
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(guest_id, tool)
);

-- 創建索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_guest_trials_guest_id ON guest_trials(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_trials_tool ON guest_trials(tool);
CREATE INDEX IF NOT EXISTS idx_guest_trials_guest_id_tool ON guest_trials(guest_id, tool);

-- 創建更新 updated_at 的觸發器
CREATE OR REPLACE FUNCTION update_guest_trials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guest_trials_updated_at
  BEFORE UPDATE ON guest_trials
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_trials_updated_at();

-- 啟用 RLS（Row Level Security）
ALTER TABLE guest_trials ENABLE ROW LEVEL SECURITY;

-- 創建策略：允許所有人讀取和寫入（因為是免登入功能）
CREATE POLICY "Allow all operations on guest_trials"
  ON guest_trials
  FOR ALL
  USING (true)
  WITH CHECK (true);

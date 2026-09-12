-- 為 guest_trials 表添加 tool 欄位
-- 用於區分不同工具（summary, homework 等）的免費試用次數

-- 添加 tool 欄位（預設值為 'summary' 以保持向後相容）
ALTER TABLE guest_trials 
ADD COLUMN IF NOT EXISTS tool TEXT NOT NULL DEFAULT 'summary';

-- 移除舊的 UNIQUE 約束（guest_id）
ALTER TABLE guest_trials 
DROP CONSTRAINT IF EXISTS guest_trials_guest_id_key;

-- 添加新的 UNIQUE 約束（guest_id, tool）
ALTER TABLE guest_trials 
ADD CONSTRAINT guest_trials_guest_id_tool_unique UNIQUE (guest_id, tool);

-- 移除 max_count 欄位（改用程式常數）
ALTER TABLE guest_trials 
DROP COLUMN IF EXISTS max_count;

-- 創建索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_guest_trials_tool ON guest_trials(tool);
CREATE INDEX IF NOT EXISTS idx_guest_trials_guest_id_tool ON guest_trials(guest_id, tool);

-- 啟用 pg_net 擴充功能
-- 用於在 RPC 函數中呼叫 Edge Function

CREATE EXTENSION IF NOT EXISTS pg_net;

COMMENT ON EXTENSION pg_net IS '啟用 pg_net 擴充功能，用於在 PostgreSQL 函數中發送 HTTP 請求';


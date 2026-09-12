-- ============================================
-- 圖片上傳 MVP 暫用規則
-- ============================================
-- 說明：允許所有 authenticated 使用者上傳圖片到 'images' bucket
-- 用途：圖片上傳功能的 MVP 階段權限設定
-- 注意：此為暫用規則，未來應依實際需求調整權限範圍
-- ============================================

-- 允許 authenticated 使用者上傳圖片到 images bucket
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

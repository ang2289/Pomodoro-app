# RxV 批次影片產生器

這個工具可以批次產生短影片，從 `scripts.json` 讀取腳本資料並自動產生 9:16 格式的影片。

## 安裝步驟

### 1. 安裝 FFmpeg

**Windows:**
- 從 [FFmpeg 官網](https://ffmpeg.org/download.html) 下載
- 解壓縮後，將 `bin` 資料夾加入系統 PATH
- 在終端機執行 `ffmpeg -version` 確認安裝成功

**Mac:**
```bash
brew install ffmpeg
```

### 2. 安裝 Node.js 依賴

```bash
npm install
```

## 使用方法

### 1. 準備 scripts.json

從網站下載的 `scripts.json` 檔案，放在此資料夾中。

### 2. （選擇性）準備背景音樂

將背景音樂檔案命名為 `bgm.mp3` 並放在此資料夾中。如果沒有此檔案，會產生無背景音樂的影片。

### 3. 執行產生器

```bash
node generate-videos.js
```

或

```bash
npm start
```

### 4. 查看結果

- `output/` 資料夾：包含所有產生的影片（video_1.mp4, video_2.mp4...）
- `videos_batch.zip`：所有影片的壓縮檔
- `tmp/` 資料夾：臨時下載的圖片檔案

## 注意事項

- 預設只產生前 10 支影片（測試用）
- 如果要產生全部，可以修改 `MAX_COUNT` 變數
- 影片長度預設為 15 秒，可在 `VIDEO_DURATION` 變數中調整
- 影片格式為 1080x1920 (9:16)，適合 TikTok、YouTube Shorts、IG Reels













































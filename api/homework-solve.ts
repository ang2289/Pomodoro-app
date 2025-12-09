import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 取得 API KEY（請確認 .env 有設定）
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "只允許 POST" });

  try {
    // 檢查 API Key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY 未設定" });
    }

    // --- 讀取 multipart/form-data (圖片) ---
    const buffers: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk) => buffers.push(chunk));
      req.on("end", () => resolve());
      req.on("error", (err) => reject(err));
    });

    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "請使用 multipart/form-data 格式上傳圖片" });
    }

    const boundary = contentType.split("boundary=")[1];
    if (!boundary)
      return res.status(400).json({ error: "缺少 boundary" });

    const all = Buffer.concat(buffers);
    const parts = all.toString("binary").split(`--${boundary}`);

    // 找到圖片
    let imageBuffer: Buffer | null = null;
    let mimeType = "image/png"; // 預設值

    for (const p of parts) {
      if (p.includes("filename=")) {
        // 提取 MIME 類型
        const contentTypeMatch = p.match(/Content-Type:\s*([^\r\n]+)/i);
        if (contentTypeMatch) {
          mimeType = contentTypeMatch[1].trim();
        }

        // 找到檔案內容的開始位置（\r\n\r\n 之後）
        const idx = p.indexOf("\r\n\r\n");
        if (idx === -1) continue;

        // 提取二進位資料（到最後一個 \r\n 之前）
        const fileBinary = p.substring(idx + 4);
        const endIdx = fileBinary.lastIndexOf("\r\n");
        const binaryData = endIdx !== -1 ? fileBinary.substring(0, endIdx) : fileBinary;

        // 將二進位字串轉換為 Buffer
        imageBuffer = Buffer.from(binaryData, "binary");
        break;
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({ error: "沒有收到圖片" });
    }

    // --- 把圖片轉 Base64 ---
    const base64 = imageBuffer.toString("base64");

    // --- 啟動 Gemini Pro Vision 模型 ---
    // 注意：Gemini 1.5 Pro 支援視覺，使用 gemini-1.5-pro 或 gemini-1.5-flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" // 或使用 "gemini-1.5-pro" 獲得更好的效果
    });

    const prompt = `
你是一位專業的「小學生〜高中學生作業解題助理」。

任務：
1. 讀取題目的文字內容（OCR）
2. 判斷題目類型（數學 / 國語 / 自然 / 英文）
3. 提供清楚易懂的「逐步解析與解答」
4. 絕對不能亂編題目內容，不能誇大推論
5. 如果題目不清楚，請要求學生重新拍照

回答格式如下：

📘 題目辨識：
（將題目文字列出）

🧠 解題步驟：
（清楚分段，一步一步講）

✅ 最終答案：
（請簡潔明確）

請使用「繁體中文」回答。
`;

    const result = await model.generateContent([
      { 
        inlineData: { 
          data: base64, 
          mimeType: mimeType 
        } 
      },
      prompt,
    ]);

    const text = result.response.text();

    return res.status(200).json({ answer: text });
  } catch (err: any) {
    console.error("❌ Homework solver error:", err);
    
    // 提供更詳細的錯誤訊息
    const errorMessage = err?.message || "未知錯誤";
    
    return res.status(500).json({
      error: `AI 暫時忙碌中，請稍後再試。錯誤詳情：${errorMessage}`,
    });
  }
}


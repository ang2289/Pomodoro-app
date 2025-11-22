export default async function handler(req: any, res: any) {
  // 只允許 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { content, lang = 'zh-TW' } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '缺少內容' })
    }

    // 這裡應該呼叫你的 AI 服務（例如 OpenAI、Claude 等）
    // 範例：使用 OpenAI API
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI 服務未設定' })
    }

    // 根據語言選擇對應的 prompt
    const isChinese = lang === 'zh-TW'
    
    const prompt = isChinese
      ? `請分析以下文章內容，並提供：

1. 摘要：用 200-300 字總結文章重點
2. 關鍵字：提取 5 個最重要的關鍵字，用逗號分隔

文章內容：
${content}

請用以下格式回覆：
摘要：[摘要內容]
關鍵字：[關鍵字1, 關鍵字2, 關鍵字3, 關鍵字4, 關鍵字5]`
      : `Please analyze the following article content and provide:

1. Summary: Summarize the key points in 200-300 words
2. Keywords: Extract 5 most important keywords, separated by commas

Article content:
${content}

Please reply in the following format:
Summary: [summary content]
Keywords: [keyword1, keyword2, keyword3, keyword4, keyword5]`

    // 呼叫 OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: isChinese
              ? '你是一個專業的文章摘要和關鍵字提取助手。'
              : 'You are a professional article summarization and keyword extraction assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}))
      console.error('OpenAI API 錯誤:', errorData)
      return res.status(500).json({ error: 'AI 服務錯誤' })
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices?.[0]?.message?.content || ''

    // 解析 AI 回應
    let summary = ''
    let keywords: string[] = []

    if (isChinese) {
      // 中文格式解析
      const summaryMatch = aiResponse.match(/摘要[：:]\s*(.+?)(?=關鍵字|$)/s)
      if (summaryMatch) {
        summary = summaryMatch[1].trim()
      } else {
        summary = aiResponse.split('\n\n')[0].trim()
      }

      const keywordsMatch = aiResponse.match(/關鍵字[：:]\s*\[(.+?)\]/)
      if (keywordsMatch) {
        keywords = keywordsMatch[1]
          .split(',')
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0)
      } else {
        const keywordsLine = aiResponse.match(/關鍵字[：:]\s*(.+?)(?:\n|$)/)
        if (keywordsLine) {
          keywords = keywordsLine[1]
            .split(/[,，、]/)
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0)
            .slice(0, 5)
        }
      }
    } else {
      // 英文格式解析
      const summaryMatch = aiResponse.match(/Summary[：:]\s*(.+?)(?=Keywords|$)/is)
      if (summaryMatch) {
        summary = summaryMatch[1].trim()
      } else {
        summary = aiResponse.split('\n\n')[0].trim()
      }

      const keywordsMatch = aiResponse.match(/Keywords[：:]\s*\[(.+?)\]/i)
      if (keywordsMatch) {
        keywords = keywordsMatch[1]
          .split(',')
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0)
      } else {
        const keywordsLine = aiResponse.match(/Keywords[：:]\s*(.+?)(?:\n|$)/i)
        if (keywordsLine) {
          keywords = keywordsLine[1]
            .split(',')
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0)
            .slice(0, 5)
        }
      }
    }

    // 如果還是沒有關鍵字，使用簡單的關鍵字提取
    if (keywords.length === 0) {
      // 簡單的關鍵字提取邏輯（可以改進）
      const words = content
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1)
      // 這裡可以加入更複雜的關鍵字提取邏輯
      keywords = words.slice(0, 5)
    }

    return res.status(200).json({
      summary: summary || '無法生成摘要',
      keywords: keywords || [],
    })
  } catch (err: any) {
    console.error('Summary API 錯誤:', err)
    return res.status(500).json({ error: err.message || '伺服器錯誤' })
  }
}


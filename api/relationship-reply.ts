const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const relationshipNames: Record<string, string> = {
  crush: '曖昧或喜歡的人',
  new: '剛認識的人',
  couple: '情侶',
  friend: '朋友',
  work: '職場關係',
  online: '網路或社群互動',
}

const styleNames: Record<string, string> = {
  natural: '自然',
  funny: '幽默',
  flirty: '曖昧',
  high_eq: '高情商',
  direct: '直接',
  cool: '冷淡',
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'GEMINI_API_KEY_MISSING', message: 'AI 服務尚未完成設定' })
  }

  const { message, relationship = 'crush', style = 'natural', strength = 2 } = req.body || {}
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'MESSAGE_REQUIRED', message: '請提供對方說的話' })
  }

  if (message.length > 1200) {
    return res.status(400).json({ error: 'MESSAGE_TOO_LONG', message: '訊息請控制在 1200 字以內' })
  }

  const safeStrength = Math.min(5, Math.max(1, Number(strength) || 2))
  const relationshipLabel = relationshipNames[relationship] || relationshipNames.crush
  const styleLabel = styleNames[style] || styleNames.natural

  const systemPrompt = `
你是「AI 關係軍師」，專門協助台灣繁體中文使用者處理戀愛、曖昧、朋友、職場與社群聊天回覆。

核心原則：
1. 一律使用自然的台灣繁體中文，不要使用簡體字、中國網路用語或生硬翻譯腔。
2. 回覆要像真人在 LINE、Instagram、Messenger 或 Threads 上會傳的訊息，短、自然、可直接複製。
3. 不要把普通訊息過度解讀成喜歡、討厭、劈腿或拒絕。證據不足時要明確說「僅憑這句無法確定」。
4. 不要鼓勵騷擾、糾纏、操控、情緒勒索、報復、羞辱或威脅。
5. 即使用戶選擇高強度，也要維持不帶髒話、不羞辱、不歧視、不威脅的界線。
6. 若情境涉及可能的人身安全、威脅、跟蹤、暴力或自傷風險，回覆策略應優先建議停止互動並尋求可信任協助，不要生成挑釁內容。
7. 每個候選回覆原則上 10～45 個中文字，除非情境需要稍長。
8. 三個回覆要有明顯差異，不要只是換同義詞。

目前關係：${relationshipLabel}
使用者想要的語氣：${styleLabel}
回覆強度：${safeStrength}/5

請分析「對方說的話」，輸出：
- analysis：一句簡短、中性的語氣判斷；不要宣稱能讀心。
- strategy：一句實用回覆策略。
- replies：三個可直接傳送的回覆。

只回傳 JSON，不要 Markdown。
`

  const schema = {
    type: 'OBJECT',
    properties: {
      analysis: { type: 'STRING' },
      strategy: { type: 'STRING' },
      replies: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            label: { type: 'STRING' },
            text: { type: 'STRING' },
          },
          required: ['label', 'text'],
        },
      },
    },
    required: ['analysis', 'strategy', 'replies'],
  }

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n對方說：\n${message.trim()}` }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.78,
      maxOutputTokens: 700,
    },
  }

  try {
    const aiRes = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!aiRes.ok) {
      const text = await aiRes.text()
      console.error('[relationship-reply] Gemini failed', aiRes.status, text.slice(0, 500))
      return res.status(502).json({ error: 'AI_PROVIDER_FAILED', message: 'AI 暫時無法回覆，請稍後再試' })
    }

    const raw = await aiRes.json()
    const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return res.status(502).json({ error: 'AI_EMPTY_RESPONSE', message: 'AI 沒有產生有效回覆' })
    }

    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch (error) {
      console.error('[relationship-reply] JSON parse failed', error)
      return res.status(502).json({ error: 'AI_PARSE_FAILED', message: 'AI 回覆格式異常，請再試一次' })
    }

    const replies = Array.isArray(parsed.replies)
      ? parsed.replies.slice(0, 3).map((item: any, index: number) => ({
          label: typeof item?.label === 'string' && item.label.trim() ? item.label.trim() : ['最推薦', '另一種說法', '備選'][index],
          text: typeof item?.text === 'string' ? item.text.trim() : '',
        })).filter((item: any) => item.text)
      : []

    if (!replies.length) {
      return res.status(502).json({ error: 'AI_NO_REPLIES', message: 'AI 沒有產生可用的回覆' })
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      ok: true,
      analysis: String(parsed.analysis || '僅憑這段訊息無法完全判斷對方意圖。').trim(),
      strategy: String(parsed.strategy || '先用自然、簡短的方式回覆，觀察對方後續互動。').trim(),
      replies,
      modelUsed: GEMINI_MODEL,
    })
  } catch (error: any) {
    console.error('[relationship-reply] request failed', error)
    return res.status(500).json({ error: 'REQUEST_FAILED', message: '服務暫時異常，請稍後再試' })
  }
}

export default async function handler(req: any, res: any) {
  // 只允許 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: '缺少 URL' })
    }

    // 驗證 URL 格式
    try {
      new URL(url)
    } catch {
      return res.status(400).json({ error: '無效的 URL 格式' })
    }

    // 抓取 HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return res.status(400).json({ error: '無法存取此網址' })
    }

    const html = await response.text()

    // 使用簡單的正則表達式提取文字內容
    // 移除 script 和 style 標籤
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')

    // 優先抓取 article 標籤內容
    let articleMatch = cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (!articleMatch) {
      // 如果沒有 article，嘗試 main
      articleMatch = cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    }
    if (!articleMatch) {
      // 如果沒有 main，使用 body
      articleMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    }

    let articleText = articleMatch ? articleMatch[1] : cleanHtml

    // 移除 HTML 標籤
    articleText = articleText.replace(/<[^>]+>/g, ' ')

    // 清洗文字
    articleText = articleText
      .replace(/\s+/g, ' ')
      .replace(/(推薦|相關|延伸閱讀|延伸|閱讀更多|更多內容).*/gi, '')
      .replace(/ADVERTISEMENT|廣告|Sponsored/gi, '')
      .trim()

    if (!articleText || articleText.length < 30) {
      return res.status(400).json({ error: '無法從此網址取得有效文章內容' })
    }

    return res.status(200).json({ content: articleText })
  } catch (err: any) {
    console.error('Extract content error:', err)
    return res.status(500).json({ error: err.message || '伺服器錯誤' })
  }
}


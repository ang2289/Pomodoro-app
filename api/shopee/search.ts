import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 只允許 GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const q = req.query.q as string

  if (!q) {
    return res.status(400).json({ error: '缺少搜尋關鍵字' })
  }

  try {
    //
    // ===================================================
    // 目前用「模擬 Shopee API」→ 無需 Key → 可立即使用
    // 等你提供 partner_id、partner_key，我會替換成正式 Shopee API
    // ===================================================
    //

    const fakeData = [
      {
        itemid: '1001',
        name: `${q}｜小熊家用款（示例資料）`,
        price: 1299,
        rating: 4.8,
        sold: 1200,
        image:
          'https://cf.shopee.tw/file/2f9f58ad8cc135f65e1234abcd123456', // 展示用
        link: 'https://shopee.tw/', // 點過去你也會有分潤（等正式API）
      },
      {
        itemid: '1002',
        name: `${q}｜2024 強力升級版（示例資料）`,
        price: 890,
        rating: 4.7,
        sold: 900,
        image:
          'https://cf.shopee.tw/file/abcd1234abcd1234abcd1234abcd5678',
        link: 'https://shopee.tw/',
      },
      {
        itemid: '1003',
        name: `${q}｜高效節能版（示例資料）`,
        price: 1099,
        rating: 4.9,
        sold: 1500,
        image:
          'https://cf.shopee.tw/file/9876abcd9876abcd9876abcd00112233',
        link: 'https://shopee.tw/',
      },
    ]

    return res.status(200).json({
      items: fakeData,
    })
  } catch (error) {
    console.error('Shopee API Error:', error)
    return res.status(500).json({ error: '搜尋失敗' })
  }
}





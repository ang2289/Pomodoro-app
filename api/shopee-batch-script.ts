import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "需要 items: 商品陣列" });
  }

  try {
    const scripts = [];

    for (const item of items) {

      const prompt = `
請為以下商品產生「短影片腳本」：

商品名稱：${item.name}
價格：${item.price}
已售出：${item.sold}
評價：${item.rating}
商品網址：${item.url}

請以「繁體中文」輸出 JSON：

{
  "id": "商品ID",
  "title": "影片標題（5-10字）",
  "intro": "吸引人開場（3-4秒）",
  "points": ["亮點1","亮點2","亮點3"],
  "script": "20-40秒口語化短影片腳本",
  "cta": "導購CTA（例如：點連結查看優惠）",
  "image": "${item.image}",
  "affiliate_url": "請使用此同一網址：${item.url}",
  "duration": 30
}
請直接輸出 JSON，不要多餘說明。
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "{}";
      const json = JSON.parse(text);

      scripts.push(json);
    }

    return res.status(200).json(scripts);

  } catch (err) {
    return res.status(500).json({ error: "腳本產生發生錯誤", detail: String(err) });
  }
}


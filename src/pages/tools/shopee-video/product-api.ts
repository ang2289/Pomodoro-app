// 注意：前端直接呼叫 RapidAPI 會有 CORS 問題
// 建議透過後端 API /api/shopee-detail 來呼叫

export async function fetchShopeeProduct(itemid: string, shopid: string) {

  // 透過後端 API 來避免 CORS 問題

  const response = await fetch('/api/shopee-detail', {

    method: 'POST',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({

      url: `https://shopee.tw/product/${shopid}/${itemid}`,

    }),

  });



  if (!response.ok) {

    throw new Error('RapidAPI 商品查詢失敗');

  }



  const data = await response.json();

  return data;

}


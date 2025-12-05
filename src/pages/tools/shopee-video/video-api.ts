export async function generateVideoFromScript(data: any) {

  try {

    const res = await fetch('/api/generate-video', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        productUrl: `https://shopee.tw/product/${data.shopid || ''}/${data.itemid || ''}`,

        product: data,

      }),

    });



    if (!res.ok) {

      throw new Error('影片產生失敗');

    }



    const result = await res.json();

    return result.videoUrl;

  } catch (err: any) {

    console.error("video generate error", err);

    throw new Error("影片產生失敗");

  }

}


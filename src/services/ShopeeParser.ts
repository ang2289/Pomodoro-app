import axios from "axios";

export async function parseShopeeProduct(url: string) {
  // 使用 AllOrigins 公共 CORS Proxy
  const corsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  const html = await axios.get(corsUrl).then(res => res.data);

  const doc = new DOMParser().parseFromString(html, "text/html");

  const titleEl = doc.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
  const priceEl = doc.querySelector('meta[property="product:price:amount"]') as HTMLMetaElement | null;
  const imageEl = doc.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
  const title = titleEl?.content ?? "";
  const price = priceEl?.content ?? "";
  const image = imageEl?.content ?? "";

  return { title, price, image };
}




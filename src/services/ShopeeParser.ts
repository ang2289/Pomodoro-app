import axios from "axios";

export async function parseShopeeProduct(url: string) {
  // 使用 AllOrigins 公共 CORS Proxy
  const corsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  const html = await axios.get(corsUrl).then(res => res.data);

  const doc = new DOMParser().parseFromString(html, "text/html");

  const title = doc.querySelector('meta[property="og:title"]')?.content ?? "";
  const price = doc.querySelector('meta[property="product:price:amount"]')?.content ?? "";
  const image = doc.querySelector('meta[property="og:image"]')?.content ?? "";

  return { title, price, image };
}




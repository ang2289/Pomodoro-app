import axios from "axios";

export async function searchShopee(keyword: string) {
  const url = "https://shopee-e-commerce-data.p.rapidapi.com/search/items";

  const options = {
    method: "GET",
    url,
    params: {
      keyword,
      page: "1",
      country: "TW"
    },
    headers: {
      "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
      "X-RapidAPI-Host": import.meta.env.VITE_RAPIDAPI_HOST,
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.items; // 回傳商品列表
  } catch (error) {
    console.error("Shopee API ERROR:", error);
    return [];
  }
}


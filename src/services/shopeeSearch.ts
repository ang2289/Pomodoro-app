import axios from "axios";

export async function searchShopee(keyword: string) {
  // Debug log
  console.log("Shopee API Key:", import.meta.env.VITE_RAPIDAPI_KEY);
  console.log("Search keyword:", keyword);
  console.log("HOST 使用中:", import.meta.env.VITE_RAPIDAPI_HOST);

  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST || "shopee-e-commerce-data.p.rapidapi.com";
  
  if (!apiKey) {
    console.error("VITE_RAPIDAPI_KEY is undefined!");
    return [];
  }

  const url = "https://shopee-e-commerce-data.p.rapidapi.com/search/items";

  const options = {
    method: "GET",
    url,
    params: {
      keyword,
      page: "1",
      limit: "100",
      country: "TW"
    },
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost,
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


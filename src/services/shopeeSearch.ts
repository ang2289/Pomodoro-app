import axios from "axios";

const API_URL = "https://shopee-e-commerce-data.p.rapidapi.com/shopee/search/items/v2";
const API_HOST = "shopee-e-commerce-data.p.rapidapi.com";

export async function searchShopee(keyword: string) {
  const apiKey = import.meta.env.VITE_RAPIDAPI_SHOPEE_KEY;
  
  async function fetchPage(page: number) {
    const params = {
      keyword,
      page: page.toString(),
      pageSize: "30",
      by: "relevancy",
      order: "desc",
      site: "my"
    };

    const response = await axios.get(API_URL, {
      params,
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": API_HOST
      }
    });

    return response.data?.data?.items || [];
  }

  const allResults = [];

  const pagesToFetch = [1, 2, 3, 4];

  for (const p of pagesToFetch) {
    try {
      const items = await fetchPage(p);
      allResults.push(...items);
    } catch (err) {
      console.error("Error fetching page", p, err);
    }
  }

  return allResults.slice(0, 100);
}

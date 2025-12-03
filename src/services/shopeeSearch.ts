import axios from "axios";

export async function searchShopeeItems(keyword: string) {
  console.log("[service] keyword =", keyword);
  if (!keyword.trim()) return [];

  try {
    const res = await axios.get(`/api/shopee-search`, {
      params: { keyword },
    });

    console.log("[service] 收到筆數 =", res.data?.items?.length);
    return res.data?.items ?? [];
  } catch (error: any) {
    console.error("[service] API 錯誤", error?.response?.data || error.message);
    return [];
  }
}


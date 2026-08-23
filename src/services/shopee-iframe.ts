export async function parseShopeeViaIframe(_url: string): Promise<any> {
  // ⚠️ 已正式停用：Shopee 以 CSP 限制 iframe，被瀏覽器擋下且無法再讀取內容。
  // 請一律改用後端 /api/commerce (POST, action: "shopeeParse") 搭配 `shopeeParseApi.parseShopee`。
  throw new Error("Shopee 已禁止 iframe 解析，請改用後端 /api/commerce 解析商品");
}


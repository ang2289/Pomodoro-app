export function parseShopeeUrl(url: string) {

  try {

    const cleanUrl = url.split("?")[0]; 

    const parts = cleanUrl.split("/product/")[1];



    if (!parts) return null;



    const [shopid, itemid] = parts.split("/");



    if (!shopid || !itemid) return null;



    // 自動偵測 site 從網址
    let site = "tw";
    if (cleanUrl.includes("shopee.my")) site = "my";
    else if (cleanUrl.includes("shopee.ph")) site = "ph";
    else if (cleanUrl.includes("shopee.sg")) site = "sg";
    else if (cleanUrl.includes("shopee.com.tw")) site = "tw";
    else if (cleanUrl.includes("shopee.tw")) site = "tw";



    return {

      shopid,

      itemid,

      site

    };

  } catch (e) {

    return null;

  }

}


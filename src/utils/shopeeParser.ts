export function parseShopeeUrl(url: string) {

  try {

    // 支援兩種格式：
    // 1. https://shopee.tw/product/344095175/8554568924
    // 2. https://shopee.tw/i.344095175.8554568924

    const productMatch = url.match(/\/product\/(\d+)\/(\d+)/);

    if (productMatch) {

      return {

        shopid: productMatch[1],

        itemid: productMatch[2],

      };

    }



    const iMatch = url.match(/i\.(\d+)\.(\d+)/);

    if (iMatch) {

      return {

        shopid: iMatch[1],

        itemid: iMatch[2],

      };

    }



    return null;

  } catch (e) {

    return null;

  }

}


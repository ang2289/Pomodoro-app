import axios from "axios";



export async function fetchShopeeProduct(productUrl: string) {

  const match = productUrl.match(/product\/(\d+)\/(\d+)/);

  if (!match) throw new Error("網址格式錯誤");



  const shopid = match[1];

  const itemid = match[2];



  const endpoint =

    "https://shopee-e-commerce-data.p.rapidapi.com/shopee/item/get";



  const res = await axios.get(endpoint, {

    params: {

      itemid,

      shopid,

      site: "tw",

    },

    headers: {

      "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,

      "x-rapidapi-host": import.meta.env.VITE_RAPIDAPI_HOST,

    },

  });



  const data = res.data?.data?.item_basic || res.data?.data || {};



  return {

    title: data.name || '未知商品',

    price: data.price_min ? data.price_min / 100000 : (data.price || 0),

    image: data.image ? `https://cf.shopee.tw/file/${data.image}` : '',

  };

}


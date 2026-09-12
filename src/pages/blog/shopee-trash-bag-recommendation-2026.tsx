import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

type ShopeeProduct = {
  id: string;
  name: string;
  price: string;
  sales: string;
  shop: string;
  commissionRate: string;
  estimatedCommission: string;
  productUrl: string;
  affiliateUrl: string;
  note: string;
};

const products: ShopeeProduct[] = [
  {
    id: "22633798990",
    name: "淨新 原色垃圾袋 台灣製 垃圾袋 原色 彩色 垃圾袋子 塑膠袋 清潔袋【CC0440】",
    price: "3",
    sales: "30萬+",
    shop: "JOEKI 揪去購物",
    commissionRate: "0.50%",
    estimatedCommission: "$0.02",
    productUrl: "https://shopee.tw/product/9638994/22633798990",
    affiliateUrl: "https://s.shopee.tw/20rGCLl3fp",
    note: "單價低，適合想少量補貨、測試不同尺寸垃圾袋的人。",
  },
  {
    id: "21090452718",
    name: "塑料袋定做 印刷 logo 食品包裝 水果袋 方便袋 超市購物袋 外賣打包袋定製",
    price: "1",
    sales: "100萬+",
    shop: "麥樂生活館",
    commissionRate: "0.50%",
    estimatedCommission: "$0.01",
    productUrl: "https://shopee.tw/product/592880199/21090452718",
    affiliateUrl: "https://s.shopee.tw/2VnWnGj9ew",
    note: "適合小店、攤商、外帶包裝或需要客製袋子的使用情境。",
  },
  {
    id: "29257877715",
    name: "【平口袋】黑色垃圾袋 垃圾袋 塑膠袋 清潔袋 小垃圾袋 大垃圾袋 特大垃圾袋",
    price: "2",
    sales: "30萬+",
    shop: "Wayflex",
    commissionRate: "9.50%",
    estimatedCommission: "$0.19",
    productUrl: "https://shopee.tw/product/146950815/29257877715",
    affiliateUrl: "https://s.shopee.tw/2LU6axjmzv",
    note: "分潤率較高，尺寸選項多，適合整理成導購主推商品。",
  },
  {
    id: "20584879672",
    name: "全台最超值 台灣公司現貨 環保垃圾袋 清潔袋 家用垃圾袋 大垃圾袋",
    price: "6",
    sales: "40萬+",
    shop: "7822生活選物",
    commissionRate: "0.50%",
    estimatedCommission: "$0.03",
    productUrl: "https://shopee.tw/product/244636887/20584879672",
    affiliateUrl: "https://s.shopee.tw/BPc0ys2OW",
    note: "主打台灣現貨與家用清潔，適合放在家庭補貨清單。",
  },
  {
    id: "25144659",
    name: "奈米家族 環保垃圾袋 加厚 圓底封口 耐承重 環保清潔袋 車用垃圾袋",
    price: "13",
    sales: "200萬+",
    shop: "艾比百貨",
    commissionRate: "6.50%",
    estimatedCommission: "$0.85",
    productUrl: "https://shopee.tw/product/5321159/25144659",
    affiliateUrl: "https://s.shopee.tw/16BofsfjV",
    note: "銷量高、分潤金額也較好，適合做文章中的重點推薦。",
  },
];

const pagePath = "/blog/shopee-trash-bag-recommendation-2026";

function formatPrice(value: string) {
  return value ? `NT$${value} 起` : "依蝦皮頁面為準";
}

export default function ShopeeTrashBagRecommendation2026Page() {
  const bestCommission = [...products].sort(
    (a, b) =>
      Number(b.estimatedCommission.replace(/[^0-9.]/g, "")) -
      Number(a.estimatedCommission.replace(/[^0-9.]/g, "")),
  )[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "2026 蝦皮垃圾袋與塑膠袋推薦",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: product.affiliateUrl,
    })),
  };

  return (
    <>
      <SEO
        title="2026 蝦皮垃圾袋推薦｜家用清潔袋、塑膠袋與小資補貨清單"
        description="整理蝦皮高銷量垃圾袋、塑膠袋與清潔袋商品，包含價格、銷量、分潤率與使用情境，適合租屋族、家庭日用品補貨參考。"
        path={pagePath}
        keywords="蝦皮垃圾袋推薦, 垃圾袋推薦, 便宜垃圾袋, 家用垃圾袋, 塑膠袋推薦, 清潔袋推薦, 蝦皮日用品"
        ogType="article"
        jsonLd={jsonLd}
      />

      <main className="bg-slate-50 px-4 py-10 text-slate-900">
        <article className="mx-auto max-w-5xl">
          <Link to="/blog" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
            回部落格
          </Link>

          <header className="mt-5 border-b border-slate-200 pb-8">
            <p className="text-sm font-bold text-orange-700">蝦皮分潤導購</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-normal text-slate-950 md:text-5xl">
              2026 蝦皮垃圾袋推薦：家用清潔袋、塑膠袋與小資補貨清單
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 md:text-lg">
              垃圾袋、塑膠袋、清潔袋看起來單價低，但家庭、租屋族、小店家都會重複補貨。
              這篇整理蝦皮聯盟匯出的高銷量商品，幫你快速比較價格、銷量與適合情境。
            </p>
            <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              本文含蝦皮推廣連結，透過連結購買可能讓本站獲得分潤。商品價格、庫存、活動與運費會變動，請以蝦皮商品頁面顯示為準。
            </p>
          </header>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-sm text-slate-500">本篇整理</div>
              <div className="mt-2 text-3xl font-black">{products.length} 款</div>
              <p className="mt-2 text-sm text-slate-600">垃圾袋、塑膠袋與清潔袋</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-sm text-slate-500">最高銷量</div>
              <div className="mt-2 text-3xl font-black">200萬+</div>
              <p className="mt-2 text-sm text-slate-600">適合做長期補貨推薦</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="text-sm text-slate-500">分潤較佳</div>
              <div className="mt-2 text-3xl font-black">{bestCommission.commissionRate}</div>
              <p className="mt-2 text-sm text-slate-600">{bestCommission.shop}</p>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black text-slate-950">怎麼挑垃圾袋與塑膠袋？</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-bold">家用補貨</h3>
                <p className="mt-2 leading-7 text-slate-700">
                  優先看尺寸、耐重、是否容易破，以及是否有現貨。廚房與浴室通常可以分開買不同尺寸。
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-bold">小店與攤商</h3>
                <p className="mt-2 leading-7 text-slate-700">
                  若需要包裝袋、外帶袋或 logo 印刷，客製塑膠袋會比一般垃圾袋更適合。
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black text-slate-950">蝦皮垃圾袋與塑膠袋清單</h2>
            <div className="mt-5 space-y-5">
              {products.map((product, index) => (
                <div key={product.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-sm font-bold text-orange-700">推薦 {index + 1}</div>
                      <h3 className="mt-2 text-xl font-black leading-8 text-slate-950">{product.name}</h3>
                      <p className="mt-3 leading-7 text-slate-700">{product.note}</p>
                    </div>
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center rounded-md bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-700"
                    >
                      看蝦皮優惠
                    </a>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">價格</dt>
                      <dd className="mt-1 font-bold">{formatPrice(product.price)}</dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">銷售量</dt>
                      <dd className="mt-1 font-bold">{product.sales}</dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">店家</dt>
                      <dd className="mt-1 font-bold">{product.shop}</dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">分潤率</dt>
                      <dd className="mt-1 font-bold">{product.commissionRate}</dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">推廣分潤</dt>
                      <dd className="mt-1 font-bold">{product.estimatedCommission}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-2xl font-black text-slate-950">本站推薦優先看哪一款？</h2>
            <p className="mt-3 leading-8 text-slate-700">
              如果是單純家用補貨，可以先看銷量高、分潤也較好的「奈米家族 環保垃圾袋」；
              如果要做導購內容，則可以把「平口袋黑色垃圾袋」與「奈米家族」放在文章前段，
              因為兩者的分潤率相對較高，比較適合長期經營 SEO 流量。
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black text-slate-950">常見問題</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="font-bold">蝦皮垃圾袋價格為什麼這麼低？</h3>
                <p className="mt-2 leading-7 text-slate-700">
                  很多商品會用規格、尺寸、數量做不同價格，列表價格通常是最低規格起跳，實際購買前要看商品頁選項。
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="font-bold">分潤率越高就一定越值得推嗎？</h3>
                <p className="mt-2 leading-7 text-slate-700">
                  不一定。還要看銷量、商品需求、價格、是否容易退貨，以及文章讀者是否真的需要。
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

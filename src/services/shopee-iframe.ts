export async function parseShopeeViaIframe(url: string): Promise<any> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;

    // 設置超時處理（10秒後如果還沒載入完成，就清除 iframe 並返回空結果）
    const timeout = setTimeout(() => {
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch (e) {
        // 忽略移除錯誤
      }
      resolve({ title: "", price: "", image: "" });
    }, 10000);

    document.body.appendChild(iframe);

    iframe.onload = () => {
      clearTimeout(timeout);
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;

        if (!doc) {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve({ title: "", price: "", image: "" });
          return;
        }

        const title =
          doc.querySelector("meta[property='og:title']")?.getAttribute("content") ||
          doc.querySelector("title")?.innerText ||
          "";

        const image =
          doc.querySelector("meta[property='og:image']")?.getAttribute("content") ||
          "";

        let price = "";
        const html = doc.documentElement.innerHTML;
        const priceJson = html.match(/"price":"([\d.]+)"/);
        if (priceJson) price = priceJson[1];

        resolve({
          title: title.replace(" | Shopee", "").trim(),
          price,
          image,
        });
      } catch (err) {
        console.error("iframe 解析錯誤:", err);
        resolve({ title: "", price: "", image: "" });
      } finally {
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        } catch (e) {
          // 忽略移除錯誤
        }
      }
    };

    // 處理 iframe 載入錯誤
    iframe.onerror = () => {
      clearTimeout(timeout);
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch (e) {
        // 忽略移除錯誤
      }
      resolve({ title: "", price: "", image: "" });
    };
  });
}


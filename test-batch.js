fetch("http://localhost:3006/generate-batch-video", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tasks: [
      {
        title: "測試商品",
        imageUrls: [
          "https://picsum.photos/800/800",
          "https://picsum.photos/801/800",
        ],
      },
    ],
  }),
})
  .then(async (r) => {
    const text = await r.text(); // 🔥 先看原始回傳
    console.log("RAW RESPONSE:", text);

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("❌ 不是JSON");
      throw e;
    }
  })
  .then((d) => {
    console.log("✅ 成功:", d);
  })
  .catch((e) => {
    console.error("❌ 錯誤:", e);
  });

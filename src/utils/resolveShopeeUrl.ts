export async function resolveShopeeShortUrl(
  shortUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    return response.url;
  } catch (error) {
    console.error("短網址展開失敗", error);
    return null;
  }
}

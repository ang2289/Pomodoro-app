/**
 * LINE Creators Market 公開販售前的「已輸入文字」風險提示。
 * 這不是圖片 OCR，也不是 LINE 官方審核：不能判斷母圖內額外生成的文字／商標。
 */
export type StickerSaleRisk = {
  index: number;
  text: string;
  replacement: string;
  reason: string;
};

const AD_PATTERN = /預購|特價|促銷|限量|限時|折扣|折價|優惠|買一送一|滿額|免運|清倉|立即購買|立即下單|官方網站|加入會員|新品上市|開幕優惠|訂購連結|現折|下殺|全館|倒數/;
const CONTACT_PATTERN = /https?:\/\/|www\.|(?:LINE\s*ID|加賴|加LINE|加好友|掃碼|QR\s*CODE|電話[:：]|手機[:：])/i;
const FALLBACK_TEXTS = ["謝謝支持", "祝福滿滿", "幸福滿滿", "今天好開心", "心意滿滿", "感謝喜歡"];

export function stickerSaleTextRisks(texts: string[]): StickerSaleRisk[] {
  return texts.flatMap((raw, index) => {
    const text = raw.trim();
    if (!text) return [];
    const isContact = CONTACT_PATTERN.test(text);
    if (!isContact && !AD_PATTERN.test(text)) return [];
    return [{
      index,
      text,
      replacement: suggestSaleFriendlyText(text, index),
      reason: isContact ? "含網址、聯絡方式或引導加入好友" : "可能屬於商品、價格或活動促銷文字",
    }];
  });
}

export function suggestSaleFriendlyText(raw: string, index = 0): string {
  const text = raw.trim();
  if (!CONTACT_PATTERN.test(text) && !AD_PATTERN.test(text)) return text;
  if (text.includes("情人節")) return "情人節快樂";
  if (text.includes("母親節")) return "母親節快樂";
  if (text.includes("父親節")) return "父親節快樂";
  if (text.includes("聖誕")) return "聖誕快樂";
  if (text.includes("新年")) return "新年快樂";
  if (text.includes("中秋")) return "中秋快樂";
  if (text.includes("花材") || text.includes("花束")) return "花香滿滿";
  return FALLBACK_TEXTS[index % FALLBACK_TEXTS.length];
}

export function suggestSaleFriendlyLines(texts: string[]): string[] {
  return texts.map((text, index) => suggestSaleFriendlyText(text, index));
}

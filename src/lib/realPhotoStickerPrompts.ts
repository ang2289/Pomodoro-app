/** 真人照片貼圖子模式。只產生提示詞，不處理或上傳照片。 */
export type RealPhotoSubMode = "unchanged" | "expressive";

export const REAL_PHOTO_SUBMODE_OPTIONS: ReadonlyArray<{
  value: RealPhotoSubMode;
  label: string;
  description: string;
}> = [
  {
    value: "unchanged",
    label: "保留照片原貌（不產生新表情）",
    description: "使用原照片裁切、去背、縮放及排版；只有一張照片可重複搭配不同文字。",
  },
  {
    value: "expressive",
    label: "真人照片延伸多表情（可產生不同動作）",
    description: "以授權照片為唯一人物參考，延伸自然表情、角度與動作，維持寫實風格。",
  },
];

const PHOTO_AUTH = "只使用本人或已取得當事人／監護人適當授權的真人照片，尤其寶寶與兒童照片須注意隱私；未附參考照片時，先請使用者附上，不得憑空創造另一位主角。";

export const REAL_PHOTO_VARIETY =
  "表情範例：開懷大笑、微笑、驚訝、委屈、想睡、開心、調皮眨眼、好奇、撒嬌、感謝、害羞、期待。" +
  "動作範例：揮手、拍手、握拳加油、比讚、抱玩偶、喝奶、揉眼睛、抱枕頭、雙手托臉、轉頭、趴著、坐著。" +
  "請依每格短句語意選擇明顯不同的表情、頭部角度與安全日常動作；不是隨機分配。動作需符合照片人物年齡、發育能力與安全性，寶寶不可安排站立、危險姿勢或不安全道具。" +
  "允許使用安全的奶瓶、玩偶、枕頭及小毯子，但不要遮擋臉孔。若參考照片只有臉部，延伸身體仍需符合真實嬰幼兒頭身比例及肢體結構；不可多手、多腳、多指、畸形或異常五官。";

const UNCHANGED = {
  label: "保留照片原貌",
  summary: "原始真人照片不變，僅進行照片裁切、去背、縮放、留白、文字與裝飾排版；不得重新繪製人物，不改變原始臉孔、表情、動作、年齡或衣著。",
  role: "請直接使用使用者提供的一張或多張原始真人照片製作貼圖。每格只使用原照片中的表情與姿勢；允許重複使用同一張照片，搭配不同文字、圖框及可愛裝飾。不得透過 AI 重新生成真人臉孔，不得製造原照片不存在的表情或動作。沒有照片時，先要求附上照片。",
  reminder: PHOTO_AUTH + "這是原貌模式，不應透過 AI 重繪人物；若交給會生成圖像的 AI 排版，仍要逐張檢查是否擅自修改照片。希望完全保持原貌時，應使用原照片直接去背與排版。",
  identity: "整套僅貼入同一位真人的原始照片；不可變更原照片五官、表情、髮型、姿勢、年齡、衣著及膚色；允許同一照片重複出現並變化文字與裝飾。",
  variation: "只變化每格的短句、背景留白及安全裝飾。不可變更人物原照片的表情、角度或動作。",
  stable: "每格使用原照片的既有表情與姿勢。若只有一張照片，可重複使用；只調整排版、留白、文字或裝飾。禁止重新繪畫或虛構動作。",
  secondSheet: "這是同一套真人原貌貼圖的後續母圖。請在同一個 AI 對話同時附上「原始真人照片」及「第 1 張已完成母圖」。沿用同一批原照片、字型、顏色與安全留白，只更換指定文字與裝飾，不生成新表情或動作。單憑文字敘述不足以確保原貌。",
  visual: "真實照片剪貼排版，照片保持原貌，不轉 Q 版、不改臉，不新增不存在的表情與動作，只做去背、縮放、留白與文字裝飾",
  flavor: "貼圖文字與裝飾可以活潑親切，但原始照片及人物表情一律不變。",
} as const;

const EXPRESSIVE = {
  label: "真人照片延伸多表情",
  summary: "以一張或多張本人授權照片作為唯一身份參考，在寫實照片風格下合理延伸自然表情、頭部角度與動作；可加入安全日常道具；同一位人物、不同短句需有明顯不同演出。AI 可能改變細節，無法保證與原照片百分之百相同。",
  role: "以使用者上傳的原始真人照片作為唯一人物身份參考。盡可能保留相同臉型、五官比例、膚色、髮型、髮際線及實際年齡特徵，整套都應像同一位真實人物。維持寫實攝影質感，不轉 Q 版、漫畫或卡通。明確允許 AI 自然延伸原照片中沒有的新表情、頭部角度與動作；每格依短句語意有明顯差異，禁止每格只是同一個表情換文字。若只有一張臉部照片，也可合理補足符合年齡的身體、姿態與安全日常道具，但不得將寶寶變成成人身形，不增加其他主角。若沒有附上參考真人照片，先請使用者提供，不能假裝已有照片。",
  reminder: PHOTO_AUTH + "AI 會依照片延伸新的表情與動作，可能產生與原照片不同的細節。若必須完全維持原貌，請改選照片原貌模式。生成結果請逐格人工確認人物辨識度與嬰幼兒安全。",
  identity: "整套以同一張或同一組真人照片鎖定主角身份、臉型、眼睛、鼻子、嘴型比例、髮型、膚色及年齡；允許自然變換表情、視線、頭部角度、手勢與安全姿勢，不要固定成原始照片的單一表情。禁止換成陌生人物或增加其他主角；寫實攝影，不 Q 版化。",
  variation: REAL_PHOTO_VARIETY,
  stable: "以相同真人參考照片生成多樣自然表情、頭部角度與符合年齡的安全日常動作；同一個人的五官與年齡保持辨識度。不要每格固定相同表情與姿勢。",
  secondSheet: "這是同一套真人照片延伸多表情貼圖的第 2 張或後續母圖。請在同一個 AI 對話同時附上「原始真人照片」及「第 1 張已完成母圖」兩種參考。原照片用於人物身份、五官與年齡鎖定，第 1 張用於寫實畫風、服裝配色、字型與版面一致。第 2 張沿用同一主角，但短句、表情、頭部角度與動作不得重複第 1 張；不要把第 1 張母圖當成重新創造人物臉孔的唯一參考。AI 無法保證臉孔百分之百一致。",
  visual: "真人寫實攝影風貼圖，依原照片延伸自然不同的表情、頭部角度與動作；同一位真人、真實嬰幼兒比例，不轉 Q 版或漫畫",
  flavor: "真實自然表情與安全日常動作，畫面活潑、排版乾淨；不轉 Q 版、不改成人卡通比例。",
} as const;

export function realPhotoPolicy(mode: RealPhotoSubMode) {
  return mode === "expressive" ? EXPRESSIVE : UNCHANGED;
}

/** 依短句語意，穩定挑選不同的「表情＋動作」，連續 24 格盡量不重複。 */
const PROFILES = [
  { expression: "微笑", action: "揮手", words: /早安|午安|晚安|你好|嗨|哈囉|招呼/ },
  { expression: "開懷大笑", action: "拍手", words: /哈哈|好笑|太棒|超讚|開心|快樂|耶/ },
  { expression: "驚訝", action: "轉頭", words: /哇|驚|真的|什麼|天啊|怎麼/ },
  { expression: "委屈", action: "抱玩偶", words: /難過|哭|委屈|失落|嗚|不要/ },
  { expression: "想睡", action: "揉眼睛", words: /晚安|睏|好累|睡|休息|疲倦/ },
  { expression: "開心", action: "比讚", words: /好的|好喔|收到|可以|沒問題|成功/ },
  { expression: "調皮眨眼", action: "雙手托臉", words: /嘿嘿|調皮|玩|嘻|秘密|偷笑/ },
  { expression: "好奇", action: "微微轉頭", words: /嗎|呢|為什麼|請問|好奇|找誰/ },
  { expression: "撒嬌", action: "抱枕頭", words: /抱抱|想你|愛你|親親|撒嬌/ },
  { expression: "感謝", action: "雙手輕靠胸前", words: /謝謝|感謝|辛苦|麻煩|多謝/ },
  { expression: "害羞", action: "低頭偷笑", words: /害羞|不好意思|羞|臉紅/ },
  { expression: "期待", action: "坐著微微前傾", words: /期待|等你|快來|明天|準備/ },
  { expression: "開心", action: "握拳加油", words: /加油|努力|衝|打氣|應援/ },
  { expression: "微笑", action: "抱小毯子", words: /平安|保重|幸福|溫暖|安心/ },
  { expression: "驚訝", action: "拍一下手掌", words: /完成|達成|太好了|厲害/ },
  { expression: "好奇", action: "坐著看向旁邊", words: /等等|稍等|看一下|確認|想想/ },
  { expression: "調皮眨眼", action: "揮動小手", words: /再見|掰掰|拜拜|下次/ },
  { expression: "撒嬌", action: "輕抱玩偶", words: /陪我|在嗎|陪伴|不要走/ },
  { expression: "期待", action: "伸出小手", words: /禮物|驚喜|生日|許願/ },
  { expression: "感謝", action: "拍手致意", words: /恭喜|祝福|祝你|節日/ },
  { expression: "想睡", action: "抱枕頭側臉", words: /晚點|慢慢|休息一下/ },
  { expression: "害羞", action: "雙手托臉微笑", words: /可愛|喜歡|讚美|好棒/ },
  { expression: "開懷大笑", action: "坐著拍手", words: /聚會|一起|見面|開趴/ },
  { expression: "微笑", action: "抱玩偶坐著", words: /吃飯|吃飽|奶奶|喝奶|肚子餓/ },
] as const;

export function buildExpressiveCellPlan(lines: string[], startIndex = 0): string {
  const used = new Set<number>();
  // 24 張方案：第 1 張 16 格使用 0～15；第 2 張 8 格使用 16～23。
  // 即使兩張有相近短句，也不會重複同一組「表情＋動作」。
  const pool = startIndex === 0 && lines.length === 16
    ? PROFILES.map((_, i) => i).slice(0, 16)
    : startIndex === 16 && lines.length === 8
      ? PROFILES.map((_, i) => i).slice(16, 24)
      : PROFILES.map((_, i) => i);
  return lines.map((sentence, localIndex) => {
    const globalIndex = startIndex + localIndex;
    const matches = pool.filter(index => PROFILES[index].words.test(sentence) && !used.has(index));
    const idx = matches.length
      ? matches.reduce((best, index) => Math.abs(index - (globalIndex % PROFILES.length)) < Math.abs(best - (globalIndex % PROFILES.length)) ? index : best)
      : pool.find(index => index >= globalIndex % PROFILES.length && !used.has(index))
        ?? pool.find(index => !used.has(index))
        ?? pool[globalIndex % pool.length];
    used.add(idx);
    const {expression, action} = PROFILES[idx];
    return `第 ${globalIndex + 1} 格「${sentence}」：${expression}＋${action}；頭部角度、眼神及手勢須與相鄰格有區別，演出符合短句語意及人物年齡。`;
  }).join("\n");
}

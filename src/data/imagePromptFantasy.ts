/**
 * RXV AI 生圖提示詞擴充 — 純前端資料，固定 6 類 × 8 組。
 * 不涉及 AI API、真人照片上傳、圖片儲存或任何資料庫操作。
 */
export type FantasyCategory = "dreamPrincess" | "underwaterPrincess" | "bobblehead" | "photoBobblehead" | "flowerFairy" | "miniFairyWorld";
export type FantasyOptionKey = "person" | "visualStyle" | "clothing" | "expression" | "pose" | "background" | "palette";
export type FantasyOptions = Record<FantasyOptionKey, string>;
export type FantasyTheme = {
  id: string;
  category: FantasyCategory;
  categoryLabel: string;
  title: string;
  description: string;
  scene: string;
  defaults: FantasyOptions;
  fullPrompt: string;
};
type SeriesSource = {
  key: FantasyCategory; label: string; intro: string;
  themes: [title: string, scene: string, background: string][];
};
const series: SeriesSource[] = [
  {
    "key": "dreamPrincess",
    "label": "夢幻公主",
    "intro": "童話夢幻公主系列，華麗禮服與不同光影場景",
    "themes": [
      [
        "童話城堡公主",
        "立於高聳夢幻城堡的水晶階梯，金色晨光穿過尖塔彩窗，珠寶禮服閃著細緻光點",
        "城堡"
      ],
      [
        "秘密花園公主",
        "在繁花拱門與噴泉間漫步，花瓣飄落，裙擺與藤蔓交織成浪漫層次",
        "花園"
      ],
      [
        "冰雪王國公主",
        "在雪花飄舞的極光冰宮前，晶透冰柱與細緻雪晶折射藍銀色光",
        "冰雪城堡"
      ],
      [
        "銀河星空公主",
        "星河環繞的空中宮殿與星塵絲帶，禮服鑲嵌微光星點",
        "星空"
      ],
      [
        "珍珠海岸公主",
        "月色映照珍珠貝殼與海霧的海岸宮殿，珠光薄紗飄逸",
        "珍珠海岸"
      ],
      [
        "水晶琉璃公主",
        "彩色水晶柱與鏡面大廳形成透亮折射，水晶冠冕精巧",
        "水晶宮殿"
      ],
      [
        "櫻花春日公主",
        "粉櫻樹下微風吹動長裙，花雨與清晨薄霧營造春日童話",
        "櫻花花園"
      ],
      [
        "夢幻宮廷舞會",
        "燭光宮廷大廳的水晶吊燈與旋轉裙襬，華麗優雅舞會氛圍",
        "舞會大廳"
      ]
    ]
  },
  {
    "key": "underwaterPrincess",
    "label": "水下夢幻公主",
    "intro": "清澈水下攝影感、漂浮裙擺與真實水體光影",
    "themes": [
      [
        "水下花仙子",
        "水中花瓣如漂浮花海，薄紗禮服像水波展開，水紋打光真實",
        "水下花園"
      ],
      [
        "漂浮夢幻禮服",
        "輕盈長裙在水中自然展開並跟隨水流，姿態優雅，水泡細緻",
        "透明水下"
      ],
      [
        "透明氣泡公主",
        "成串透明氣泡帶有真實折射與微小高光，公主被柔和氣泡包圍",
        "氣泡海洋"
      ],
      [
        "海底秘密花園",
        "珊瑚與海葵形成繽紛花園，魚群從裙擺遠方穿越",
        "海底花園"
      ],
      [
        "水晶藍色海洋",
        "清澈深藍海水、水晶般折射與柔和光柱，飄逸絲帶圍繞公主",
        "水晶海洋"
      ],
      [
        "陽光穿透水面",
        "上方陽光形成水下焦散光斑，絲質長裙隨水流伸展",
        "陽光水下"
      ],
      [
        "珊瑚仙境公主",
        "粉紫珊瑚拱門和細小熱帶魚，光線穿過淺海水層",
        "珊瑚仙境"
      ],
      [
        "夢幻深海之光",
        "深海藍色背景與溫柔生物螢光，禮服似流動銀河",
        "夢幻深海"
      ]
    ]
  },
  {
    "key": "bobblehead",
    "label": "Q 版塑膠搖頭公仔",
    "intro": "原創 PVC 搖頭公仔，真實量產玩具質感與彈簧脖子",
    "themes": [
      [
        "花仙子搖頭公仔",
        "可愛花瓣髮飾與花仙子服裝，手持小花束，擺放在圓形底座",
        "收藏展示台"
      ],
      [
        "夢幻公主搖頭公仔",
        "小巧皇冠與公主裙，展示盒旁有柔和珠光點綴",
        "收藏展示台"
      ],
      [
        "春夏秋冬四季公仔",
        "四季元素選一季呈現在服裝與透明底座裝飾，塑膠塗裝細緻",
        "收藏展示台"
      ],
      [
        "動物裝扮公仔",
        "穿著軟萌兔耳與動物連帽服，塑膠玩具角色設計完整",
        "純白棚拍"
      ],
      [
        "守護天使公仔",
        "迷你翅膀與溫暖笑容，玩具配件以模製塑膠呈現",
        "收藏展示台"
      ],
      [
        "生日驚喜公仔",
        "派對帽、生日禮物與小蛋糕道具，收藏禮物棚拍",
        "純白棚拍"
      ],
      [
        "職業品牌公仔",
        "搭配專屬職業道具與制服，辦公用桌上型搖頭公仔",
        "辦公室"
      ],
      [
        "限量收藏展示公仔",
        "可見精緻底座與玩具量產細節，燈光強調塑膠表面與實體質感",
        "收藏展示台"
      ]
    ]
  },
  {
    "key": "photoBobblehead",
    "label": "真人照片變公仔",
    "intro": "可選真人照片參考或原創角色，著重相貌神韻與商品棚拍",
    "themes": [
      [
        "粉色西裝個人公仔",
        "粉色西裝、俐落職場造型，迷你公仔站在乾淨展示底座",
        "純白棚拍"
      ],
      [
        "房仲專屬公仔",
        "正式襯衫與房屋模型道具，呈現房仲個人品牌識別",
        "辦公室"
      ],
      [
        "老師紀念公仔",
        "拿著書本與小黑板的教育職業造型，親切微笑",
        "純白棚拍"
      ],
      [
        "美容師形象公仔",
        "美容工作服搭配柔和配色的美容保養道具，收藏攝影風",
        "純白棚拍"
      ],
      [
        "業務顧問公仔",
        "商務西裝與平板文件配件，專業卻活潑的展示玩具",
        "辦公室"
      ],
      [
        "情侶雙人公仔",
        "兩位人物相依站立，各自具有獨立大頭與彈簧脖子，情侶紀念底座",
        "收藏展示台"
      ],
      [
        "全家福家庭公仔",
        "家庭人物形成溫馨團體玩具展示，每人分離可辨的頭部彈簧",
        "收藏展示台"
      ],
      [
        "生日禮物紀念公仔",
        "生日服裝與禮物緞帶，作為有紀念價值的實體商品棚拍",
        "純白棚拍"
      ]
    ]
  },
  {
    "key": "flowerFairy",
    "label": "夢幻花仙子",
    "intro": "柔和花卉、清透光影與仙子翅膀的夢幻角色",
    "themes": [
      [
        "紫藤花仙子",
        "紫藤花瀑如垂簾環繞，微小翅膀與淡紫光霧，裙襬輕盈",
        "紫藤花園"
      ],
      [
        "櫻花仙子",
        "粉色櫻花飛舞，花冠和透光裙擺在春日微風中展開",
        "櫻花花園"
      ],
      [
        "玫瑰仙子",
        "層疊玫瑰與晶瑩露珠，玫瑰色薄紗禮服自然垂落",
        "玫瑰花園"
      ],
      [
        "繡球花仙子",
        "藍紫繡球花球與花瓣脈絡清晰，花朵比人物略大形成童話比例",
        "繡球花園"
      ],
      [
        "森林綠意仙子",
        "苔蘚樹根、蘑菇與蕨葉，晨光穿透森林，仙子守護新芽",
        "森林花園"
      ],
      [
        "晨露精靈仙子",
        "晨露凝在嫩葉與花瓣，透明翅膀帶有水珠反射",
        "晨露花園"
      ],
      [
        "蝴蝶花仙子",
        "彩色蝴蝶在周圍飛舞，仙子穿著蝴蝶花瓣裙並舉起雙手",
        "蝴蝶花園"
      ],
      [
        "月光夜色仙子",
        "銀藍月光映照夜色花叢，翅膀與銀白花瓣散發柔光",
        "月光花園"
      ]
    ]
  },
  {
    "key": "miniFairyWorld",
    "label": "夢幻花仙子 × 迷你分身",
    "intro": "參考紫藤水晶泡泡世界：一位童話娃娃主角與數位同造型迷你自己互動，角色一致且構圖各不相同",
    "themes": [
      [
        "紫藤水晶泡泡迷你分身",
        "主角是長髮紫眸的原創夢幻花仙子娃娃，穿紫藤花薄紗裙，近景伸手朝向鏡頭；五個同臉型、同髮色、同花冠的小小迷你自己分別坐在髮頂、肩膀、泡泡與花朵上，表情各異。背景彷彿水下透光的紫藤花廊，水面折射、透明氣泡與粉紫光斑層層交錯；大主角臉清晰，周圍迷你分身完整可見，畫面有近大遠小的深度",
        "紫藤水晶泡泡仙境"
      ],
      [
        "櫻花雲端迷你仙子",
        "奶油粉櫻花雲海，花仙子坐在半透明雲朵邊緣，四位與大主角同髮型、同服裝的小仙子在漂浮櫻花瓣上玩耍或揮手；側面景深構圖，粉白暖光，雲霧朦朧，主角不是對鏡頭伸手",
        "櫻花雲端"
      ],
      [
        "玫瑰玻璃溫室小分身",
        "大主角倚靠玫瑰玻璃溫室的拱窗微笑，六位相同造型的迷你花仙子在玫瑰、玻璃杯與藤葉上捉迷藏；清晰的玻璃反射、晨光與粉玫瑰細節，採半身斜側構圖，避免大主角手掌遮住臉",
        "玫瑰玻璃花房"
      ],
      [
        "月光螢火精靈夥伴",
        "銀紫月光下的大主角花仙子坐於發光蘑菇上，五位同角色迷你自己分布在螢火蟲光團、樹葉和小蕈菇上；夜色藍紫與金色微光，主角俯視迷你角色並輕輕伸指互動，畫面如童話繪本",
        "月光螢火森林"
      ],
      [
        "晨露花瓣小小世界",
        "綠色清晨花園的微距視角，大主角側身凝視巨大的透明露珠，三位同臉迷你版站在葉尖、露珠內側與花心，彼此向她揮手；柔亮綠粉色、露珠折射與真實花瓣紋理，構圖從葉片前景引向人物",
        "晨露微距花園"
      ],
      [
        "星河水晶魔法分身",
        "主角披著藍紫星光斗篷在星空水晶台階旋轉，七位同造型迷你自己分站在浮空小星星與透明水晶柱上，模仿主角旋轉、比心和眨眼；廣角舞台與遠景銀河，整體璀璨但臉部辨識清晰",
        "星河水晶舞台"
      ],
      [
        "冰雪花冠迷你公主",
        "冰藍童話城堡前，主角穿白銀雪花紗裙坐在雪花鞦韆上，四位相同角色的小仙子搭乘冰晶泡泡在附近飛舞；冷藍雪景與溫柔桃粉臉頰形成對比，低角度仰望構圖，身體肢體正常",
        "冰雪花冠宮殿"
      ],
      [
        "夕陽湖面倒影小仙子",
        "淡粉金色夕陽湖畔，主角花仙子在湖面小舟上伸出手指，五位同人物迷你自己在蓮花、飄浮小紙船和透明泡泡上互動；湖面金色倒影、粉紫晚霞、逆光髮絲，橫向空間感與遠近層次鮮明",
        "夕陽蓮花湖"
      ]
    ]
  }
];

export const FANTASY_SERIES = series.map(({ key, label, intro }) => ({ key, label, intro }));

const people = ["原創女性", "男性", "女孩", "男孩", "長輩", "情侶", "雙人"];
const smiles = ["微笑", "燦爛笑容", "眨眼", "可愛", "溫柔"];
const palette = ["粉色", "紫色", "藍色", "金色", "白色", "粉嫩漸層"];
export const FANTASY_OPTIONS: Record<FantasyCategory, Record<FantasyOptionKey, string[]>> = {
  dreamPrincess: {
    person: people, visualStyle: ["夢幻藝術", "真人寫實", "Q 版"],
    clothing: ["公主禮服", "婚紗", "花仙子裙"], expression: smiles,
    pose: ["站立", "坐姿", "比愛心", "揮手"],
    background: ["城堡", "花園", "冰雪城堡", "星空", "珍珠海岸", "水晶宮殿", "櫻花花園", "舞會大廳"],
    palette,
  },
  underwaterPrincess: {
    person: people, visualStyle: ["夢幻藝術", "真人寫實"],
    clothing: ["漂浮公主禮服", "花仙子裙", "婚紗"], expression: smiles,
    pose: ["漂浮", "水中坐姿", "優雅伸展", "比愛心"],
    background: ["水下花園", "透明水下", "氣泡海洋", "海底花園", "水晶海洋", "陽光水下", "珊瑚仙境", "夢幻深海"],
    palette: ["粉色", "紫色", "藍色", "白色", "粉嫩漸層"],
  },
  bobblehead: {
    person: people, visualStyle: ["PVC 塑膠公仔", "實體商品棚拍", "Q 版"],
    clothing: ["公主禮服", "花仙子裙", "職業套裝", "休閒服"],
    expression: smiles, pose: ["站立", "坐姿", "比愛心", "揮手"],
    background: ["純白棚拍", "收藏展示台", "辦公室"], palette,
  },
  photoBobblehead: {
    person: ["依照片人物", ...people], visualStyle: ["PVC 塑膠公仔", "實體商品棚拍", "Q 版"],
    clothing: ["依照片服裝", "職業套裝", "婚紗", "休閒服", "公主禮服"],
    expression: smiles, pose: ["站立", "坐姿", "比愛心", "揮手"],
    background: ["純白棚拍", "收藏展示台", "辦公室"], palette,
  },
  flowerFairy: {
    person: people, visualStyle: ["夢幻藝術", "真人寫實", "Q 版"],
    clothing: ["花仙子裙", "公主禮服", "婚紗"], expression: smiles,
    pose: ["站立", "坐姿", "比愛心", "揮手", "漂浮"],
    background: ["紫藤花園", "櫻花花園", "玫瑰花園", "繡球花園", "森林花園", "晨露花園", "蝴蝶花園", "月光花園"],
    palette,
  },
  miniFairyWorld: {
    person: ["原創女性", "女孩", "男性", "男孩", "長輩", "情侶", "雙人"],
    visualStyle: ["3D 童話娃娃插畫", "夢幻藝術", "Q 版", "精緻 2.5D 插畫"],
    clothing: ["花仙子裙", "公主禮服", "蕾絲薄紗洋裝", "水晶花冠禮服"],
    expression: smiles,
    pose: ["向鏡頭伸手", "坐姿", "與迷你版互動", "揮手", "比愛心", "優雅漂浮"],
    background: ["紫藤水晶泡泡仙境", "櫻花雲端", "玫瑰玻璃花房", "月光螢火森林", "晨露微距花園", "星河水晶舞台", "冰雪花冠宮殿", "夕陽蓮花湖"],
    palette: ["粉紫色", "粉色", "紫色", "藍色", "金色", "白色", "粉嫩漸層"],
  },
};

export function composeFantasyPrompt(
  theme: Pick<FantasyTheme, "title" | "category" | "scene">,
  options: FantasyOptions,
  ratio: string = "9:16",
  useReferencePhoto = false,
  variation = 0,
): string {
  const isToy = theme.category === "bobblehead" || theme.category === "photoBobblehead";
  const hasReference = theme.category === "photoBobblehead" && useReferencePhoto;
  const subject = hasReference
    ? "以上傳的人像照片為參考，保留人物可辨識的五官、髮型與神韻，僅將人物轉為玩具造型，不保證百分之百還原相貌。"
    : "人物為全新原創角色，不參考或仿造任何真人照片、名人及既有知名角色。";
  const physical = isToy
    ? "製作成真實可量產的 PVC 塑膠搖頭公仔：人物臉部略顯年輕、帶有燦爛友善的笑容，頭部誇張巨大、身體極度迷你、脖子有可見金屬彈簧。頭髮是帶粗大雕刻凹槽的厚實模製塑膠，眉眼和笑容具有塗裝感。精細呈現細微合模線、射出成型塑膠紋理、輕微塗裝錯位、細小磨痕與柔和塑膠反光；放在精緻展示底座，以實體玩具商品攝影呈現，而不是 CGI 或電腦 3D 渲染。"
    : theme.category === "underwaterPrincess"
      ? "畫面位於真正的水下環境，禮服、髮絲與小氣泡順著水流自然漂浮，水面陽光形成真實焦散光線與折射。角色優雅漂浮，不要塑膠玩具材質、彈簧脖子或陸地攝影棚。"
      : theme.category === "flowerFairy"
        ? "花瓣紋理、透光翅膀與晨露細節清晰，角色與花朵的大小關係自然，環境具有柔和景深與精緻光影。"
        : theme.category === "miniFairyWorld"
          ? "畫風為夢幻精緻的 3D 童話娃娃感插畫，大主角帶有細緻的大眼睛、光澤髮絲與清透花飾；周圍每一個迷你分身都必須是同一原創角色的縮小版，臉型、瞳色、髮型、髮色、服裝與配飾保持一致，只改變表情及互動動作。大主角與迷你分身尺寸差異鮮明，迷你角色各自完整、自然擺放，不能變成不相關人物、分身不能長在主角身上。透過前景伸手、真實景深、泡泡光斑與花瓣層次呈現魔法微縮世界，不是 PVC 搖頭玩具，沒有彈簧脖子與商品展示台。"
          : "呈現童話公主故事感、精緻禮服布料與飾品細節、唯美自然光影，人物表情與肢體自然。";
  const outfit = hasReference && options.clothing === "依照片服裝"
    ? "服裝參考上傳照片的服飾輪廓與配色"
    : "服裝：" + (!hasReference && options.clothing === "依照片服裝" ? "職業套裝" : options.clothing);
  const role = hasReference && options.person === "依照片人物"
    ? "角色數量與身份依照片"
    : "人物設定：" + (!hasReference && options.person === "依照片人物" ? "原創女性" : options.person);
  const variationText = ["主體置中且完整入鏡", "前景細節清楚、背景柔焦", "側面柔光加強材質層次", "較寬的景深與故事感構圖"][variation % 4];
  return [
    "請生成一張高品質的「" + theme.title + "」主題圖片。",
    subject,
    "主題場景：" + theme.scene + "。",
    role + "；表情：" + options.expression + "；動作：" + options.pose + "；" + outfit + "。",
    "視覺風格：" + options.visualStyle + "；背景：" + options.background + "；主色系：" + options.palette + "。",
    physical,
    "構圖：" + variationText + "。比例 " + ratio + "，高解析度，主體完整、人物不被裁切。",
    "無文字、無 Logo、無浮水印、無多餘手腳、無扭曲五官、無未授權品牌元素。",
    hasReference ? "生成時請在 ChatGPT 一併上傳有權使用的人像照片；RXV 不收集或儲存該照片。" : "",
  ].filter(Boolean).join("\n\n");
}

function defaultOptions(category: FantasyCategory, background: string): FantasyOptions {
  const list = FANTASY_OPTIONS[category];
  return {
    person: list.person[0],
    visualStyle: list.visualStyle[0],
    clothing: list.clothing[0],
    expression: "燦爛笑容",
    pose: category === "underwaterPrincess" ? "漂浮"
      : category === "miniFairyWorld" ? "與迷你版互動" : "站立",
    background: list.background.includes(background) ? background : list.background[0],
    palette: category === "underwaterPrincess" ? "藍色"
      : category === "miniFairyWorld" ? "粉紫色" : "粉嫩漸層",
  };
}

export const FANTASY_THEMES: FantasyTheme[] = series.flatMap((group) =>
  group.themes.map(([title, scene, background], index) => {
    const id = "rxvFantasy_" + group.key + "_" + String(index + 1).padStart(2, "0");
    const defaults = defaultOptions(group.key, background);
    const base = { id, title, category: group.key, categoryLabel: group.label, scene,
      description: group.label + "｜" + scene + "。" };
    return {
      ...base,
      defaults,
      fullPrompt: composeFantasyPrompt(base, defaults, "9:16", group.key === "photoBobblehead"),
    };
  }),
);
export const FANTASY_THEME_BY_ID: Record<string, FantasyTheme> = Object.fromEntries(
  FANTASY_THEMES.map((theme) => [theme.id, theme]),
);

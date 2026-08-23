export type PetPromptMode = 'sticker' | 'realistic' | 'business';

export type PetPromptForm = {
  mode: PetPromptMode;
  petType: string;
  breed: string;
  furColor: string;
  furStyle: string;
  expression: string;
  action: string;
  accessory: string;
  scene: string;
  style: string;
  purpose: string;
  stickerTopic: string;
  businessType: string;
  marketingTheme: string;
  textStyle: string;
  ratio: string;
};

export const petPromptModes: { value: PetPromptMode; label: string; desc: string }[] = [
  { value: 'sticker', label: '寵物 LINE 貼圖', desc: '適合毛孩日常、撒嬌、問候、寵物店客服貼圖。' },
  { value: 'realistic', label: '寵物寫實美圖', desc: '適合毛孩紀念圖、頭像、社群貼文、照片升級。' },
  { value: 'business', label: '寵物商業宣傳圖', desc: '適合寵物美容、住宿、用品店、獸醫與活動宣傳。' },
];

export const petOptions = {
  petTypes: ['貓咪', '狗狗', '兔子', '鸚鵡', '倉鼠', '天竺鼠', '綜合毛孩', '其他寵物'],
  breeds: ['不指定', '米克斯', '柴犬', '柯基', '貴賓犬', '黃金獵犬', '博美', '法鬥', '臘腸犬', '馬爾濟斯', '英短貓', '美短貓', '布偶貓', '橘貓', '黑貓', '白貓', '虎斑貓', '三花貓'],
  furColors: ['不指定', '白色', '黑色', '橘色', '灰色', '奶茶色', '棕色', '金棕色', '黑白', '三花', '虎斑', '斑點花色'],
  furStyles: ['不指定', '短毛', '長毛', '捲毛', '蓬鬆毛', '柔順毛', '圓滾滾毛感'],
  expressions: ['開心', '呆萌', '高冷', '撒嬌', '無辜', '想睡', '驚訝', '生氣但可愛', '害羞', '期待', '療癒微笑'],
  actions: ['坐著看鏡頭', '趴著休息', '歪頭賣萌', '揮手打招呼', '跳躍', '翻肚撒嬌', '抱玩具', '吃零食', '打哈欠', '伸懶腰', '洗香香', '戴著小配件拍照'],
  accessories: ['無配件', '蝴蝶結', '小圍巾', '領結', '可愛帽子', '小背包', '生日帽', '小花裝飾', '寵物項圈'],
  scenes: ['白色乾淨背景', '溫馨客廳', '窗邊柔光', '沙發上', '草地', '花園', '寵物美容店', '寵物用品店', '寵物咖啡廳', '柔和純色背景'],
  styles: ['Q版可愛貼圖風', 'LINE 商業貼圖風', '日系手繪風', '韓系清新風', '寫實攝影感', '溫馨療癒風', '高級雜誌感', '公仔娃娃風', '商業宣傳海報風'],
  purposes: ['LINE 貼圖', '社群貼文', '毛孩紀念圖', '寵物頭像', '生日祝福圖', '店家宣傳圖', '預約公告圖', '商品推薦圖'],
  stickerTopics: ['日常問候', '撒嬌互動', '主人對話', '家庭群組', '吃貨主題', '睡前晚安', '搞笑吐槽', '節日祝福', '寵物店客服常用語'],
  businessTypes: ['寵物美容', '寵物住宿', '寵物用品店', '寵物零食店', '寵物咖啡廳', '獸醫／寵物保健', '寵物攝影', '寵物訓練'],
  marketingThemes: ['新客優惠', '洗澡美容預約', '住宿服務介紹', '節日活動', '生日慶生', '熱門商品推薦', '限時優惠', '品牌形象宣傳'],
  textStyles: ['不加文字', '繁體中文大字', '可愛糖果字＋白邊', '黑字粗體＋白邊', '店家公告海報字', '溫馨手寫感字體'],
  ratios: ['1:1 正方形', '4:5 IG 貼文', '9:16 限動／短影音封面', '4×4 LINE 貼圖總圖', '5×4 LINE 貼圖總圖'],
};

export const defaultPetPromptForm: PetPromptForm = {
  mode: 'sticker',
  petType: '貓咪',
  breed: '不指定',
  furColor: '橘色',
  furStyle: '短毛',
  expression: '呆萌',
  action: '歪頭賣萌',
  accessory: '無配件',
  scene: '白色乾淨背景',
  style: 'Q版可愛貼圖風',
  purpose: 'LINE 貼圖',
  stickerTopic: '日常問候',
  businessType: '寵物美容',
  marketingTheme: '洗澡美容預約',
  textStyle: '可愛糖果字＋白邊',
  ratio: '4×4 LINE 貼圖總圖',
};

export const petStickerPhrases = [
  '早安呀', '想你了', '等等我', '收到囉',
  '謝謝你', '我最可愛', '陪我玩', '肚子餓了',
  '主人辛苦了', '洗香香了', '晚安囉', '明天見',
  '可以預約喔', '馬上回覆', '歡迎光臨', '下次再來'
];

export type ProfessionalImagePackId =
  | 'real-estate'
  | 'hair-salon'
  | 'nail-salon'
  | 'beauty-spa'
  | 'dentist'
  | 'pet-grooming'

export type ProfessionalImagePackAccent =
  | 'emerald'
  | 'fuchsia'
  | 'rose'
  | 'violet'
  | 'sky'
  | 'amber'

export type ProfessionalImagePack = {
  id: ProfessionalImagePackId
  category: string
  name: string
  amount: number
  count: number
  badge: string
  description: string
  details: string[]
  accent: ProfessionalImagePackAccent
}

export const PROFESSIONAL_IMAGE_PACKS: ProfessionalImagePack[] = [
  {
    id: 'real-estate',
    category: '房仲／房地產',
    name: 'RXV 房仲帶看宣傳圖片包',
    amount: 99,
    count: 115,
    badge: '115 張｜含社群與短影音素材',
    description: '住宅帶看、成交交屋、公設社區、驗屋、生活機能與房仲行銷情境。',
    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明與授權說明', '適合社群貼文、廣告與短影音使用'],
    accent: 'emerald',
  },
  {
    id: 'hair-salon',
    category: '美髮／沙龍',
    name: 'RXV 美髮沙龍職業圖片包',
    amount: 99,
    count: 133,
    badge: '133 張｜含社群與短影音素材',
    description: '接待、洗護、剪髮、染燙、完成造型、預約宣傳與專業工具等情境。',
    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明與授權說明', '適合髮廊網站、社群、廣告與預約宣傳'],
    accent: 'fuchsia',
  },
  {
    id: 'nail-salon',
    category: '美甲',
    name: 'RXV 美甲職業圖片包',
    amount: 99,
    count: 133,
    badge: '133 張｜含社群與短影音素材',
    description: '美甲款式展示、手部特寫、沙龍服務、預約宣傳與店家形象素材。',
    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明與授權說明', '適合美甲店社群、廣告與短影音'],
    accent: 'rose',
  },
  {
    id: 'beauty-spa',
    category: '美容 SPA',
    name: 'RXV 美容 SPA 職業圖片包',
    amount: 99,
    count: 135,
    badge: '135 張｜含社群與短影音素材',
    description: '美容護膚、SPA、芳療、放鬆療程、店家形象與預約宣傳素材。',
    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明與授權說明', '適合美容 SPA 社群、廣告與短影音'],
    accent: 'violet',
  },
  {
    id: 'dentist',
    category: '牙醫／牙科',
    name: 'RXV 牙醫牙科職業圖片包',
    amount: 99,
    count: 135,
    badge: '135 張｜含社群與短影音素材',
    description: '牙科諮詢、口腔保健、診療情境、診所形象與衛教宣傳素材。',
    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明與授權說明', '適合牙科診所社群、衛教與短影音'],
    accent: 'sky',
  },
  {
    id: 'pet-grooming',
    category: '寵物／寵物美容',
    name: 'RXV 寵物圖片素材包',
    amount: 99,
    count: 146,
    badge: '146 張｜含 40 張 9:16 短影音素材',
    description: '萌貓、萌犬、貓狗互動、寵物美容、用品、健康與直式短影音素材。',
    details: ['檔名採「用途_圖片名」', '附商品介紹、使用說明與授權說明', '適合寵物店、寵物美容、社群與短影音'],
    accent: 'amber',
  },
]

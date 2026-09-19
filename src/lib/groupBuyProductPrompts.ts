export type ProductPromptInput = {
  id: string
  title: string
  dimensionsText?: string | null
  weightText?: string | null
  ingredientsSummary?: string | null
  vegetarianText?: string | null
  spongeColor?: string | null
  fillingColor?: string | null
  fillingIngredients?: string[]
}

export const GROUP_BUY_PRODUCT_IMAGE_TYPES = [
  'hero',
  'cutaway',
  'size_diagram',
  'afternoon_tea',
  'family_lakeside',
  'office_sharing',
] as const

export type GroupBuyProductImageType = typeof GROUP_BUY_PRODUCT_IMAGE_TYPES[number]

export const GROUP_BUY_PRODUCT_NEGATIVE_PROMPT = [
  'no logo', 'no brand text', 'no watermark', 'no copied packaging',
  'no collage', 'no triptych', 'no multi-panel layout', 'no official website layout',
  'no cropped head', 'no cropped forehead', 'no cropped chin', 'no partial face',
  'no duplicated person', 'no malformed hands', 'no extra fingers', 'no floating fork',
  'no distorted cake', 'no wrong filling', 'no fake measurement text', 'no extra cake variety',
].join(', ')

const TARGET_ORIGINAL_ROLL_ID = '56155d1f-4ece-409b-8e4e-03eb00c71214'

function verifiedFacts(product: ProductPromptInput) {
  const isVerifiedOriginalRoll = product.id === TARGET_ORIGINAL_ROLL_ID
  return {
    spongeColor: product.spongeColor || (isVerifiedOriginalRoll ? '淡金黃色' : ''),
    fillingColor: product.fillingColor || (isVerifiedOriginalRoll ? '純白色' : ''),
    fillingIngredients: product.fillingIngredients?.length
      ? product.fillingIngredients
      : isVerifiedOriginalRoll ? ['北海道奶霜'] : String(product.ingredientsSummary || '').split(/[、；,]/).map((item) => item.trim()).filter(Boolean),
    dimensions: product.dimensionsText || '',
    weight: product.weightText || '',
  }
}

export function buildProductImagePrompts(product: ProductPromptInput) {
  const facts = verifiedFacts(product)
  const appearance = facts.spongeColor && facts.fillingColor
    ? `${facts.spongeColor}泡芙蛋糕體，包覆大量${facts.fillingColor}${facts.fillingIngredients.join('、') || '內餡'}，自然向內捲曲；不增加未確認的布丁、果肉、巧克力或裝飾。`
    : `只能依已確認資料呈現；不增加未確認的布丁、果肉、巧克力、配料或裝飾。`
  const base = `商品為「${product.title}」。${appearance} 商品比例依 ${facts.dimensions || '實際商品標示'}，重量 ${facts.weight || '以實際商品標示為準'}。高級寫實商業食品攝影，全新構圖，4:3 單一場景。`
  const peopleSafety = '使用寬鬆中景構圖，所有人物頭部、頭髮、耳朵、額頭、下巴與臉部輪廓完整入鏡，最高頭頂距離上緣保留 8%～12%，左右保留安全空間；手指、餐具與動作自然。'
  const prompts: Record<GroupBuyProductImageType, string> = {
    hero: `${base} 奶油白攝影棚背景，一條完整商品搭配 1～2 片自然切片，商品占畫面 60%～75%，清楚呈現蛋糕體與內餡，不放人物或文字。`,
    cutaway: `${base} 近距離切面攝影，呈現真實蛋糕孔洞、奶霜質地與自然切片厚度，不可呈現塑膠、蠟或卡通質感，不放人物或文字。`,
    size_diagram: `${base} 一條完整商品以清楚三分之四角度置中，純淨淺色背景並保留四周空白供網站疊加尺寸線；圖片本體不得產生文字、數字、箭頭或量測標記。`,
    afternoon_tea: `${base} 一位成年女性在明亮窗邊享用商品，商品與切片位於前景且仍為主角，桌上僅有茶或咖啡、花朵與簡潔餐具。${peopleSafety}`,
    family_lakeside: `${base} 父母與兩位孩子共四人在湖泊、樹木、草地的郊外桌邊分享商品，完整商品與一致切片清楚位於前景，食物不可遮住主商品。${peopleSafety}`,
    office_sharing: `${base} 3～5 位成年上班族在明亮辦公室分享商品，桌面前景有一條完整商品與一致切片，僅搭配咖啡、茶與簡潔餐具，文件不可遮住商品。${peopleSafety}`,
  }
  return {
    productId: product.id,
    productTitle: product.title,
    verifiedProductFacts: facts,
    images: GROUP_BUY_PRODUCT_IMAGE_TYPES.map((imageType) => ({
      productId: product.id,
      productTitle: product.title,
      imageType,
      verifiedProductFacts: facts,
      prompt: prompts[imageType],
      negativePrompt: GROUP_BUY_PRODUCT_NEGATIVE_PROMPT,
      aspectRatio: '4:3',
      reviewStatus: 'draft' as const,
    })),
    reviewStatus: 'draft' as const,
  }
}

export function isAllowedYannickSourceUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'www.yannick.com.tw'
  } catch {
    return false
  }
}

export function objectiveSummaryFromText(value: string, maxLength = 500) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function retainExistingFact(existing: string | null | undefined, imported: string | null | undefined) {
  const next = String(imported || '').trim()
  return next || existing || null
}

export function mergeProductQuantityDraft(draft: Record<string, unknown>, productId: string, quantity: number) {
  const existingQuantities = draft.quantities && typeof draft.quantities === 'object'
    ? draft.quantities as Record<string, number>
    : {}
  return {
    ...draft,
    quantities: { ...existingQuantities, [productId]: Math.max(0, Math.floor(Number(quantity || 0))) },
  }
}

export function canActivateProductImage(reviewStatus: string, imageUrl: string) {
  return reviewStatus === 'approved' && String(imageUrl || '').startsWith('/')
}

export type DigitalProductCode = 'image-bundle-full'

export interface DigitalProduct {
  code: DigitalProductCode
  name: string
  shortName: string
  priceNtd: number
  description: string
  downloadDays: number
  downloadLimit: number
}

export const DIGITAL_PRODUCTS: Record<DigitalProductCode, DigitalProduct> = {
  'image-bundle-full': {
    code: 'image-bundle-full',
    name: '1500+ 高畫質圖片素材庫｜完整 ZIP 下載版',
    shortName: '1500+ 圖片素材 ZIP',
    priceNtd: 399,
    description: '以網站目前上架圖片為準，依目前分類整理後提供完整 ZIP 下載。',
    downloadDays: 7,
    downloadLimit: 3,
  },
}

export function getDigitalProduct(code: string | null): DigitalProduct | null {
  if (!code) return null
  return DIGITAL_PRODUCTS[code as DigitalProductCode] || null
}

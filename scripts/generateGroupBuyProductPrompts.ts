import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildProductImagePrompts } from '../src/lib/groupBuyProductPrompts'

const product = {
  id: '56155d1f-4ece-409b-8e4e-03eb00c71214',
  title: '原味生乳捲',
  dimensionsText: '18×8.5×6.5 公分',
  weightText: '324g',
  ingredientsSummary: '北海道奶霜、泡芙蛋糕',
  vegetarianText: '奶蛋素',
  spongeColor: '淡金黃色',
  fillingColor: '純白色',
  fillingIngredients: ['北海道奶霜'],
}

const outputDirectory = path.resolve('scripts/generated-prompts')
const outputPath = path.join(outputDirectory, `group-buy-product-${product.id}.json`)
await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, `${JSON.stringify(buildProductImagePrompts(product), null, 2)}\n`, 'utf8')
console.log(outputPath)

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildProductImagePrompts,
  canActivateProductImage,
  isAllowedYannickSourceUrl,
  mergeProductQuantityDraft,
  objectiveSummaryFromText,
  retainExistingFact,
} from '../src/lib/groupBuyProductPrompts.js'

test('商品案例1：返回團購頁後保留既有欄位與商品數量', () => {
  const draft = mergeProductQuantityDraft({ customerName: '測試', quantities: { other: 2 } }, 'p1', 3)
  assert.deepEqual(draft.quantities, { other: 2, p1: 3 })
  assert.equal(draft.customerName, '測試')
})
test('商品案例2：缺少尺寸時不產生假尺寸', () => {
  const prompts = buildProductImagePrompts({ id: 'p1', title: '商品', dimensionsText: null })
  assert.equal(prompts.verifiedProductFacts.dimensions, '')
})
test('商品案例3：官方抓取失敗時保留原內容', () => {
  assert.equal(retainExistingFact('原本已確認內容', null), '原本已確認內容')
})
test('商品案例4：官方長文不保存HTML且限制摘要長度', () => {
  const summary = objectiveSummaryFromText(`<h1>標題</h1>${'客觀資料'.repeat(200)}`, 80)
  assert.doesNotMatch(summary, /<h1>/)
  assert.equal(summary.length, 80)
})
test('商品案例5：AI圖片未審核不可啟用', () => {
  assert.equal(canActivateProductImage('draft', '/images/draft.jpg'), false)
})
test('商品案例6：拒絕圖片不可發布，核准站內圖才可啟用', () => {
  assert.equal(canActivateProductImage('rejected', '/images/rejected.jpg'), false)
  assert.equal(canActivateProductImage('approved', '/images/approved.jpg'), true)
})
test('商品案例7：沒有provider仍可產生draft提示詞', () => {
  const prompts = buildProductImagePrompts({ id: 'p1', title: '商品' })
  assert.equal(prompts.reviewStatus, 'draft')
  assert.equal(prompts.images.length, 6)
  assert.match(prompts.images[0].negativePrompt, /no brand text/)
})
test('商品案例8：來源網址只允許官方www HTTPS網域', () => {
  assert.equal(isAllowedYannickSourceUrl('https://www.yannick.com.tw/shop/product?saleid=1'), true)
  assert.equal(isAllowedYannickSourceUrl('http://www.yannick.com.tw/'), false)
  assert.equal(isAllowedYannickSourceUrl('https://evil.example/?url=www.yannick.com.tw'), false)
})

test('商品案例9：六張提示詞各自獨立且都是4比3', () => {
  const prompts = buildProductImagePrompts({ id: 'p1', title: '商品' })
  assert.equal(new Set(prompts.images.map((item) => item.imageType)).size, 6)
  assert.ok(prompts.images.every((item) => item.aspectRatio === '4:3' && !/拼貼|九宮格/.test(item.prompt)))
})

test('商品案例10：人物情境明確要求完整頭部與安全留白', () => {
  const prompts = buildProductImagePrompts({ id: 'p1', title: '商品' })
  for (const imageType of ['afternoon_tea', 'family_lakeside', 'office_sharing']) {
    const prompt = prompts.images.find((item) => item.imageType === imageType)?.prompt || ''
    assert.match(prompt, /頭部.*完整入鏡/)
    assert.match(prompt, /8%～12%/)
  }
})

test('商品案例11：原味生乳捲只使用已確認外觀與配料', () => {
  const prompts = buildProductImagePrompts({ id: '56155d1f-4ece-409b-8e4e-03eb00c71214', title: '原味生乳捲', dimensionsText: '18×8.5×6.5 公分', weightText: '324g' })
  assert.equal(prompts.verifiedProductFacts.spongeColor, '淡金黃色')
  assert.equal(prompts.verifiedProductFacts.fillingColor, '純白色')
  assert.deepEqual(prompts.verifiedProductFacts.fillingIngredients, ['北海道奶霜'])
})

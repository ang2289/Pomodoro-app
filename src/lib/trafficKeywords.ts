import { config } from '../config'
import { supabase } from './supabase'

/**
 * 流量關鍵字 Prompt（混合型，要求輸出 JSON）
 * 使用時機：摘要完成後，依摘要內容動態產生，作為流量/SEO/高轉換關鍵字
 */
const TRAFFIC_KEYWORDS_PROMPT = (input: string) => `請為「摘要工具」產生【第二組：流量關鍵字】，模擬一般人在 Google 搜尋時會實際輸入的完整問題或敘述句。

【一、資料來源】
- 流量關鍵字必須「只根據使用者原始輸入的全文文章」
- 嚴禁使用「摘要內容」作為關鍵字來源

【二、產生目標】
- 產生 5 個「搜尋句型」關鍵字
- 每一個關鍵字必須是一句「一般人真的會在 Google 輸入的完整問題或敘述句」

【三、語言與格式規則（非常重要）】
- 禁止所有關鍵字共用相同開頭
- 禁止重複使用固定前綴（例如：更生消債、債務更生…）
- 每個關鍵字需自然不同句型
- 長度至少 8～20 個字
- 需包含情緒、困境或選擇猶豫

【四、嚴格禁止事項】
- 禁止產生「分類型關鍵字」
  （例如：更生消債流程、更生消債文件、更生消債時間）
- 禁止使用章節標題、名詞堆疊
- 禁止出現「需要、流程、文件、時間」這類制式詞作為結尾

【五、範例（僅供理解，實際內容需依文章生成）】
- 正確示例：
  - 房子快被查封還能申請更生嗎
  - 被高利貸追債是不是只能走消債
- 錯誤示例（不可出現）：
  - 更生消債申請流程
  - 更生消債需要文件

【輸出格式】
- 僅輸出 JSON 格式，不能有任何多餘文字
- 回傳格式必須是：
{"keywords":[{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."}]}
- 禁止出現：本文、文章、介紹、摘要、重點、關鍵字、建議、範例、AI、工具、流量、SEO、流程、條件、費用、需要、文件、時間

【輸入】
- 使用者原始輸入的全文文章（唯一資料來源）：<<<INPUT>>>
${input}

現在開始輸出 JSON：`

/**
 * 禁詞列表（品質檢查用）
 */
const FORBIDDEN_WORDS = [
  '本文',
  '文章',
  '介紹',
  '摘要',
  '重點',
  '關鍵字',
  '建議',
  '範例',
  'AI',
  '工具',
  '流量',
  'SEO',
  '說明',
  '內容',
  '詳情',
  // 禁止純分類詞和制式詞
  '流程',
  '條件',
  '費用',
  '需要',
  '文件',
  '時間',
  // 禁止分類型關鍵字結尾
  '申請流程',
  '需要文件',
  '需要時間',
  '申請時間',
  '辦理流程',
  '準備文件',
]

/**
 * 常見搜尋意圖字尾（用於補足關鍵字）
 */
const SEARCH_INTENT_SUFFIXES = [
  '申請流程',
  '需要文件',
  '費用',
  '條件',
  '時間',
  '後果',
  '差別',
  '怎麼做',
  '要不要',
  '要多久',
  '準備什麼',
  '怎麼處理',
]

/**
 * 品質檢查：驗證關鍵字是否符合規則
 */
function validateKeyword(keyword: string): boolean {
  if (!keyword || typeof keyword !== 'string') {
    return false
  }

  const trimmed = keyword.trim()
  if (trimmed.length === 0) {
    return false
  }

  // 檢查中文字數（必須 >= 8 且 <= 20，符合新規則）
  const chineseChars = (trimmed.match(/[\u4e00-\u9fa5]/g) || []).length
  if (chineseChars < 8 || chineseChars > 20) {
    return false
  }

  // 檢查總長度（必須 >= 8 且 <= 30，符合新規則 8-20 個中文字）
  if (trimmed.length < 8 || trimmed.length > 30) {
    return false
  }

  // 檢查是否包含禁詞
  const lowerKeyword = trimmed.toLowerCase()
  for (const forbidden of FORBIDDEN_WORDS) {
    if (lowerKeyword.includes(forbidden.toLowerCase())) {
      return false
    }
  }

  return true
}

/**
 * 檢查關鍵字是否重複（只使用完全相同字串判斷）
 * 禁止使用 includes、startsWith、模糊比對
 */
function isDuplicate(keyword: string, existingKeywords: string[]): boolean {
  // 只使用完全相同字串判斷
  return existingKeywords.includes(keyword)
}

/**
 * 檢查關鍵字前綴是否重複（已廢棄，不再使用）
 * 去重只能使用「完全相同字串」判斷，禁止使用前綴比對
 * @deprecated 此函數已不再使用，保留僅供參考
 */
function hasPrefixRepetition(keyword: string, existingKeywords: string[]): boolean {
  // 已廢棄：去重只能使用完全相同字串判斷
  return false
}

/**
 * 檢查正式名詞出現次數（已廢棄，不再使用）
 * 去重只能使用「完全相同字串」判斷，禁止使用 includes 比對
 * @deprecated 此函數已不再使用，保留僅供參考
 */
function hasFormalNounRepetition(keyword: string, existingKeywords: string[]): boolean {
  // 已廢棄：去重只能使用完全相同字串判斷
  return false
}

/**
 * 品質檢查 + 清洗：過濾不符合規則的關鍵字
 * 去重只能使用「完全相同字串」判斷
 */
function cleanKeywords(keywords: string[]): string[] {
  const cleaned: string[] = []

  for (const keyword of keywords) {
    // 品質檢查
    if (!validateKeyword(keyword)) {
      continue
    }

    // 檢查重複（只使用完全相同字串判斷）
    if (isDuplicate(keyword.trim(), cleaned)) {
      continue
    }

    cleaned.push(keyword.trim())
  }

  // 使用 Set 進行最終去重（確保完全相同字串只保留一筆）
  return Array.from(new Set(cleaned))
}

/**
 * 補足關鍵字：使用第一組關鍵字 + 常見搜尋意圖字尾
 */
function supplementKeywords(
  existingKeywords: string[],
  firstGroupKeywords: string[],
  targetCount: number = 5
): string[] {
  if (existingKeywords.length >= targetCount) {
    return existingKeywords.slice(0, targetCount)
  }

  const supplemented = [...existingKeywords]
  const needed = targetCount - supplemented.length

  // 從第一組關鍵字中提取核心詞（去掉常見字尾）
  const coreWords = firstGroupKeywords
    .map((kw) => {
      // 移除常見字尾，提取核心詞
      let core = kw
        .replace(/流程|費用|條件|時間|文件|後果|差別|怎麼做|要不要|要多久|準備什麼|怎麼處理/g, '')
        .trim()

      // 如果核心詞太短（< 2 字），使用原詞
      const chineseChars = (core.match(/[\u4e00-\u9fa5]/g) || []).length
      if (chineseChars < 2) {
        core = kw
      }

      return core
    })
    .filter((core) => {
      const chineseChars = (core.match(/[\u4e00-\u9fa5]/g) || []).length
      return chineseChars >= 2 && chineseChars <= 6
    })

  // 組合核心詞 + 搜尋意圖字尾
  let added = 0
  for (const coreWord of coreWords) {
    if (added >= needed) break

    for (const suffix of SEARCH_INTENT_SUFFIXES) {
      if (added >= needed) break

      const newKeyword = `${coreWord}${suffix}`
      const chineseChars = (newKeyword.match(/[\u4e00-\u9fa5]/g) || []).length

      // 驗證新關鍵字（符合新規則：8-20 個中文字）
      if (
        chineseChars >= 8 &&
        chineseChars <= 20 &&
        !isDuplicate(newKeyword, supplemented) &&
        validateKeyword(newKeyword)
      ) {
        supplemented.push(newKeyword)
        added++
      }
    }
  }

  // 最多返回 5 個（符合新規則固定 5 個）
  return supplemented.slice(0, Math.min(targetCount, 5))
}

/**
 * 解析 AI 回傳的 JSON 格式關鍵字
 */
function parseKeywordsFromResponse(result: string): string[] {
  if (!result || typeof result !== 'string') {
    return []
  }

  let keywords: string[] = []

  try {
    // 清理可能的 markdown 代碼塊標記
    const cleanedResult = result
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    // 嘗試提取 JSON 物件（可能有多餘文字）
    const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[0]
      const parsed = JSON.parse(jsonStr)

      // 驗證格式：{"keywords":[{"text":"..."},...]}
      if (parsed.keywords && Array.isArray(parsed.keywords)) {
        keywords = parsed.keywords
          .map((item: any) => {
            const text = item?.text || item?.keyword || ''
            return typeof text === 'string' ? text.trim() : ''
          })
          .filter((text: string) => {
            // 驗證關鍵字長度（6-14 個中文字，符合新規則）
            const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
            return text.length > 0 && chineseChars >= 6 && chineseChars <= 14 && chineseChars !== 2 && chineseChars !== 3 && chineseChars !== 4 && chineseChars !== 5
          })
      }
    }
  } catch (parseError) {
    // console.warn('⚠️ 流量關鍵字 JSON 解析失敗，嘗試其他格式', parseError)

    // Fallback：嘗試解析舊格式（- 關鍵字1\n- 關鍵字2）
    const lines = result.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
    for (const line of lines) {
      const keyword = line.replace(/^-\s*/, '').trim()
      // 驗證關鍵字長度（8-20 個中文字，符合新規則）
      const chineseChars = (keyword.match(/[\u4e00-\u9fa5]/g) || []).length
      if (keyword.length > 0 && chineseChars >= 8 && chineseChars <= 20) {
        keywords.push(keyword)
      }
      if (keywords.length >= 5) break // 最多取 5 個（符合新規則）
    }
  }

  return keywords
}

/**
 * 產生流量關鍵字（統一函式）
 * @param inputText 原始輸入文章全文（唯一資料來源，嚴禁使用摘要內容）
 * @param firstGroupKeywords 第一組關鍵字（用於避免重複）
 * @param user 使用者物件（用於判斷是否登入）
 * @returns 流量關鍵字陣列（固定 5 個）
 */
export async function generateTrafficKeywords(
  inputText: string,
  firstGroupKeywords: string[] = [],
  user: any = null
): Promise<string[]> {
  // 流量關鍵字必須只根據使用者原始輸入的全文文章，如果沒有則返回空陣列
  if (!inputText || inputText.trim().length === 0) {
    return []
  }

  // 判斷是否為中文（以原始輸入文章全文為準）
  const isChinese = /[\u4e00-\u9fa5]/.test(inputText)
  if (!isChinese) {
    // console.warn('⚠️ 流量關鍵字目前僅支援中文')
    return []
  }

  try {
    // 構建 AI Prompt（只使用原始輸入文章全文，嚴禁使用摘要內容）
    const prompt = TRAFFIC_KEYWORDS_PROMPT(inputText || '')

    // 呼叫 AI API
    const { supabaseUrl, supabaseAnonKey } = config
    const anonKey = supabaseAnonKey || ''

    // ⚠️ 已移除訪客模式，只支援登入使用者
    if (!user) {
      // console.warn('⚠️ 流量關鍵字功能需要登入')
      return []
    }

    let data: any

    // ⚠️ 舊邏輯（不可使用）：使用 supabase.functions.invoke
    // 此邏輯已廢棄，應改為使用 fetch 方式（參考 summaryService.ts）
    // 目前保留僅供參考，實際流量關鍵字應由 Edge Function 直接回傳
    {
      // ❌ 已停用：不應再使用 invoke 方式
      // 流量關鍵字應由 auto-summary Edge Function 直接回傳 traffic_keywords 欄位
      // 參考：src/pages/summary/useSummaryAction.ts 中的處理方式
      console.warn('⚠️ [DEPRECATED] trafficKeywords.ts 中的 invoke 邏輯已停用，應使用 Edge Function 直接回傳的 traffic_keywords')
      return []
      
      // 以下為舊邏輯（已停用）：
      // const { data: { session } } = await supabase.auth.getSession()
      // const invokeResult = await supabase.functions.invoke('auto-summary', {
      //   body: { content: prompt, lang: 'zh-TW', mode: 'traffic-keywords' },
      //   headers: { Authorization: `Bearer ${session?.access_token}` },
      // })
      // if (invokeResult.error) return []
      // data = invokeResult.data
    }

    // 解析 AI 回傳的關鍵字
    const result = data?.result || data?.summary || ''
    const rawKeywords = parseKeywordsFromResponse(result)

    // 在 console 輸出原始關鍵字（用於除錯）
    // console.log('Flow keywords raw:', rawKeywords)

    // 品質檢查 + 清洗（去重只能使用完全相同字串判斷）
    let cleanedKeywords = cleanKeywords(rawKeywords)

    // 若不足 5 個，使用第一組關鍵字補足
    if (cleanedKeywords.length < 5 && firstGroupKeywords.length > 0) {
      cleanedKeywords = supplementKeywords(cleanedKeywords, firstGroupKeywords, 5)
    }

    // 最終過濾，確保符合新規則：8-20 個字
    const finalKeywords = cleanedKeywords.filter((keyword) => {
      const chineseChars = (keyword.match(/[\u4e00-\u9fa5]/g) || []).length
      return chineseChars >= 8 && chineseChars <= 20
    })

    // 確認至少 5 筆，若不足則在 console 顯示警告
    if (finalKeywords.length < 5) {
      // console.warn(`⚠️ 流量關鍵字數量不足：僅有 ${finalKeywords.length} 筆，預期至少 5 筆`)
    }

    // 返回所有符合規則的關鍵字（不可只取第一筆，需完整返回）
    // 若不足 5 筆，仍全部返回（UI 會顯示警告）
    return finalKeywords
  } catch (error) {
    // console.warn('⚠️ 流量關鍵字生成失敗', error)
    return []
  }
}


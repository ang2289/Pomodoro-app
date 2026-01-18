import { useState } from 'react'

interface SummaryStateSetters {
  setSummary: (value: { content: string; isPreview?: boolean }) => void
  setKeywords: (value: string[]) => void
  setTrafficKeywords: (value: string[]) => void
  setTrafficKeywordsReady?: (value: boolean) => void
}

export function useSummaryAction(stateSetters?: SummaryStateSetters) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSummary = async (inputText: string) => {
    console.log('[SUMMARY] click')

    if (!inputText || inputText.trim().length === 0) {
      console.warn('[SUMMARY] empty input')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      console.log('[SUMMARY] request start')

      // ✅ 生成 title（從 inputText 前 50 個字元，或使用預設值）
      const title = inputText.trim().length > 0 
        ? inputText.trim().substring(0, 50).replace(/\n/g, ' ').trim() || 'AI 摘要'
        : 'AI 摘要'

      // ✅ 取得 userId（如果已登入）
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

      // ✅ 最終 body 結構：{ action: "summary", content: string, title: string, userId?: string }
      const payload: any = {
        action: 'summary',
        content: inputText,
        title: title,
      }
      
      // 如果有 userId，加入 payload
      if (userId) {
        payload.userId = userId
      }

      console.log('[SUMMARY] payload', payload)

      const body = JSON.stringify(payload)
      console.log('[SUMMARY][FINAL BODY]', JSON.stringify(payload, null, 2))

      const res = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      })

      console.log('[SUMMARY] response status', res.status)

      if (!res.ok) {
        const text = await res.text()
        let errorMessage = `API error ${res.status}: ${text}`
        let errorCode: string | undefined
        
        // 嘗試解析 JSON 錯誤訊息
        try {
          const errorData = JSON.parse(text)
          if (errorData.error) {
            errorMessage = errorData.error
          }
          if (errorData.code) {
            errorCode = errorData.code
          }
        } catch {
          // 如果無法解析 JSON，使用原始文字
        }
        
        // ✅ 處理特定的錯誤碼
        if (errorCode === 'TRIAL_EXHAUSTED') {
          errorMessage = '免費體驗次數已用完，請登入以繼續使用'
        } else if (errorCode === 'CREDITS_NOT_ENOUGH') {
          errorMessage = '點數不足，請購買點數方案'
        }
        
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('[SUMMARY] response data', data)
      console.log('[SUMMARY] response data keys:', Object.keys(data))
      console.log('[SUMMARY] stateSetters exists?', !!stateSetters)
      console.log('[SUMMARY] response status', res.status)

      if (stateSetters && res.status === 200) {
        console.log('[SUMMARY] Attempting to set state...')
        let summaryText: string | undefined
        let resultText: string | undefined
        let keywordsArray: string[] | undefined
        let trafficKeywordsArray: string[] | undefined

        const parseFromObject = (obj: any) => {
          summaryText = obj.summary ?? summaryText
          resultText = obj.result ?? resultText
          keywordsArray = obj.keywords ?? keywordsArray
          trafficKeywordsArray = obj.traffic_keywords ?? trafficKeywordsArray
        }

        if (data.summary !== undefined || data.result !== undefined) {
          console.log('[SUMMARY] Using API processed structure (case 1/3)')
          parseFromObject(data)
        } else if (data.data) {
          console.log('[SUMMARY] Found data.data, checking contents...')
          const actualData = data.data
          console.log('[SUMMARY] actualData keys:', Object.keys(actualData))
          if (actualData.summary !== undefined || actualData.result !== undefined) {
            console.log('[SUMMARY] Using processed data.data structure')
            parseFromObject(actualData)
          } else if (actualData.candidates && actualData.candidates[0]?.content?.parts) {
            console.log('[SUMMARY] Using Gemini raw structure (case 2)')
            const geminiText = actualData.candidates[0].content.parts[0]?.text
            if (geminiText) {
              try {
                const parsed = JSON.parse(geminiText)
                console.log('[SUMMARY] Full parsed JSON keys:', Object.keys(parsed))
                console.log('[SUMMARY] Full parsed JSON:', JSON.stringify(parsed, null, 2))
                parseFromObject(parsed)
                keywordsArray = parsed.keywords || parsed.keyword || parsed.tags || parsed.keywords_list || keywordsArray
                trafficKeywordsArray = parsed.traffic_keywords || parsed.trafficKeywords || parsed.traffic_keywords_list || parsed.seo_keywords || trafficKeywordsArray

                if (keywordsArray && !Array.isArray(keywordsArray)) {
                  console.warn('[SUMMARY] keywords is not an array, converting:', keywordsArray)
                  keywordsArray = []
                }

                if (trafficKeywordsArray && !Array.isArray(trafficKeywordsArray)) {
                  console.warn('[SUMMARY] traffic_keywords is not an array, converting:', trafficKeywordsArray)
                  trafficKeywordsArray = []
                }
              } catch (e) {
                console.error('[SUMMARY] Failed to parse Gemini JSON:', e)
                console.error('[SUMMARY] Raw Gemini text:', geminiText.substring(0, 200))
                summaryText = geminiText
              }
            }
          }
        }

        const finalSummary = summaryText || resultText || ''
        console.log('[SUMMARY] Final summary length:', finalSummary.length)
        console.log('[SUMMARY] Setting summary:', finalSummary.substring(0, 50) + '...')
        stateSetters.setSummary({ content: finalSummary })

        const finalKeywords = Array.isArray(keywordsArray) ? keywordsArray : []
        console.log('[SUMMARY] Final keywords:', finalKeywords)
        console.log('[SUMMARY] Final keywords length:', finalKeywords.length)
        stateSetters.setKeywords(finalKeywords)

        const finalTrafficKeywords = Array.isArray(trafficKeywordsArray) ? trafficKeywordsArray : []
        console.log('[SUMMARY] Final trafficKeywords:', finalTrafficKeywords)
        console.log('[SUMMARY] Final trafficKeywords length:', finalTrafficKeywords.length)
        stateSetters.setTrafficKeywords(finalTrafficKeywords)

        if (stateSetters.setTrafficKeywordsReady && finalTrafficKeywords.length > 0) {
          console.log('[SUMMARY] Setting trafficKeywordsReady: true')
          stateSetters.setTrafficKeywordsReady(true)
        }

        console.log('[SUMMARY] State update completed')
      } else {
        console.warn('[SUMMARY] State setters not available or status not 200', { 
          hasStateSetters: !!stateSetters, 
          status: res.status 
        })
      }

      return data
    } catch (error: any) {
      console.error('[SUMMARY] error', error)
      setError(error.message || 'Unknown error')
      return null
    } finally {
      setLoading(false)
      console.log('[SUMMARY] finished')
    }
  }

  return {
    runSummary,
    loading,
    error,
  }
}

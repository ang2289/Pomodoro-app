import { useEffect, useMemo, useState } from 'react'
import { aiContentWorkflowDb, type AIContentWorkflowRecord } from '../../lib/aiContentWorkflowDb'

type Platform = 'TikTok' | 'Facebook' | 'Instagram Reels'

interface WorkflowScene {
  sceneNumber: number
  sceneTitle: string
  imagePrompt: string
  flowPrompt: string
  voiceover: string
}

interface WorkflowResult {
  topic: string
  category?: string
  hooks: string[]
  scenes: WorkflowScene[]
  social: {
    tiktok?: {
      title?: string
      caption?: string
      hashtags?: string[]
    }
    facebook?: {
      title?: string
      caption?: string
    }
    instagram?: {
      title?: string
      caption?: string
      hashtags?: string[]
    }
  }
}

const DEFAULT_CATEGORY = '佛教療癒'
const DEFAULT_STYLE = '莊嚴、療癒、溫暖、有安定感；角色與畫面風格一致；無文字、無 Logo、無浮水印。'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function buildMasterPrompt(params: {
  topic: string
  category: string
  platforms: Platform[]
  sceneCount: number
  videoSeconds: number
  aspectRatio: string
  styleNote: string
}) {
  const {
    topic,
    category,
    platforms,
    sceneCount,
    videoSeconds,
    aspectRatio,
    styleNote,
  } = params

  return `請你擔任 AI 短影音內容企劃助手。

請根據以下設定，產出一套可直接用於短影音製作的完整內容企劃。

主題：${topic}
類型：${category}
目標平台：${platforms.join('、')}
影片長度：${videoSeconds} 秒
圖片比例：${aspectRatio}
場景數量：${sceneCount}
風格補充：${styleNote || '無'}

請嚴格只輸出 JSON，不要輸出 Markdown、程式碼區塊、解釋或前後說明。

需求：
1. 產出 5 個高停留 Hook。
2. 產出 ${sceneCount} 個彼此不同、但同一主題一致的場景。
3. 每個場景都必須包含：
   - sceneNumber
   - sceneTitle
   - imagePrompt
   - flowPrompt
   - voiceover
4. imagePrompt 必須適合 AI 生圖，描述主體、環境、光線、構圖、情緒、畫面品質與 ${aspectRatio} 比例。
5. flowPrompt 必須適合圖片轉 ${videoSeconds} 秒影片，描述主體動作、環境動態、鏡頭運動、光影變化，並要求保持人物五官、服裝與畫面一致，不要新增不必要物件。
6. voiceover 要簡短、自然、可直接作為短影音旁白。
7. 產出 TikTok、Facebook、Instagram Reels 的標題、貼文文案與 Hashtag；Facebook 可不輸出 hashtags。
8. 不要出現品牌名稱、Logo、浮水印。
9. 所有內容使用繁體中文。
10. 請只輸出以下 JSON 結構：

{
  "topic": "${topic}",
  "category": "${category}",
  "hooks": [
    "",
    "",
    "",
    "",
    ""
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneTitle": "",
      "imagePrompt": "",
      "flowPrompt": "",
      "voiceover": ""
    }
  ],
  "social": {
    "tiktok": {
      "title": "",
      "caption": "",
      "hashtags": []
    },
    "facebook": {
      "title": "",
      "caption": ""
    },
    "instagram": {
      "title": "",
      "caption": "",
      "hashtags": []
    }
  }
}`
}

function normalizeJsonText(text: string) {
  return text
    .trim()
    .replace(/^\`\`\`(?:json)?/i, '')
    .replace(/\`\`\`$/i, '')
    .trim()
}

function validateResult(value: unknown): WorkflowResult {
  if (!value || typeof value !== 'object') {
    throw new Error('JSON 必須是一個物件')
  }

  const result = value as WorkflowResult

  if (!Array.isArray(result.hooks)) {
    throw new Error('缺少 hooks 陣列')
  }

  if (!Array.isArray(result.scenes) || result.scenes.length === 0) {
    throw new Error('缺少 scenes 場景資料')
  }

  for (const scene of result.scenes) {
    if (
      typeof scene.sceneNumber !== 'number' ||
      typeof scene.sceneTitle !== 'string' ||
      typeof scene.imagePrompt !== 'string' ||
      typeof scene.flowPrompt !== 'string' ||
      typeof scene.voiceover !== 'string'
    ) {
      throw new Error('其中一個場景格式不完整')
    }
  }

  if (!result.social || typeof result.social !== 'object') {
    throw new Error('缺少 social 社群文案資料')
  }

  return result
}

function CopyButton({ text, label = '複製' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? '已複製' : label}
    </button>
  )
}

function TextBlock({
  title,
  text,
  rows = 5,
}: {
  title: string
  text: string
  rows?: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <CopyButton text={text} />
      </div>
      <textarea
        readOnly
        value={text}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none"
      />
    </div>
  )
}

export default function AIContentWorkflowPage() {
  const [topic, setTopic] = useState('觀音 × 風吹散心事')
  const [category, setCategory] = useState(DEFAULT_CATEGORY)
  const [platforms, setPlatforms] = useState<Platform[]>([
    'TikTok',
    'Facebook',
    'Instagram Reels',
  ])
  const [sceneCount, setSceneCount] = useState(8)
  const [videoSeconds, setVideoSeconds] = useState(8)
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [styleNote, setStyleNote] = useState(DEFAULT_STYLE)
  const [masterPrompt, setMasterPrompt] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  const [result, setResult] = useState<WorkflowResult | null>(null)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<AIContentWorkflowRecord[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const canGenerate = topic.trim().length > 0 && platforms.length > 0

  const refreshHistory = async () => {
    const rows = await aiContentWorkflowDb.workflows
      .orderBy('updatedAt')
      .reverse()
      .limit(20)
      .toArray()
    setHistory(rows)
  }

  useEffect(() => {
    document.title = 'RxV AI 短影音內容工廠'
    refreshHistory().catch(() => {
      setMessage('讀取本機歷史紀錄失敗')
    })
  }, [])

  const platformOptions: Platform[] = useMemo(
    () => ['TikTok', 'Facebook', 'Instagram Reels'],
    []
  )

  const togglePlatform = (platform: Platform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    )
  }

  const generatePrompt = () => {
    if (!canGenerate) {
      setMessage('請先輸入主題並至少選擇一個平台')
      return
    }

    const nextPrompt = buildMasterPrompt({
      topic: topic.trim(),
      category,
      platforms,
      sceneCount,
      videoSeconds,
      aspectRatio,
      styleNote: styleNote.trim(),
    })

    setMasterPrompt(nextPrompt)
    setMessage('總指令已產生，可直接複製到 ChatGPT')
  }

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setJsonInput(text)
      setMessage('已從剪貼簿貼上')
    } catch {
      setMessage('瀏覽器未允許讀取剪貼簿，請手動貼上')
    }
  }

  const parseJson = () => {
    try {
      const parsed = JSON.parse(normalizeJsonText(jsonInput))
      const validated = validateResult(parsed)
      setResult(validated)
      setMessage(`解析成功，共 ${validated.scenes.length} 個場景`)
    } catch (error) {
      setResult(null)
      setMessage(
        error instanceof Error
          ? `解析失敗：${error.message}`
          : '解析失敗，請確認 JSON 格式'
      )
    }
  }

  const saveWorkflow = async () => {
    if (!masterPrompt) {
      setMessage('請先產生總指令')
      return
    }

    const now = new Date().toISOString()
    const id = activeId ?? createId()

    const existing = activeId
      ? await aiContentWorkflowDb.workflows.get(activeId)
      : undefined

    const record: AIContentWorkflowRecord = {
      id,
      topic: topic.trim(),
      category,
      platforms,
      sceneCount,
      videoSeconds,
      aspectRatio,
      styleNote,
      promptText: masterPrompt,
      resultJson: result,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    await aiContentWorkflowDb.workflows.put(record)
    setActiveId(id)
    await refreshHistory()
    setMessage('已儲存到這台瀏覽器的 IndexedDB')
  }

  const loadWorkflow = (record: AIContentWorkflowRecord) => {
    setActiveId(record.id)
    setTopic(record.topic)
    setCategory(record.category)
    setPlatforms(record.platforms as Platform[])
    setSceneCount(record.sceneCount)
    setVideoSeconds(record.videoSeconds)
    setAspectRatio(record.aspectRatio)
    setStyleNote(record.styleNote)
    setMasterPrompt(record.promptText)
    setResult((record.resultJson as WorkflowResult | null) ?? null)
    setJsonInput(
      record.resultJson ? JSON.stringify(record.resultJson, null, 2) : ''
    )
    setMessage('已載入歷史企劃')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteWorkflow = async (id: string) => {
    await aiContentWorkflowDb.workflows.delete(id)
    if (activeId === id) {
      setActiveId(null)
    }
    await refreshHistory()
    setMessage('已刪除歷史企劃')
  }

  const startNew = () => {
    setActiveId(null)
    setTopic('')
    setCategory(DEFAULT_CATEGORY)
    setPlatforms(['TikTok', 'Facebook', 'Instagram Reels'])
    setSceneCount(8)
    setVideoSeconds(8)
    setAspectRatio('9:16')
    setStyleNote(DEFAULT_STYLE)
    setMasterPrompt('')
    setJsonInput('')
    setResult(null)
    setMessage('已建立新的空白企劃')
  }

  const exportJson = () => {
    if (!result) {
      setMessage('目前沒有可匯出的 AI 結果')
      return
    }

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `rxv-ai-content-${topic.trim() || 'workflow'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('已匯出 JSON 備份')
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Version A
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                RxV AI 短影音內容工廠
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                不串 AI API、不使用 Supabase。先產生總指令，再把 ChatGPT 回傳的 JSON 貼回來整理與保存。
              </p>
            </div>
            <button
              type="button"
              onClick={startNew}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              新企劃
            </button>
          </div>

          {message && (
            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {message}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">1. 輸入企劃設定</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">主題</span>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="例如：觀音 × 風吹散心事"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">內容類型</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option>佛教療癒</option>
                <option>商品行銷</option>
                <option>小店家推廣</option>
                <option>LINE 貼圖</option>
                <option>AI 短劇</option>
                <option>蝦皮分潤</option>
                <option>一般短影音</option>
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">發布平台</span>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((platform) => {
                  const checked = platforms.includes(platform)
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                        checked
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {platform}
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">場景數量</span>
              <input
                type="number"
                min={1}
                max={20}
                value={sceneCount}
                onChange={(event) =>
                  setSceneCount(Math.max(1, Number(event.target.value) || 1))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">影片秒數</span>
              <input
                type="number"
                min={1}
                max={60}
                value={videoSeconds}
                onChange={(event) =>
                  setVideoSeconds(Math.max(1, Number(event.target.value) || 1))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">圖片比例</span>
              <select
                value={aspectRatio}
                onChange={(event) => setAspectRatio(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option>9:16</option>
                <option>16:9</option>
                <option>1:1</option>
                <option>4:5</option>
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">風格補充</span>
              <textarea
                value={styleNote}
                onChange={(event) => setStyleNote(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={generatePrompt}
            disabled={!canGenerate}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            產生 AI 總指令
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">2. 複製總指令到 ChatGPT</h2>
            <CopyButton text={masterPrompt} label="一鍵複製總指令" />
          </div>
          <textarea
            readOnly
            value={masterPrompt}
            placeholder="按上方「產生 AI 總指令」後，這裡會出現完整 Prompt。"
            rows={14}
            className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">3. 貼回 ChatGPT JSON</h2>
            <button
              type="button"
              onClick={readClipboard}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              從剪貼簿貼上
            </button>
          </div>

          <textarea
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            placeholder='把 ChatGPT 回傳的 JSON 貼在這裡，例如 {"topic":"..."}'
            rows={12}
            className="mt-4 w-full resize-y rounded-xl border border-slate-300 p-4 font-mono text-sm leading-6 text-slate-700 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={parseJson}
            disabled={!jsonInput.trim()}
            className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            解析並整理內容
          </button>
        </section>

        {result && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">4. 完整企劃結果</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {result.topic || topic} · {result.scenes.length} 個場景
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportJson}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  匯出 JSON
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-slate-900">高停留 Hook</h3>
                <div className="mt-3 space-y-3">
                  {result.hooks.map((hook, index) => (
                    <div
                      key={`${hook}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm leading-6 text-slate-700">
                        <span className="mr-2 font-semibold">{index + 1}.</span>
                        {hook}
                      </p>
                      <CopyButton text={hook} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {result.scenes.map((scene) => (
              <article
                key={scene.sceneNumber}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5">
                  <p className="text-sm font-semibold text-blue-600">
                    場景 {scene.sceneNumber}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {scene.sceneTitle}
                  </h3>
                </div>

                <div className="space-y-5">
                  <TextBlock title="圖片 Prompt" text={scene.imagePrompt} rows={7} />
                  <TextBlock title="FLOW 影片 Prompt" text={scene.flowPrompt} rows={7} />
                  <TextBlock title="旁白" text={scene.voiceover} rows={3} />
                </div>
              </article>
            ))}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">社群文案</h3>

              <div className="mt-5 space-y-7">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">TikTok</h4>
                  <TextBlock
                    title="標題"
                    text={result.social.tiktok?.title ?? ''}
                    rows={2}
                  />
                  <TextBlock
                    title="文案"
                    text={result.social.tiktok?.caption ?? ''}
                    rows={5}
                  />
                  <TextBlock
                    title="Hashtag"
                    text={(result.social.tiktok?.hashtags ?? []).join(' ')}
                    rows={3}
                  />
                </div>

                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">Facebook</h4>
                  <TextBlock
                    title="標題"
                    text={result.social.facebook?.title ?? ''}
                    rows={2}
                  />
                  <TextBlock
                    title="文案"
                    text={result.social.facebook?.caption ?? ''}
                    rows={6}
                  />
                </div>

                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">Instagram Reels</h4>
                  <TextBlock
                    title="標題"
                    text={result.social.instagram?.title ?? ''}
                    rows={2}
                  />
                  <TextBlock
                    title="文案"
                    text={result.social.instagram?.caption ?? ''}
                    rows={5}
                  />
                  <TextBlock
                    title="Hashtag"
                    text={(result.social.instagram?.hashtags ?? []).join(' ')}
                    rows={3}
                  />
                </div>
              </div>
            </section>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">5. 本機保存</h2>
              <p className="mt-1 text-sm text-slate-500">
                資料只存在這台瀏覽器的 IndexedDB，不依賴 Supabase。
              </p>
            </div>
            <button
              type="button"
              onClick={saveWorkflow}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              儲存目前企劃
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {history.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                尚無歷史企劃。
              </p>
            ) : (
              history.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{record.topic}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.category} · {record.sceneCount} 場景 ·{' '}
                      {new Date(record.updatedAt).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => loadWorkflow(record)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      載入
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWorkflow(record.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

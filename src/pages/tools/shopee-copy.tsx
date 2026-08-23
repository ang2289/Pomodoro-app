import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type ShopeeVideoPost = {
  id: number
  title: string | null
  short_title: string | null
  full_post: string | null
  affiliate_url: string | null
  video_url: string | null
  public_page_url: string | null
  product_slug: string | null
  created_at: string | null
}

function safeText(value: string | null | undefined) {
  return String(value || '').trim()
}

export default function ShopeeCopyPage() {
  const [items, setItems] = useState<ShopeeVideoPost[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadPosts() {
      setLoading(true)

      const { data, error } = await supabase
        .from('shopee_video_posts')
        .select('id,title,short_title,full_post,affiliate_url,video_url,public_page_url,product_slug,created_at')
        .order('created_at', { ascending: false })
        .limit(150)

      if (!mounted) return

      if (error) {
        console.error('[ShopeeCopyPage] load failed:', error)
        setItems([])
      } else {
        setItems((data || []) as ShopeeVideoPost[])
      }

      setLoading(false)
    }

    loadPosts()

    return () => {
      mounted = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) =>
      [
        item.title,
        item.short_title,
        item.full_post,
        item.affiliate_url,
        item.public_page_url,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [items, keyword])

  const copyPost = async (item: ShopeeVideoPost) => {
    const text = safeText(item.full_post)

    if (!text) {
      alert('這筆沒有可複製文案')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 1600)
    } catch (error) {
      console.error('[ShopeeCopyPage] copy failed:', error)
      alert('複製失敗，請長按文案手動複製')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4">
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-10 mb-3 rounded-2xl bg-white/95 p-4 shadow backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-900">蝦皮短影音文案複製區</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            最新產出排最上面。手機點「一鍵複製文案」後，直接貼到蝦皮短影音。
          </p>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋商品或文案..."
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-600"
          />

          <div className="mt-2 text-xs text-slate-500">
            共 {filteredItems.length} 筆
          </div>
        </header>

        {loading && (
          <div className="rounded-2xl bg-white p-4 text-center text-slate-600 shadow">
            載入文案中...
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-center text-slate-600 shadow">
            目前沒有文案。請先跑批量短影音，並確認已寫入 Supabase。
          </div>
        )}

        <div className="snap-y snap-mandatory space-y-4">
          {filteredItems.map((item, index) => {
            const copyText = safeText(item.full_post)
            const title = safeText(item.short_title) || safeText(item.title) || '未命名商品'
            const no = `#${String(index + 1).padStart(3, '0')}`

            return (
              <section key={item.id} className="snap-start rounded-2xl bg-white p-4 shadow">
                <div className="mb-2">
                  <div className="text-sm font-bold text-orange-600">{no}</div>
                  <h2 className="mt-1 text-lg font-bold leading-6 text-slate-900">{title}</h2>
                </div>

                <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-800">
                  {copyText || '這筆沒有文案'}
                </pre>

                <button
                  type="button"
                  onClick={() => copyPost(item)}
                  className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white shadow-md transition active:scale-[0.99] hover:bg-blue-700"
                >
                  {copiedId === item.id ? '✅ 已複製，可以貼到蝦皮' : '📋 一鍵複製文案'}
                </button>

                {item.affiliate_url && (
                  <a
                    className="mt-2 block w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-base font-bold text-white shadow-md transition active:scale-[0.99] hover:bg-orange-600"
                    href={item.affiliate_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔥 立即購買（蝦皮）
                  </a>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
                  {item.video_url ? (
                    <a className="rounded-xl bg-blue-100 px-2 py-3 text-blue-800" href={item.video_url} target="_blank" rel="noreferrer">
                      開影片
                    </a>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-2 py-3 text-slate-400">無影片</span>
                  )}

                  {item.public_page_url ? (
                    <a className="rounded-xl bg-green-100 px-2 py-3 text-green-800" href={item.public_page_url} target="_blank" rel="noreferrer">
                      分享頁
                    </a>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-2 py-3 text-slate-400">無頁面</span>
                  )}

                  {item.affiliate_url ? (
                    <a className="rounded-xl bg-orange-100 px-2 py-3 text-orange-800" href={item.affiliate_url} target="_blank" rel="noreferrer">
                      分潤連結
                    </a>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-2 py-3 text-slate-400">無商品</span>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}

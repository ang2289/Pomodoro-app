import { Link, useSearchParams } from 'react-router-dom'

export default function ImageBundleDownloadPage() {
  const [params] = useSearchParams()
  const token = String(params.get('token') || '').trim()
  const validToken = /^[a-f0-9]{64}$/i.test(token)
  const downloadHref = validToken ? `/api/main?action=download-digital-product-bundle&token=${encodeURIComponent(token)}` : ''

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">圖片素材庫完整版下載</h1>
        {validToken ? (
          <>
            <p className="mt-3 text-slate-600">下載連結會驗證核款狀態、7 天期限與最多 3 次下載上限。</p>
            <a href={downloadHref} className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-black text-white shadow-sm transition hover:bg-emerald-700">
              下載完整素材 ZIP
            </a>
          </>
        ) : (
          <>
            <p className="mt-3 text-rose-700">下載連結無效，請向提供連結的管理者確認。</p>
            <Link to="/images" className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-black text-slate-700">回到圖片素材頁</Link>
          </>
        )}
      </section>
    </main>
  )
}

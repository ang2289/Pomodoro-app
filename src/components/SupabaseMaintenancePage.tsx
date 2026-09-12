import { Link } from 'react-router-dom'

type SupabaseMaintenancePageProps = {
  admin?: boolean
}

export default function SupabaseMaintenancePage({ admin = false }: SupabaseMaintenancePageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-16">
      <section className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-7 text-center shadow-sm">
        <p className="text-sm font-bold text-amber-700">{admin ? '管理功能暫停開放' : '功能維護中'}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">此功能目前維護中</h1>
        {!admin && (
          <p className="mt-3 text-sm leading-6 text-slate-700">
            我們正在進行服務維護，其他公開工具與作品頁仍可正常瀏覽。
          </p>
        )}
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
        >
          返回首頁
        </Link>
      </section>
    </main>
  )
}

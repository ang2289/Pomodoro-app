import { Link } from 'react-router-dom';

export default function ToolImageTrafficBanner() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-3 sm:px-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-rose-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-amber-700">需要現成圖片？</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            可先看免費圖片，也有美髮、房仲、寵物等更多圖片素材。
          </p>
        </div>
        <Link
          to="/images"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          查看圖片素材 →
        </Link>
      </div>
    </section>
  );
}

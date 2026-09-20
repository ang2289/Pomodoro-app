import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROFESSIONAL_IMAGE_PACKS, type ProfessionalImagePackId } from '@/data/professionalImagePacks'

const PACKS = PROFESSIONAL_IMAGE_PACKS

const CONTACT_EMAIL = 'rxv0227@gmail.com'
const LINE_ID = 'ang22899'
const BANK = {
  name: '新光銀行',
  code: '103',
  branch: '桃園分行',
  account: '0231-50-801141-0',
  accountName: '何健蒝',
}

export default function ImagePacksPage() {
  const [selectedId, setSelectedId] = useState<ProfessionalImagePackId | null>(null)
  const [copied, setCopied] = useState(false)
  const selectedPack = useMemo(() => PACKS.find((pack) => pack.id === selectedId) || null, [selectedId])

  const selectPack = (id: ProfessionalImagePackId) => {
    setSelectedId(id)
    window.setTimeout(() => {
      document.getElementById('pack-payment')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const copyBankInfo = async () => {
    const text = [
      `${BANK.name}（${BANK.code}）`,
      BANK.branch,
      `帳號：${BANK.account}`,
      `戶名：${BANK.accountName}`,
      selectedPack ? `商品：${selectedPack.name}` : '',
      selectedPack ? `金額：NT$${selectedPack.amount}` : '',
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.alert(text)
    }
  }

  const getReportData = () => {
    if (!selectedPack) {
      window.alert('請先選擇要購買的專業圖片小包。')
      document.getElementById('pack-products')?.scrollIntoView({ behavior: 'smooth' })
      return null
    }

    const subject = `RXV 圖片小包匯款回報｜${selectedPack.name}`
    const body = [
      `商品：${selectedPack.name}`,
      `金額：NT$${selectedPack.amount}`,
      '',
      '匯款日期：',
      '匯款帳號末 5 碼：',
      '姓名：',
      '收件 Email：',
      '',
      '備註：',
    ].join('\n')

    return { subject, body }
  }

  const reportByGmail = () => {
    const report = getReportData()
    if (!report) return
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: CONTACT_EMAIL,
      su: report.subject,
      body: report.body,
    })
    window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  const reportByLine = async () => {
    const report = getReportData()
    if (!report) return
    try {
      await navigator.clipboard.writeText(report.body)
    } catch {
      // 剪貼簿不可用時仍可繼續開 LINE。
    }
    window.open(`https://line.me/R/share?text=${encodeURIComponent(report.body)}`, '_blank', 'noopener,noreferrer')
  }

  const reportByEmail = () => {
    const report = getReportData()
    if (!report) return
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(report.subject)}&body=${encodeURIComponent(report.body)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <Link to="/images" className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline">
            ← 返回圖片素材庫
          </Link>
        </div>

        <section className="rounded-3xl border border-emerald-100 bg-white/90 px-5 py-9 text-center shadow-sm sm:px-8 sm:py-12">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">
            專業職業主題包｜NT$99／包
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">只買自己行業真正會用到的圖</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            每包都是另外整理的職業主題素材，檔名直接標示用途，ZIP 內附授權與使用說明，下載後更容易搜尋與使用。
          </p>
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm font-bold leading-7 text-amber-900 sm:text-base">
            房仲、美髮、美甲、美容 SPA、牙醫、寵物等職業圖片皆包含在 NT$199 完整素材庫；若只需要單一職業，也可選 NT$99 專業小包。<br />
            完整素材庫數量會隨網站持續增加，最新數量以圖片素材庫頁面顯示為準。
            <div className="mt-2">
              <Link to="/images" className="text-emerald-700 underline underline-offset-4">查看全部圖片素材庫</Link>
            </div>
          </div>
        </section>

        <section id="pack-products" className="scroll-mt-28 py-9 sm:py-12">
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">目前可購買的專業小包</h2>
          <p className="mt-2 text-slate-600">目前已上架房仲、美髮、美甲、美容 SPA、牙醫與寵物 6 個專業主題包，皆為 NT$99／包。</p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {PACKS.map((pack) => {
              const accentClass = {
                emerald: 'bg-gradient-to-br from-slate-700 to-emerald-700',
                fuchsia: 'bg-gradient-to-br from-violet-600 to-fuchsia-600',
                rose: 'bg-gradient-to-br from-rose-500 to-pink-600',
                violet: 'bg-gradient-to-br from-violet-600 to-purple-700',
                sky: 'bg-gradient-to-br from-sky-600 to-blue-700',
                amber: 'bg-gradient-to-br from-amber-500 to-orange-600',
              }[pack.accent]
              const buttonClass = {
                emerald: 'bg-emerald-600 hover:bg-emerald-700',
                fuchsia: 'bg-fuchsia-600 hover:bg-fuchsia-700',
                rose: 'bg-rose-600 hover:bg-rose-700',
                violet: 'bg-violet-600 hover:bg-violet-700',
                sky: 'bg-sky-600 hover:bg-sky-700',
                amber: 'bg-amber-600 hover:bg-amber-700',
              }[pack.accent]
              return (
                <article key={pack.id} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className={`rounded-2xl p-6 text-center text-2xl font-black text-white ${accentClass}`}>
                    {pack.category}<br />商用圖片包
                  </div>
                  <span className="mt-5 w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{pack.badge}</span>
                  <h3 className="mt-3 text-xl font-black text-slate-950 sm:text-2xl">{pack.name}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{pack.description}</p>
                  <ul className="mt-4 space-y-2 text-sm font-bold leading-6 text-slate-700">
                    {pack.details.map((detail) => <li key={detail}>✓ {detail}</li>)}
                  </ul>
                  <div className="mt-auto pt-6">
                    <div className="text-3xl font-black text-rose-600">NT$99</div>
                    <button
                      type="button"
                      onClick={() => selectPack(pack.id)}
                      className={`mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl px-5 py-3 font-black !text-white shadow-sm transition hover:-translate-y-0.5 ${buttonClass}`}
                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                    >
                      選這一包｜NT$99
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section id="pack-payment" className="scroll-mt-28 pb-10">
          <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-2xl font-black text-slate-950">付款與交付方式</h2>
            <p className="mt-2 leading-7 text-slate-600">目前採銀行匯款＋Gmail／LINE 人工回報。確認入帳後，以 Email 回覆私人 ZIP 下載連結。</p>

            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 leading-7">
              已選商品：<strong className="text-blue-800">{selectedPack?.name || '尚未選擇'}</strong><br />
              應付金額：<strong className="text-blue-800">{selectedPack ? `NT$${selectedPack.amount}` : '—'}</strong>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">銀行</div><div className="mt-1 font-black text-slate-950">{BANK.name}（{BANK.code}）</div></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">分行</div><div className="mt-1 font-black text-slate-950">{BANK.branch}</div></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">帳號</div><div className="mt-1 break-all font-black text-slate-950">{BANK.account}</div></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black text-slate-500">戶名</div><div className="mt-1 font-black text-slate-950">{BANK.accountName}</div></div>
            </div>

            <ol className="mt-6 space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
              <li><strong>1.</strong> 先選擇要購買的圖片小包。</li>
              <li><strong>2.</strong> 依顯示金額完成銀行匯款。</li>
              <li><strong>3.</strong> 按 Gmail 或 LINE 回報，填入匯款日期、帳號末 5 碼、姓名與收件 Email。</li>
              <li><strong>4.</strong> 確認入帳後，以 Email 回覆私人下載連結。</li>
            </ol>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button type="button" onClick={copyBankInfo} className="min-h-[46px] rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 hover:bg-slate-50">
                {copied ? '已複製匯款資料' : '複製匯款資料'}
              </button>
              <button type="button" onClick={reportByGmail} className="min-h-[46px] rounded-xl bg-emerald-600 px-5 py-3 font-black !text-white hover:bg-emerald-700" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                用 Gmail 回報
              </button>
              <button type="button" onClick={reportByLine} className="min-h-[46px] rounded-xl bg-[#06C755] px-5 py-3 font-black !text-white hover:brightness-95" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                用 LINE 回報
              </button>
              <button type="button" onClick={reportByEmail} className="min-h-[46px] rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 hover:bg-slate-50">
                其他 Email 軟體
              </button>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-600">
              LINE ID：{LINE_ID}。LINE 回報會預帶商品、金額與回報欄位；若尚未加好友，可先加入。
              <a href={`https://line.me/ti/p/~${LINE_ID}`} target="_blank" rel="noopener noreferrer" className="ml-2 font-black text-emerald-700 underline">先加 LINE 好友</a>
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-900">
              完整 ZIP 不直接公開放在免費圖片庫。網站只提供預覽與部分免費圖；付費包確認付款後再提供私人下載連結。
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h2 className="text-lg font-black text-emerald-900">可以使用</h2>
              <p className="mt-2 leading-7 text-slate-600">可用於自有品牌、網站、社群、廣告、Banner、簡報與商業宣傳；可裁切、加字、加 Logo 後使用。</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-white p-5">
              <h2 className="text-lg font-black text-rose-900">不可使用</h2>
              <p className="mt-2 leading-7 text-slate-600">不可轉售、轉送或公開分享原始圖片檔；不可重新打包成素材包、圖庫包或會員下載內容再次販售。</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

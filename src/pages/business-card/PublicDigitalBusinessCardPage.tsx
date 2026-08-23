import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '@/components/SEO'

type PublicProfile = {
  displayName: string
  headline?: string | null
  contactPhone?: string | null
  lineId?: string | null
  contactEmail?: string | null
  websiteUrl?: string | null
  servicesText?: string | null
  qrLink?: string | null
  logoUrl?: string | null
  expiresAt?: string | null
}

function normalizeLink(value?: string | null) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export default function PublicDigitalBusinessCardPage() {
  const { slug = '' } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<PublicProfile | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('')
      try {
        const response = await fetch(`/api/main?action=get-public-business-card-profile&slug=${encodeURIComponent(slug)}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(String(data?.error || '找不到此數位名片頁。'))
        setProfile(data.profile as PublicProfile)
      } catch (err: any) {
        setProfile(null)
        setError(err?.message || '找不到此數位名片頁。')
      } finally { setLoading(false) }
    }
    if (slug) void load()
  }, [slug])

  const openLink = normalizeLink(profile?.websiteUrl || profile?.qrLink)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 px-4 py-10 sm:py-16">
      <SEO title={profile ? `${profile.displayName}｜數位名片` : '數位名片'} description="掃描紙本名片 QR Code，查看聯絡方式與服務介紹。" />
      <div className="mx-auto max-w-lg">
        {loading ? <div className="rounded-[28px] bg-white/10 p-10 text-center text-white shadow-xl">正在開啟數位名片…</div> : error || !profile ? <div className="rounded-[28px] bg-white p-8 text-center shadow-xl"><h1 className="text-2xl font-black text-slate-950">此數位名片頁目前無法開啟</h1><p className="mt-3 text-slate-600">{error || '請確認 QR Code 或網址是否正確。'}</p></div> : <section className="overflow-hidden rounded-[30px] bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-cyan-600 via-cyan-700 to-slate-900 px-6 pb-8 pt-10 text-center text-white sm:px-10">
            {profile.logoUrl ? <img src={profile.logoUrl} alt={`${profile.displayName} Logo`} className="mx-auto mb-5 h-24 w-24 rounded-3xl border-4 border-white/40 bg-white object-contain p-1 shadow-lg" /> : <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-3xl border-4 border-white/40 bg-white/15 text-4xl shadow-lg">🪪</div>}
            <h1 className="text-3xl font-black tracking-tight">{profile.displayName}</h1>
            {profile.headline ? <p className="mt-2 text-base font-bold text-cyan-50">{profile.headline}</p> : null}
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            {profile.servicesText ? <section className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black tracking-[.15em] text-cyan-700">服務介紹</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{profile.servicesText}</p></section> : null}
            <section className="grid gap-3">
              {profile.contactPhone ? <a href={`tel:${profile.contactPhone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-100">☎</span><span className="break-all">{profile.contactPhone}</span></a> : null}
              {profile.lineId ? <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 font-black text-slate-800"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100">LINE</span><span className="break-all">{profile.lineId}</span></div> : null}
              {profile.contactEmail ? <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100">✉</span><span className="break-all">{profile.contactEmail}</span></a> : null}
              {openLink ? <a href={openLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 font-black !text-white shadow-sm transition hover:bg-slate-800" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>前往網站／預約連結 <span>↗</span></a> : null}
            </section>
          </div>
          <div className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400">數位名片由 RXV 夢想創作工作室提供</div>
        </section>}
      </div>
    </main>
  )
}

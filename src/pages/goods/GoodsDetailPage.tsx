
import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';


const RXV_ADMIN_EMAIL = 'ang2289@yahoo.com.tw';

function sanitizePublicText(input: string | null | undefined) {
  return String(input || '')
    .replace(/\s*[｜|、,，]\s*(分潤連結|聯盟連結|導購連結)\s*/g, '')
    .replace(/(分潤連結|聯盟連結|導購連結)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getCurrentUserEmailFromStorage(): string {
  if (typeof window === 'undefined') return '';
  const directKeys = ['userEmail', 'email', 'rxv_user_email', 'currentUserEmail', 'loginEmail'];
  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.includes('@')) return value.trim().toLowerCase();
  }
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const email = parsed?.email || parsed?.user?.email || parsed?.profile?.email || parsed?.account?.email;
      if (typeof email === 'string' && email.includes('@')) return email.trim().toLowerCase();
    } catch {
      // ignore non-JSON localStorage values
    }
  }
  return '';
}

function decode(value: string | null) {
  return decodeURIComponent(value || '').trim();
}

function humanizeSlug(slug: string | undefined) {
  return decodeURIComponent(slug || '').replace(/-/g, ' ').trim();
}

export default function GoodsDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [deleting, setDeleting] = useState(false);
  const isAdmin = getCurrentUserEmailFromStorage() === RXV_ADMIN_EMAIL;

  const data = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const title = sanitizePublicText(decode(params.get('title')) || humanizeSlug(slug) || '商品詳情');
    const desc = sanitizePublicText(decode(params.get('desc')) || '');
    const affiliateUrl = decode(params.get('link')) || '';
    const image = decode(params.get('image')) || '';
    const video = decode(params.get('video')) || '';
    return { title, desc, affiliateUrl, image, video };
  }, [location.search, slug]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('已複製商品頁連結');
    } catch {
      alert('複製失敗，請手動複製');
    }
  };

  const handleDeleteProduct = async () => {
    if (!slug || deleting) return;
    const ok = window.confirm('確定要刪除這個商品分享頁嗎？');
    if (!ok) return;
    setDeleting(true);
    try {
      let deleted = false;
      try {
        const res = await fetch(`/api/commerce?slug=${encodeURIComponent(slug)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'X-RxV-Admin-Email': RXV_ADMIN_EMAIL },
          body: JSON.stringify({ slug }),
        });
        const json = await res.json().catch(() => null);
        deleted = res.ok && (json?.ok !== false);
      } catch {
        deleted = false;
      }
      if (!deleted) {
        try {
          const res = await fetch(`/api/delete-commerce-post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-RxV-Admin-Email': RXV_ADMIN_EMAIL },
            body: JSON.stringify({ slug }),
          });
          const json = await res.json().catch(() => null);
          deleted = res.ok && (json?.ok !== false);
        } catch {
          deleted = false;
        }
      }

      if (!deleted) {
        const { error } = await supabase.from('shopee_video_posts').delete().eq('product_slug', slug);
        if (error) throw error;
      }
      alert('已刪除商品分享頁');
    } catch (err: any) {
      console.error('[GoodsDetailPage] 刪除失敗:', err);
      alert(err?.message || '刪除失敗，請確認 API 或 Supabase 權限設定');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-lg">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {data.video ? (
              <div className="overflow-hidden rounded-2xl bg-black mb-4">
                <video className="w-full aspect-[9/16] object-contain mx-auto" controls playsInline preload="metadata" src={data.video} />
              </div>
            ) : null}
            {data.image ? (
              <div className="overflow-hidden rounded-2xl border bg-slate-100">
                <img src={data.image} alt={data.title} className="w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold tracking-wide text-pink-600">好物推薦</div>
            <h1 className="mb-4 text-3xl font-bold text-slate-900">{data.title}</h1>
            {data.desc ? <p className="mb-6 whitespace-pre-line text-lg leading-8 text-slate-700">{data.desc}</p> : null}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-semibold text-slate-500">想分享給朋友？</div>
              <p className="text-sm leading-6 text-slate-600">覺得這個商品不錯，可以把這個頁面分享給朋友看看。</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={copyText} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">複製商品頁連結</button>
              {data.affiliateUrl ? <a href={data.affiliateUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700">前往賣場看價格</a> : null}
              {isAdmin ? <button onClick={handleDeleteProduct} disabled={deleting} className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{deleting ? '刪除中...' : '刪除商品頁'}</button> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

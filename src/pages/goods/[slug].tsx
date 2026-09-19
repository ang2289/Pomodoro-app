import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import SEO from "@/components/SEO";

import { supabase } from "@/lib/supabase";

const RXV_ADMIN_EMAIL = "ang2289@yahoo.com.tw";

function sanitizePublicText(input: string | null | undefined) {
  return String(input || "")
    .replace(/\s*[｜|、,，]\s*(分潤連結|聯盟連結|導購連結)\s*/g, "")
    .replace(/(分潤連結|聯盟連結|導購連結)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getCurrentUserEmailFromStorage(): string {
  if (typeof window === "undefined") return "";

  const directKeys = ["userEmail", "email", "rxv_user_email", "currentUserEmail", "loginEmail"];
  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.includes("@")) return value.trim().toLowerCase();
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const email = parsed?.email || parsed?.user?.email || parsed?.profile?.email || parsed?.account?.email;
      if (typeof email === "string" && email.includes("@")) return email.trim().toLowerCase();
    } catch {
      // ignore non-JSON localStorage values
    }
  }

  return "";
}


function copyText(text: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success("已複製商品頁連結"),
    () => toast.error("複製失敗")
  );
}

export default function GoodsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/commerce?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setData(json.data);
        } else {
          setError(json.error || "無法取得商品資料");
        }
      })
      .catch(() => setError("無法取得商品資料"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setCurrentUserEmail(getCurrentUserEmailFromStorage());
    const timer = window.setInterval(() => setCurrentUserEmail(getCurrentUserEmailFromStorage()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleDeleteProduct() {
    if (!slug || deleting) return;
    const ok = window.confirm("確定要刪除這個商品分享頁嗎？刪除後前台將無法再顯示這筆資料。");
    if (!ok) return;

    setDeleting(true);
    try {
      let deleted = false;

      try {
        const res = await fetch(`/api/commerce?slug=${encodeURIComponent(slug)}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "X-RxV-Admin-Email": currentUserEmail || RXV_ADMIN_EMAIL },
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
            method: "POST",
            headers: { "Content-Type": "application/json", "X-RxV-Admin-Email": currentUserEmail || RXV_ADMIN_EMAIL },
            body: JSON.stringify({ slug }),
          });
          const json = await res.json().catch(() => null);
          deleted = res.ok && (json?.ok !== false);
        } catch {
          deleted = false;
        }
      }

      if (!deleted) {
        const { error: deleteError } = await supabase
          .from("shopee_video_posts")
          .delete()
          .eq("product_slug", slug);

        if (deleteError) throw deleteError;
      }

      toast.success("已刪除商品分享頁");
      setData(null);
      setError("這筆商品分享頁已刪除");
    } catch (err: any) {
      console.error("[GoodsDetailPage] 刪除失敗:", err);
      toast.error(err?.message || "刪除失敗，請確認 API 或 Supabase 權限設定");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-8 text-center">載入中...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center">找不到商品</div>;

  const { video, image, affiliateUrl } = data;
  const shortTitle = sanitizePublicText(data.shortTitle || data.title);
  const shortDescription = sanitizePublicText(data.shortDescription || data.description);
  const pain = sanitizePublicText(data.pain);
  const benefit = sanitizePublicText(data.benefit);
  const proof = sanitizePublicText(data.proof);
  const cta = sanitizePublicText(data.cta);
  const keywords = sanitizePublicText(data.keywords);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const isAdmin = currentUserEmail.toLowerCase() === RXV_ADMIN_EMAIL;

  return (
    <>
      <SEO
        title={shortTitle || "商品詳情"}
        description={shortDescription || "商品分享頁"}
        keywords={keywords || "好物推薦,商品分享,短影音商品頁"}
        path={`/goods/${slug}`}
      />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold text-slate-900">{shortTitle}</h1>
        {shortDescription && <p className="mb-4 whitespace-pre-wrap text-base leading-7 text-slate-700">{shortDescription}</p>}
        {video ? (
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-black shadow">
            <video controls playsInline className="aspect-[9/16] max-h-[720px] w-full bg-black" preload="metadata">
              <source src={video} type="video/mp4" />
              您的瀏覽器不支援影片播放。
            </video>
          </div>
        ) : (
          image && <img src={image} alt={shortTitle} className="mb-6 w-full rounded-xl border border-slate-200" />
        )}
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 text-sm font-medium text-slate-700">想分享給朋友？</div>
          <p className="text-sm leading-6 text-slate-600">
            覺得這個商品不錯，可以把這個頁面分享給朋友看看。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(pageUrl)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              複製商品頁連結
            </button>
            {affiliateUrl ? (
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
              >
                前往賣場看價格
              </a>
            ) : null}
            {isAdmin ? (
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "刪除中..." : "刪除商品頁"}
              </button>
            ) : null}
          </div>
        </div>
        {image && (
          <div className="mb-6">
            <img src={image} alt={shortTitle} className="w-full rounded-xl border border-slate-200" />
          </div>
        )}
        {pain && <div className="mb-2 text-base text-slate-700"><b>痛點：</b>{pain}</div>}
        {benefit && <div className="mb-2 text-base text-slate-700"><b>好處：</b>{benefit}</div>}
        {proof && <div className="mb-2 text-base text-slate-700"><b>證明：</b>{proof}</div>}
        {cta && <div className="mb-2 text-base text-slate-700"><b>行動呼籲：</b>{cta}</div>}
      </div>
    </>
  );
}

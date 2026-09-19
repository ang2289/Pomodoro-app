import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
    () => toast.error("複製失敗，請手動複製網址")
  );
}

function normalizeHashtags(input: string) {
  const seen = new Set<string>();
  const parts = String(input || "")
    .replace(/\n/g, ",")
    .split(/[,#、|]/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const tags: string[] = [];
  for (const part of parts) {
    const clean = part.replace(/^#+/, "").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(`#${clean}`);
  }
  return tags.join(" ");
}

function getFirstLine(text: string) {
  return String(text || "").split(/\r?\n/).map((x) => x.trim()).find(Boolean) || "";
}

function cleanTitle(title: string) {
  return sanitizePublicText(String(title || "好物推薦"))
    .replace(/【[^】]*】/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildBullets(title: string, desc: string) {
  const text = `${title} ${desc}`;

  if (/爆米花|餅乾|零食|華元|卡滋/i.test(text)) {
    return ["追劇、辦公室、聚會都適合", "大份量更有感，不怕一下吃完", "多種口味可選，分享也方便"];
  }

  if (/凡士林|保濕|乾裂|脫皮|修護|凝膠/i.test(text)) {
    return ["乾裂、脫皮、乾癢時可隨手用", "小罐好攜帶，居家外出都方便", "經典萬用保養品，家裡常備更安心"];
  }

  if (/衣架|防滑|曬衣|掛衣/i.test(text)) {
    return ["防滑設計，衣服比較不容易掉", "加粗加厚，日常晾曬更穩", "衣櫃與陽台收納更整齊"];
  }

  if (/氣炸鍋|烘焙紙|硅油紙|吸油紙/i.test(text)) {
    return ["減少油垢殘留，清潔更輕鬆", "用完即丟，省下刷洗時間", "氣炸鍋、烘焙料理都很實用"];
  }

  if (/牆貼|磁吸|免打孔|收納|琺瑯板/i.test(text)) {
    return ["免打孔，不想破壞牆面更適合", "磁吸收納，廚房小物更好拿", "租屋族與小空間收納都能用"];
  }

  return ["解決日常小困擾，使用更省事", "價格入手門檻低，適合先試用", "適合家用、辦公室或日常備品"];
}

export default function GoodsSharePage() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [deleting, setDeleting] = useState(false);
  const currentUserEmail = getCurrentUserEmailFromStorage();
  const isAdmin = currentUserEmail.toLowerCase() === RXV_ADMIN_EMAIL;

  const rawTitle = params.get("title") || "好物推薦";
  const title = cleanTitle(rawTitle);
  const desc = sanitizePublicText(params.get("desc") || "");
  const fullPost = sanitizePublicText(params.get("fullPost") || "");
  const video = params.get("video") || "";
  const link = params.get("link") || "";
  const image = params.get("image") || "/assets/airfryer-keshaui-cover.png";
  const keywords = sanitizePublicText(params.get("keywords") || "");
  const hashtags = sanitizePublicText(params.get("hashtags") || normalizeHashtags(keywords));
  const hook = getFirstLine(fullPost) || title;
  const bullets = buildBullets(title, desc || fullPost);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const threadsShareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent([hook, pageUrl].filter(Boolean).join("\n\n"))}`;

  async function handleDeleteProduct() {
    if (deleting) return;
    const slug = params.get("slug") || params.get("product_slug") || "";
    const ok = window.confirm("確定要刪除這個商品分享資料嗎？");
    if (!ok) return;

    setDeleting(true);
    try {
      let deleted = false;
      if (slug) {
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
      }

      if (!deleted && slug) {
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

      if (!deleted && slug) {
        const { error } = await supabase.from("shopee_video_posts").delete().eq("product_slug", slug);
        if (error) throw error;
        deleted = true;
      }

      if (!deleted) {
        toast.error("這個分享頁沒有 slug，無法直接刪除資料庫紀錄");
        return;
      }

      toast.success("已刪除商品分享資料");
    } catch (err: any) {
      console.error("[GoodsSharePage] 刪除失敗:", err);
      toast.error(err?.message || "刪除失敗，請確認 API 或 Supabase 權限設定");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <SEO
        title={hook || title}
        description={desc || "好物分享商品頁"}
        keywords={hashtags}
        path="/goods/share"
        image={image}
        ogType={video ? "video.other" : "website"}
        video={video}
        url={pageUrl || undefined}
      />

      <main className="min-h-screen bg-slate-100 px-3 py-4">
        <article className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-lg">
          <section className="bg-gradient-to-br from-orange-50 via-white to-rose-50 px-4 pb-5 pt-5">
            <div className="mb-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
              🔥 好物推薦・限時入手
            </div>

            <h1 className="text-3xl font-black leading-tight text-slate-950">
              {hook || title}
            </h1>

            {desc ? (
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-700">
                {desc}
              </p>
            ) : null}
          </section>

          <section className="px-4">
            {video ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow">
                <video controls playsInline className="aspect-[9/16] max-h-[760px] w-full bg-black object-contain" preload="metadata">
                  <source src={video} type="video/mp4" />
                  您的瀏覽器不支援影片播放。
                </video>
              </div>
            ) : (
              <img src={image} alt={title} className="w-full rounded-2xl border border-slate-200 bg-white object-cover shadow" />
            )}
          </section>

          {link ? (
            <section className="sticky top-0 z-20 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-2xl bg-orange-500 px-5 py-4 text-center text-lg font-black text-white shadow-lg transition hover:bg-orange-600 active:scale-[0.99]"
              >
                🔥 前往賣場看價格
              </a>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600">
                <span className="rounded-full bg-orange-50 px-2 py-1">限時特價</span>
                <span className="rounded-full bg-green-50 px-2 py-1">價格以賣場為準</span>
                <span className="rounded-full bg-blue-50 px-2 py-1">手機可開</span>
              </div>
            </section>
          ) : null}

          <section className="px-4 py-5">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <h2 className="text-xl font-black text-slate-900">為什麼這款值得看？</h2>
              <ul className="mt-3 space-y-2 text-base leading-7 text-slate-800">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-bold text-green-600">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">購買前提醒</h2>
              <div className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                <p>・價格、規格、庫存與優惠請以賣場實際顯示為準。</p>
                <p>・若有贈品或活動，數量有限，送完為止。</p>
                <p>・本文為商品資訊分享，實際體驗依個人使用情況而定。</p>
              </div>
            </div>

            {hashtags ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <div className="mb-2 font-bold text-slate-900">相關關鍵字</div>
                <div className="whitespace-pre-wrap">{hashtags}</div>
              </div>
            ) : null}

            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block w-full rounded-2xl bg-red-600 px-5 py-4 text-center text-lg font-black text-white shadow-lg transition hover:bg-red-700 active:scale-[0.99]"
              >
                👉 前往賣場看價格
              </a>
            ) : null}
          </section>

          <section className="border-t border-slate-200 bg-slate-50 px-4 py-5">
            <h2 className="text-lg font-black text-slate-900">想分享給朋友？</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              覺得這個商品不錯，可以把這個頁面分享給朋友看看。
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => copyText(pageUrl)}
                className="rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                📋 複製商品頁連結
              </button>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  disabled={deleting}
                  className="rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "刪除中..." : "刪除商品"}
                </button>
              ) : null}

              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-indigo-600 px-3 py-3 text-center text-sm font-bold text-white hover:bg-indigo-700"
              >
                Facebook
              </a>

              <a
                href={lineShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-green-600 px-3 py-3 text-center text-sm font-bold text-white hover:bg-green-700"
              >
                LINE
              </a>

              <a
                href={threadsShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-slate-900 px-3 py-3 text-center text-sm font-bold text-white hover:bg-black"
              >
                Threads
              </a>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

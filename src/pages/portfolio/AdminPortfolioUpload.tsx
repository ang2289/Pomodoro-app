import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, LoaderCircle, LockKeyhole, UploadCloud } from "lucide-react";
import SEO from "@/components/SEO";

type PortfolioCategory = "商品圖設計" | "LINE 貼圖" | "名片設計" | "品牌視覺";
type AccessState = "checking" | "admin" | "signed-out" | "forbidden" | "error";

const categories: PortfolioCategory[] = ["商品圖設計", "LINE 貼圖", "名片設計", "品牌視覺"];

function getAuthToken() {
  if (typeof window === "undefined") return "";
  return String(localStorage.getItem("auth_token") || localStorage.getItem("token") || "").trim();
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("圖片讀取失敗，請重新選擇。"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPortfolioUpload() {
  const [access, setAccess] = useState<AccessState>("checking");
  const [adminEmail, setAdminEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PortfolioCategory>("商品圖設計");
  const [businessType, setBusinessType] = useState("");
  const [usageType, setUsageType] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    const token = getAuthToken();
    if (!token) {
      setAccess("signed-out");
      return;
    }

    void fetch("/api/main?action=get-design-portfolio-admin-status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok && data?.isAdmin) {
          setAdminEmail(String(data.email || ""));
          setAccess("admin");
        } else if (response.status === 401) {
          setAccess("signed-out");
        } else if (response.status === 403) {
          setAccess("forbidden");
        } else {
          setAccess("error");
        }
      })
      .catch(() => {
        if (active) setAccess("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const chooseFile = (nextFile: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : "");
    setMessage("");
    if (nextFile && !title) {
      setTitle(nextFile.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    }
  };

  const upload = async () => {
    if (!file || !title.trim()) {
      setIsError(true);
      setMessage(!file ? "請先選擇作品圖片。" : "請填寫客戶看得懂的作品名稱。");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setIsError(true);
      setMessage("圖片請控制在 8MB 以內。");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setAccess("signed-out");
      return;
    }

    setUploading(true);
    setIsError(false);
    setMessage("正在上傳作品，請稍候…");

    try {
      const base64 = await fileToDataUrl(file);
      const response = await fetch("/api/main?action=admin-upload-design-portfolio", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64,
          title: title.trim(),
          category,
          businessType: businessType.trim(),
          usageType: usageType.trim(),
          description: description.trim(),
          sortOrder,
          isFeatured: true,
          isPublic: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(data?.error || "作品上傳失敗。"));

      setMessage("上傳完成，客戶現在可以在接案頁看到這張作品。");
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setTitle("");
      setBusinessType("");
      setUsageType("");
      setDescription("");
      setSortOrder(0);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "作品上傳失敗，請稍後再試。");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <SEO
        title="作品管理｜RxV 夢想創作工作室"
        description="管理者專用的設計作品上傳頁。"
        canonical="/admin/portfolio-upload"
      />

      <main className="min-h-screen bg-[#fffaf2] px-4 py-10 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-orange-700">管理者專用</p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">新增作品圖片</h1>
            </div>
            <Link
              to="/services/design-commission#portfolio"
              className="rounded-2xl border border-orange-200 bg-white px-5 py-3 font-black text-orange-800 shadow-sm"
            >
              回到接案作品集
            </Link>
          </div>

          {access === "checking" ? (
            <div className="mt-8 flex items-center justify-center gap-3 rounded-3xl bg-white p-10 shadow-sm">
              <LoaderCircle className="h-6 w-6 animate-spin text-orange-600" />
              正在確認管理者身分…
            </div>
          ) : null}

          {access === "signed-out" ? (
            <section className="mt-8 rounded-3xl border border-orange-200 bg-white p-8 text-center shadow-sm">
              <LockKeyhole className="mx-auto h-10 w-10 text-orange-600" />
              <h2 className="mt-4 text-2xl font-black">請先用管理者 Email 登入</h2>
              <p className="mt-3 text-slate-600">登入成功後才會顯示作品上傳功能。</p>
              <Link
                to="/login?returnTo=%2Fadmin%2Fportfolio-upload"
                className="mt-6 inline-flex rounded-2xl bg-orange-500 px-6 py-3 font-black !text-white shadow"
              >
                前往登入
              </Link>
            </section>
          ) : null}

          {access === "forbidden" ? (
            <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
              <LockKeyhole className="mx-auto h-10 w-10 text-rose-600" />
              <h2 className="mt-4 text-2xl font-black">這個帳號沒有管理權限</h2>
              <p className="mt-3 text-rose-800">請登出後改用已設定的管理者 Email 登入。</p>
            </section>
          ) : null}

          {access === "error" ? (
            <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
              暫時無法確認管理權限，請重新整理後再試。
            </section>
          ) : null}

          {access === "admin" ? (
            <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <ImagePlus className="h-7 w-7 text-orange-600" />
                  <div>
                    <h2 className="text-2xl font-black">上傳給客戶看的作品</h2>
                    <p className="mt-1 text-sm text-slate-500">登入帳號：{adminEmail}</p>
                  </div>
                </div>

                <label className="mt-6 block">
                  <span className="mb-2 block font-bold">作品圖片</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => chooseFile(event.target.files?.[0] || null)}
                    className="block w-full cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 file:mr-4 file:rounded-xl file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-bold file:text-white"
                  />
                </label>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block font-bold">作品名稱</span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="例如：水果塔商品照前後優化"
                      className="min-h-[50px] w-full rounded-2xl border border-slate-200 px-4"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block font-bold">服務分類</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as PortfolioCategory)}
                      className="min-h-[50px] w-full rounded-2xl border border-slate-200 bg-white px-4"
                    >
                      {categories.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block font-bold">適合對象</span>
                    <input
                      value={businessType}
                      onChange={(event) => setBusinessType(event.target.value)}
                      placeholder="例如：甜點店、個人烘焙"
                      className="min-h-[50px] w-full rounded-2xl border border-slate-200 px-4"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block font-bold">可使用在哪裡</span>
                    <input
                      value={usageType}
                      onChange={(event) => setUsageType(event.target.value)}
                      placeholder="例如：FB、IG、菜單"
                      className="min-h-[50px] w-full rounded-2xl border border-slate-200 px-4"
                    />
                  </label>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block font-bold">作品介紹</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    placeholder="用客戶看得懂的方式，說明這張作品改善了什麼。"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 leading-7"
                  />
                </label>

                <label className="mt-5 block max-w-[180px]">
                  <span className="mb-2 block font-bold">顯示順序</span>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(event) => setSortOrder(Number(event.target.value))}
                    className="min-h-[50px] w-full rounded-2xl border border-slate-200 px-4"
                  />
                </label>

                {message ? (
                  <p className={`mt-5 rounded-2xl p-4 font-bold ${isError ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>
                    {message}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={uploading}
                  onClick={upload}
                  className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-black text-white shadow transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {uploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                  {uploading ? "上傳中…" : "上傳並公開到作品集"}
                </button>
              </div>

              <aside className="h-fit rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black">圖片預覽</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {previewUrl ? (
                    <img src={previewUrl} alt="即將上傳的作品預覽" className="aspect-square w-full object-contain" />
                  ) : (
                    <div className="grid aspect-square place-items-center p-6 text-center text-slate-500">
                      選擇圖片後會在這裡完整預覽
                    </div>
                  )}
                </div>
                <p className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm leading-7 text-sky-900">
                  建議上傳 JPG、PNG 或 WebP，圖片 8MB 以內。LINE 貼圖總覽請保留四周留白，避免角色被裁切。
                </p>
              </aside>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}

import type { TFunction } from "i18next";
import type { LabelPosition, LabelStyle } from "@/lib/qrCompositeCanvas";
import QRStickerOptions from "./QRStickerOptions";

type QrType = "url" | "text" | "email" | "phone" | "wifi";
type BusinessTemplate = "restaurant" | "ig" | "card" | null;
type WifiSec = "WPA" | "WPA3" | "WEP" | "nopass";

const SIZE_OPTIONS = [128, 256, 512, 1024] as const;

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#333333",
  "#e73636",
  "#1d4ed8",
  "#16a34a",
  "#6d28d9",
  "#ea580c",
  "#0f172a",
  "#b45309",
];

type Props = {
  t: TFunction;
  fieldClass: string;
  typeTabs: { id: QrType; label: string }[];
  qrType: QrType;
  setQrType: (v: QrType) => void;
  urlInput: string;
  setUrlInput: (v: string) => void;
  textInput: string;
  setTextInput: (v: string) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  phoneInput: string;
  setPhoneInput: (v: string) => void;
  wifiSsid: string;
  setWifiSsid: (v: string) => void;
  wifiPassword: string;
  setWifiPassword: (v: string) => void;
  wifiSecurity: WifiSec;
  setWifiSecurity: (v: WifiSec) => void;
  wifiSecOptions: readonly { value: WifiSec; label: string }[];
  qrStyle: "classic" | "blue" | "green" | "gold";
  setQrStyle: (v: "classic" | "blue" | "green" | "gold") => void;
  onPickQrStyle: () => void;
  fgColor: string;
  setFgColor: (v: string) => void;
  bgColor: string;
  setBgColor: (v: string) => void;
  socialSizes: { name: string; size: number }[];
  qrSize: number;
  setQrSize: (v: number) => void;
  logoFile: File | null;
  setLogoFile: (f: File | null) => void;
  clearLogo: () => void;
  applyBusinessTemplate: (template: Exclude<BusinessTemplate, null>) => void;
  resetBusinessTemplate: () => void;
  shortUrlLoading: boolean;
  shortUrlError: string;
  shortUrlNotice: string;
  shortUrl: string;
  shortUrlAppliedToField?: boolean;
  handleGenerateShortUrl: () => void;
  openShortUrl: () => void;
  copyShortUrl: () => void;
  labelShowDescription: boolean;
  setLabelShowDescription: (v: boolean) => void;
  labelDescription: string;
  setLabelDescription: (v: string) => void;
  labelShowPayload: boolean;
  setLabelShowPayload: (v: boolean) => void;
  labelPosition: LabelPosition;
  setLabelPosition: (v: LabelPosition) => void;
  labelStyle: LabelStyle;
  setLabelStyle: (v: LabelStyle) => void;
};

export default function QRSettingsPanel({
  t,
  fieldClass,
  typeTabs,
  qrType,
  setQrType,
  urlInput,
  setUrlInput,
  textInput,
  setTextInput,
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  wifiSsid,
  setWifiSsid,
  wifiPassword,
  setWifiPassword,
  wifiSecurity,
  setWifiSecurity,
  wifiSecOptions,
  qrStyle,
  setQrStyle,
  onPickQrStyle,
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  socialSizes,
  qrSize,
  setQrSize,
  logoFile,
  setLogoFile,
  clearLogo,
  applyBusinessTemplate,
  resetBusinessTemplate,
  shortUrlLoading,
  shortUrlError,
  shortUrlNotice,
  shortUrl,
  shortUrlAppliedToField,
  handleGenerateShortUrl,
  openShortUrl,
  copyShortUrl,
  labelShowDescription,
  setLabelShowDescription,
  labelDescription,
  setLabelDescription,
  labelShowPayload,
  setLabelShowPayload,
  labelPosition,
  setLabelPosition,
  labelStyle,
  setLabelStyle,
}: Props) {
  const qrStylePresets = [
    { id: "classic" as const, label: "黑白經典", fg: "#000000", bg: "#ffffff" },
    { id: "blue" as const, label: "藍色科技", fg: "#2563eb", bg: "#ffffff" },
    { id: "green" as const, label: "品牌綠", fg: "#16a34a", bg: "#ffffff" },
    { id: "gold" as const, label: "精品金黑", fg: "#b45309", bg: "#000000" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 1. 內容設定 */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-sm font-semibold text-slate-900">內容設定</h3>
        <p className="mt-1 text-xs text-slate-500">{t("qr.section.content")}</p>
        <div className="mt-4 rounded-xl bg-slate-100 p-1.5">
          <div className="grid grid-cols-5 gap-1.5">
            {typeTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setQrType(tab.id)}
                className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-medium transition ${
                  qrType === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-transparent text-slate-700 hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {qrType === "url" && (
            <>
              <label htmlFor="qr-url" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("qr.section.url_label")}
              </label>
              <input
                id="qr-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className={fieldClass}
                autoComplete="url"
              />
              <p className="text-xs text-slate-400">{t("qr.section.url_hint")}</p>
            </>
          )}
          {qrType === "text" && (
            <>
              <label htmlFor="qr-text" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("qr.section.text_label")}
              </label>
              <textarea
                id="qr-text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                placeholder={t("qr.section.text_ph")}
                className={fieldClass}
              />
              <p className="text-xs text-slate-400">{t("qr.section.text_hint")}</p>
            </>
          )}
          {qrType === "email" && (
            <>
              <label htmlFor="qr-email" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("qr.section.email_label")}
              </label>
              <input
                id="qr-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@email.com"
                className={fieldClass}
                autoComplete="email"
              />
              <p className="text-xs text-slate-400">{t("qr.section.email_hint")}</p>
            </>
          )}
          {qrType === "phone" && (
            <>
              <label htmlFor="qr-phone" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("qr.section.phone_label")}
              </label>
              <input
                id="qr-phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0912345678"
                className={fieldClass}
                autoComplete="tel"
              />
              <p className="text-xs text-slate-400">{t("qr.section.phone_hint")}</p>
            </>
          )}
          {qrType === "wifi" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="qr-wifi-ssid" className="text-xs font-medium text-slate-500">
                  {t("qr.section.ssid")}
                </label>
                <input
                  id="qr-wifi-ssid"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyWiFi"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="qr-wifi-sec" className="text-xs font-medium text-slate-500">
                  {t("qr.section.sec")}
                </label>
                <select
                  id="qr-wifi-sec"
                  value={wifiSecurity}
                  onChange={(e) => setWifiSecurity(e.target.value as WifiSec)}
                  className={fieldClass}
                >
                  {wifiSecOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {wifiSecurity !== "nopass" ? (
                <div>
                  <label htmlFor="qr-wifi-pw" className="text-xs font-medium text-slate-500">
                    {t("qr.section.password")}
                  </label>
                  <input
                    id="qr-wifi-pw"
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder={t("qr.placeholder.wifiPw")}
                    className={fieldClass}
                    autoComplete="off"
                  />
                </div>
              ) : null}
              <p className="text-xs text-slate-400">{t("qr.section.wifi_fmt")}</p>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleGenerateShortUrl}
            disabled={shortUrlLoading}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {shortUrlLoading ? t("qr.shortUrl.generating") : t("qr.shortUrl.generate")}
          </button>
          <p className="mt-2 text-xs text-slate-500">{t("qr.section.short_hint")}</p>
          {shortUrlError ? (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <p className="font-medium">{t("qr.shortUrl.fail_title")}</p>
              <p className="mt-1 break-words">{shortUrlError}</p>
            </div>
          ) : null}
          {shortUrlNotice ? (
            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {shortUrlNotice}
            </div>
          ) : null}
          {shortUrl ? (
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs">
              <p className="font-medium text-emerald-900">{t("qr.shortUrl.done")}</p>
              {shortUrlAppliedToField ? (
                <p className="mt-1 text-emerald-800">{t("qr.shortUrl.appliedToField")}</p>
              ) : null}
              <p className="mt-2 break-all font-mono text-[13px] text-slate-800">{shortUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openShortUrl}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                >
                  {t("qr.shortUrl.open")}
                </button>
                <button
                  type="button"
                  onClick={copyShortUrl}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  {t("qr.shortUrl.copy")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 2. 一鍵套用模板 */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-sm font-semibold text-slate-900">{t("qr.templates.title")}</h3>
        <p className="mt-1 text-xs text-slate-500">{t("qr.templates.subtitle")}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => applyBusinessTemplate("restaurant")}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            {t("qr.templates.restaurant")}
          </button>
          <button
            type="button"
            onClick={() => applyBusinessTemplate("ig")}
            className="rounded-xl border border-pink-200 bg-white px-3 py-2.5 text-sm font-medium text-pink-700 hover:bg-pink-50"
          >
            {t("qr.templates.ig")}
          </button>
          <button
            type="button"
            onClick={() => applyBusinessTemplate("card")}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            {t("qr.templates.card")}
          </button>
        </div>
        <button
          type="button"
          onClick={resetBusinessTemplate}
          className="mt-3 w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {t("qr.templates.reset")}
        </button>
      </section>

      {/* 3. QR 外觀設定 */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-sm font-semibold text-slate-900">QR 外觀設定</h3>
        <p className="mt-1 text-xs text-slate-500">{t("qr.color.style_label")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {qrStylePresets.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onPickQrStyle();
                setQrStyle(s.id);
                setFgColor(s.fg);
                setBgColor(s.bg);
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                qrStyle === s.id
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="qr-fg" className="text-xs font-medium text-slate-500">
              {t("qr.color.fg")}
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                id="qr-fg"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 p-0.5"
                aria-label={t("qr.color.aria_fg")}
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFgColor(c)}
                  className="h-6 w-6 rounded-full border border-slate-200"
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="qr-bg" className="text-xs font-medium text-slate-500">
              {t("qr.color.bg")}
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                id="qr-bg"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 p-0.5"
                aria-label={t("qr.color.aria_bg")}
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBgColor(c)}
                  className="h-6 w-6 rounded-full border border-slate-200"
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. 貼紙 */}
      <QRStickerOptions
        fieldClass={fieldClass}
        labelShowDescription={labelShowDescription}
        setLabelShowDescription={setLabelShowDescription}
        labelDescription={labelDescription}
        setLabelDescription={setLabelDescription}
        labelShowPayload={labelShowPayload}
        setLabelShowPayload={setLabelShowPayload}
        labelPosition={labelPosition}
        setLabelPosition={setLabelPosition}
        labelStyle={labelStyle}
        setLabelStyle={setLabelStyle}
      />

      {/* 5. 尺寸與輸出 */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-sm font-semibold text-slate-900">尺寸與輸出</h3>
        <p className="mt-1 text-xs text-slate-500">{t("qr.socialSize.label")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {socialSizes.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setQrSize(s.size)}
              className={`rounded-lg border px-3 py-2 text-xs ${
                qrSize === s.size ? "border-blue-600 bg-blue-50 font-medium text-blue-800" : "border-slate-200"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <h4 className="mt-6 text-xs font-semibold text-slate-700">{t("qr.output.px")}</h4>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQrSize(s)}
              className={`rounded-xl border py-2 text-sm tabular-nums ${
                qrSize === s ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* 6. Logo */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-sm font-semibold text-slate-900">{t("qr.logo.title")}</h3>
        <p className="mt-1 text-sm text-slate-600">{t("qr.logo.desc")}</p>
        <input
          id="qr-logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <label
            htmlFor="qr-logo-upload"
            className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t("qr.logo.pick")}
          </label>
          {logoFile ? (
            <button
              type="button"
              onClick={clearLogo}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              {t("qr.logo.remove")}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

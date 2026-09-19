import type { LabelPosition, LabelStyle } from "@/lib/qrCompositeCanvas";

type Props = {
  fieldClass: string;
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

export default function QRStickerOptions({
  fieldClass,
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
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <h3 className="text-sm font-semibold text-slate-900">QR Code 說明貼紙／標籤卡片</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        PNG 下載為 800×900 合成圖。未勾選說明且文字為空時，不會保留空白說明區。
      </p>

      <div className="mt-4 space-y-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={labelShowDescription}
            onChange={(e) => setLabelShowDescription(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 shrink-0"
          />
          <span>顯示說明文字</span>
        </label>
        <div>
          <label htmlFor="qr-label-desc" className="text-xs font-medium text-slate-500">
            說明文字
          </label>
          <input
            id="qr-label-desc"
            type="text"
            value={labelDescription}
            onChange={(e) => setLabelDescription(e.target.value)}
            placeholder="掃描查看內容"
            disabled={!labelShowDescription}
            className={`${fieldClass} ${!labelShowDescription ? "opacity-60" : ""}`}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={labelShowPayload}
            onChange={(e) => setLabelShowPayload(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 shrink-0"
          />
          <span>顯示 QR Code 內的實際內容</span>
        </label>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">
            標籤位置（商家小卡為固定版式）
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
              <input
                type="radio"
                name="qr-label-pos"
                checked={labelPosition === "top"}
                onChange={() => setLabelPosition("top")}
                disabled={labelStyle === "merchant_card"}
                className="h-4 w-4"
              />
              上方
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
              <input
                type="radio"
                name="qr-label-pos"
                checked={labelPosition === "bottom"}
                onChange={() => setLabelPosition("bottom")}
                disabled={labelStyle === "merchant_card"}
                className="h-4 w-4"
              />
              下方
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="qr-label-style" className="mb-2 block text-xs font-medium text-slate-500">
            標籤樣式
          </label>
          <select
            id="qr-label-style"
            value={labelStyle}
            onChange={(e) => setLabelStyle(e.target.value as LabelStyle)}
            className={fieldClass}
          >
            <option value="simple_white">簡約白底</option>
            <option value="black_white">黑底白字</option>
            <option value="rounded_sticker">圓角貼紙</option>
            <option value="merchant_card">商家小卡</option>
          </select>
        </div>
      </div>
    </section>
  );
}

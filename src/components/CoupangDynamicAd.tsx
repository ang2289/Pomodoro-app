import { useEffect, useRef, useState } from "react";
import { COUPANG_DYNAMIC_WIDGET } from "@/config/coupangAds";

type CoupangDynamicAdProps = {
  subId: string;
  className?: string;
  desktopWidth?: number;
  desktopHeight?: number;
  mobileWidth?: number;
  mobileHeight?: number;
  priority?: boolean;
};

export default function CoupangDynamicAd({
  subId,
  className = "",
  desktopWidth = COUPANG_DYNAMIC_WIDGET.desktopWidth,
  desktopHeight = COUPANG_DYNAMIC_WIDGET.desktopHeight,
  mobileWidth = COUPANG_DYNAMIC_WIDGET.mobileWidth,
  mobileHeight = COUPANG_DYNAMIC_WIDGET.mobileHeight,
  priority = false,
}: CoupangDynamicAdProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const slotRef = useRef<HTMLDivElement | null>(null);
  const [slotWidth, setSlotWidth] = useState(() =>
    typeof window !== "undefined" ? Math.max(280, window.innerWidth - 24) : desktopWidth,
  );
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const measure = () => setSlotWidth(Math.max(1, slot.clientWidth));
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(slot);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);
  // 以容器實際寬度決定 widget 參數，避免工具卡片內的 iframe 被擠壓或截斷。
  const width = Math.max(1, Math.min(isMobile ? mobileWidth : desktopWidth, slotWidth));
  const height = isMobile ? mobileHeight : desktopHeight;

  const src =
    `https://ads-partners.tw.coupang.com/widgets.html?id=${COUPANG_DYNAMIC_WIDGET.id}` +
    `&template=${COUPANG_DYNAMIC_WIDGET.template}` +
    `&trackingCode=${COUPANG_DYNAMIC_WIDGET.trackingCode}` +
    `&subId=${encodeURIComponent(subId)}` +
    `&width=${width}&height=${height}&tsource=`;

  return (
    <aside
      className={`my-6 w-full overflow-hidden ${className}`}
      aria-label="Coupang Partners 動態商品推薦"
      data-coupang-dynamic-sub-id={subId}
    >
      <div className="mb-1 text-center text-[11px] font-semibold text-slate-400">
        Coupang 推薦
      </div>
      <div ref={slotRef} className="flex w-full justify-center overflow-hidden">
      <iframe
        title="Coupang Partners 動態商品推薦"
        src={src}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        referrerPolicy="unsafe-url"
        loading={priority ? "eager" : "lazy"}
        className="block max-w-full border-0"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: "100%" }}
      />
      </div>
    </aside>
  );
}

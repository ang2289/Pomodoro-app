import { useEffect, useState } from "react";
import { COUPANG_DYNAMIC_WIDGET } from "@/config/coupangAds";

type CoupangDynamicAdProps = {
  subId: string;
  className?: string;
};

export default function CoupangDynamicAd({
  subId,
  className = "",
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

  const width = isMobile
    ? COUPANG_DYNAMIC_WIDGET.mobileWidth
    : COUPANG_DYNAMIC_WIDGET.desktopWidth;
  const height = isMobile
    ? COUPANG_DYNAMIC_WIDGET.mobileHeight
    : COUPANG_DYNAMIC_WIDGET.desktopHeight;

  const src =
    `https://ads-partners.tw.coupang.com/widgets.html?id=${COUPANG_DYNAMIC_WIDGET.id}` +
    `&template=${COUPANG_DYNAMIC_WIDGET.template}` +
    `&trackingCode=${COUPANG_DYNAMIC_WIDGET.trackingCode}` +
    `&subId=${encodeURIComponent(subId)}` +
    `&width=${width}&height=${height}&tsource=`;

  return (
    <aside
      className={`my-6 flex w-full justify-center overflow-hidden ${className}`}
      aria-label="Coupang Partners 動態商品推薦"
      data-coupang-dynamic-sub-id={subId}
    >
      <iframe
        title="Coupang Partners 動態商品推薦"
        src={src}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        referrerPolicy="unsafe-url"
        loading="lazy"
        className="block max-w-full border-0"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: "100%" }}
      />
    </aside>
  );
}

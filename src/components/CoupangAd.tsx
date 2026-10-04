import { useEffect, useState } from "react";
import {
  COUPANG_ADS,
  COUPANG_PARTNERS_CAMPAIGN,
  type CoupangAdConfig,
  type CoupangAdPlacement,
} from "@/config/coupangAds";

type CoupangAdProps = {
  placement?: CoupangAdPlacement;
  ad?: CoupangAdConfig;
  className?: string;
};

export default function CoupangAd({ placement, ad: suppliedAd, className = "" }: CoupangAdProps) {
  const ad = suppliedAd || (placement ? COUPANG_ADS[placement] : null);
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

  const campaignStart = new Date(COUPANG_PARTNERS_CAMPAIGN.startAt).getTime();
  const campaignEnd = new Date(COUPANG_PARTNERS_CAMPAIGN.endAt).getTime();
  const isCampaignActive = Date.now() >= campaignStart && Date.now() <= campaignEnd;

  if (!ad || !isCampaignActive) return null;

  const banner = isMobile
    ? { id: COUPANG_PARTNERS_CAMPAIGN.mobileId, width: COUPANG_PARTNERS_CAMPAIGN.mobileWidth, height: COUPANG_PARTNERS_CAMPAIGN.mobileHeight }
    : { id: COUPANG_PARTNERS_CAMPAIGN.desktopId, width: COUPANG_PARTNERS_CAMPAIGN.desktopWidth, height: COUPANG_PARTNERS_CAMPAIGN.desktopHeight };
  const iframeSrc = `https://ads-partners.tw.coupang.com/widgets.html?id=${banner.id}&template=banner&trackingCode=${COUPANG_PARTNERS_CAMPAIGN.trackingCode}&subId=${encodeURIComponent(ad.subId)}&width=${banner.width}&height=${banner.height}`;

  return (
    <aside className={`my-8 flex w-full justify-center overflow-hidden ${className}`} aria-label={ad.alt} data-coupang-sub-id={ad.subId}>
      <iframe title="Coupang Partners" src={iframeSrc} width={banner.width} height={banner.height} frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" className="block max-w-full border-0" style={{ width: `${banner.width}px`, height: `${banner.height}px`, maxWidth: "100%" }} />
    </aside>
  );
}

import { useLocation } from "react-router-dom";
import CoupangDynamicAd from "@/components/CoupangDynamicAd";
import { getToolCoupangAd } from "@/config/coupangAds";

export default function ToolAdSlot() {
  const { pathname } = useLocation();
  const ad = getToolCoupangAd(pathname, "inline");
  if (!ad) return null;
  return <CoupangDynamicAd subId={ad.subId} desktopWidth={1080} desktopHeight={190} mobileWidth={320} mobileHeight={150} className="mx-auto max-w-[1480px] px-3 sm:px-6" />;
}

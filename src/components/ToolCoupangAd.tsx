import { useLocation } from "react-router-dom";
import CoupangAd from "@/components/CoupangAd";
import { getToolCoupangAd } from "@/config/coupangAds";

export default function ToolCoupangAd() {
  const { pathname } = useLocation();
  const ad = getToolCoupangAd(pathname);
  if (!ad) return null;
  return <CoupangAd ad={ad} className="mx-auto mb-24 max-w-5xl px-3 sm:mb-8 sm:px-6" />;
}

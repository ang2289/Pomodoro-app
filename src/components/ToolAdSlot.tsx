import { useLocation } from "react-router-dom";
import CoupangAd from "@/components/CoupangAd";
import { getToolCoupangAd } from "@/config/coupangAds";

export default function ToolAdSlot() {
  const { pathname } = useLocation();
  const ad = getToolCoupangAd(pathname, "inline");
  if (!ad) return null;
  return <CoupangAd ad={ad} className="mx-auto max-w-5xl px-3 sm:px-6" />;
}

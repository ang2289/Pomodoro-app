import { useLocation } from "react-router-dom";
import CoupangDynamicAd from "@/components/CoupangDynamicAd";

const CONTENT_PREFIX_SUB_IDS: Array<[string, string]> = [
  ["/blog", "rxv_content_blog"],
  ["/guide", "rxv_content_guide"],
  ["/finance", "rxv_content_finance"],
  ["/aids", "rxv_content_aids"],
  ["/retirement", "rxv_content_retirement"],
  ["/health", "rxv_content_health"],
  ["/pension", "rxv_content_pension"],
  ["/compare", "rxv_content_compare"],
];

const CONTENT_EXACT_SUB_IDS: Record<string, string> = {
  "/free": "rxv_content_free",
  "/policy-explained": "rxv_content_policy",
  "/language-guide": "rxv_content_language",
  "/announcements": "rxv_content_announcements",
};

export default function CoupangContentAd() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  const exactSubId = CONTENT_EXACT_SUB_IDS[normalizedPath];
  if (exactSubId) {
    return <CoupangDynamicAd subId={exactSubId} className="mx-auto mb-2 mt-4" />;
  }

  const prefixMatch = CONTENT_PREFIX_SUB_IDS.find(
    ([prefix]) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  if (!prefixMatch) return null;

  return (
    <CoupangDynamicAd
      subId={prefixMatch[1]}
      className="mx-auto mb-2 mt-4"
    />
  );
}

import { useLocation } from "react-router-dom";
import CoupangDynamicAd from "@/components/CoupangDynamicAd";

const EXCLUDED_PREFIXES = [
  "/admin",
  "/login",
  "/register",
  "/reset",
  "/payment",
  "/topup",
  "/points",
  "/my-",
  "/my/",
  "/settings",
  "/shop",
  "/card/",
  "/business-card/",
  "/group-buy",
  "/group/",
  "/download",
];

const EXCLUDED_EXACT_PATHS = new Set([
  "/pricing",
  "/pricing/success",
  "/pricing/cancel",
  "/pricing/fail",
]);

export function makeCoupangSubId(pathname: string, placement: "top" | "bottom" = "top") {
  if (pathname === "/") return `rxv_${placement}_home`;

  const slug = pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return `rxv_${placement}_${slug || "page"}`;
}

export function isCoupangPublicPage(normalizedPath: string) {
  return !(
    EXCLUDED_EXACT_PATHS.has(normalizedPath) ||
    EXCLUDED_PREFIXES.some((prefix) =>
      prefix.endsWith("/")
        ? normalizedPath.startsWith(prefix)
        : normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
    )
  );
}

export default function CoupangContentAd() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (!isCoupangPublicPage(normalizedPath)) return null;

  return (
    <CoupangDynamicAd
      subId={makeCoupangSubId(normalizedPath, "top")}
      priority
      className="mx-auto mb-3 mt-4"
    />
  );
}

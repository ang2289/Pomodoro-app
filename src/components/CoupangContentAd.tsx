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

function makeTopSubId(pathname: string) {
  if (pathname === "/") return "rxv_top_home";

  const slug = pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return `rxv_top_${slug || "page"}`;
}

export default function CoupangContentAd() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (
    EXCLUDED_EXACT_PATHS.has(normalizedPath) ||
    EXCLUDED_PREFIXES.some((prefix) =>
      prefix.endsWith("/")
        ? normalizedPath.startsWith(prefix)
        : normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
    )
  ) {
    return null;
  }

  return (
    <CoupangDynamicAd
      subId={makeTopSubId(normalizedPath)}
      className="mx-auto mb-3 mt-4"
    />
  );
}

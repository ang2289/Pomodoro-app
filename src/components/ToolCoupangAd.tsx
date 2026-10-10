import { useLocation } from "react-router-dom";
import CoupangDynamicAd from "@/components/CoupangDynamicAd";
import { isCoupangPublicPage, makeCoupangSubId } from "@/components/CoupangContentAd";

/** 全站公開內容頁底部共用商品圖輪播；敏感或付款頁不展示。 */
export default function ToolCoupangAd() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  if (!isCoupangPublicPage(path)) return null;
  return (
    <div className="mx-auto w-full max-w-[1480px] px-3 pb-8 pt-4 sm:px-6 lg:px-10">
      <CoupangDynamicAd
        subId={makeCoupangSubId(path, "bottom")}
        desktopWidth={1100}
        desktopHeight={190}
        mobileWidth={320}
        mobileHeight={150}
        className="mx-auto"
      />
    </div>
  );
}

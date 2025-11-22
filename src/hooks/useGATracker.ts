import { useEffect } from "react"
import { useLocation } from "react-router-dom"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function useGATracker() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("config", "G-BDND2JZKLE", {
        page_path: `${location.pathname}${location.search}`,
      })
    }
  }, [location])
}











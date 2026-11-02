import { useEffect, useState } from "react";

export type StickerGuidanceMode = "guided" | "quick";

const PERSISTENT_KEY = "tutu_sticker_guidance_mode_v2";
const SESSION_KEY = "tutu_sticker_guidance_session_v2";
const CHANGE_EVENT = "tutu-sticker-guidance-change";
const SEEN_PREFIX = "tutu_sticker_guidance_seen_in_session_v2_";

function parseMode(value: string | null): StickerGuidanceMode | null {
  return value === "guided" || value === "quick" ? value : null;
}

export function readStickerGuidanceMode(): StickerGuidanceMode | null {
  if (typeof window === "undefined") return null;
  try {
    return parseMode(window.sessionStorage.getItem(SESSION_KEY))
      ?? parseMode(window.localStorage.getItem(PERSISTENT_KEY));
  } catch {
    return null;
  }
}

export function setStickerGuidanceMode(mode: StickerGuidanceMode, remember: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, mode);
    if (remember) window.localStorage.setItem(PERSISTENT_KEY, mode);
    else window.localStorage.removeItem(PERSISTENT_KEY);
  } catch {
    // Private browsing: selection remains available in the current mounted page.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: mode }));
}

export function useStickerGuidanceMode() {
  const [mode, setMode] = useState<StickerGuidanceMode | null>(readStickerGuidanceMode);
  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<StickerGuidanceMode>).detail;
      setMode(parseMode(detail) ?? readStickerGuidanceMode());
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);
  return mode;
}

export function hasSeenStickerGuideStep(step: number): boolean {
  if (typeof window === "undefined") return false;
  try { return window.sessionStorage.getItem(SEEN_PREFIX + step) === "1"; }
  catch { return false; }
}

export function markStickerGuideStepSeen(step: number) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(SEEN_PREFIX + step, "1"); }
  catch { /* Current page also tracks dismissed steps in memory. */ }
}

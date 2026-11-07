export type MusicScene = { imageIndex: number; start: number; frames: number; duration: number };
export type MusicTimeline = { scenes: MusicScene[]; contentFrames: number; finalFrames: number; totalFrames: number; totalSeconds: number };

/** Cap the number of decoded pictures based on the engine and device. */
export function imageSelectionLimit(purpose: "slideshow" | "music", mobile: boolean, nativeFast: boolean) {
  if (purpose !== "music") return 12;
  return mobile || !nativeFast ? 24 : 48;
}

/** Keeps the existing order when the user imports a second batch of images. */
export function combinePictureSelections<T>(
  current: readonly T[],
  incoming: readonly T[],
  limit: number,
  mode: "append" | "replace" = "append",
): T[] {
  const source = mode === "replace" ? incoming : [...current, ...incoming];
  const capacity = Math.max(0, Math.floor(Number.isFinite(limit) ? limit : 0));
  return source.slice(0, capacity);
}

/** The audio is the clock. Scene durations sum to the exact output frame count (no accumulated float drift). */
export function buildMusicTimeline(audioSeconds: number, imageCount: number, fps: number, finalQrSeconds = 0): MusicTimeline {
  if (!Number.isFinite(audioSeconds) || audioSeconds <= 0 || imageCount <= 0 || fps <= 0) {
    return { scenes: [], contentFrames: 0, finalFrames: 0, totalFrames: 0, totalSeconds: 0 };
  }
  const totalFrames = Math.max(1, Math.round(audioSeconds * fps));
  const finalFrames = Math.min(Math.max(0, Math.round(finalQrSeconds * fps)), Math.max(0, totalFrames - 1));
  const contentFrames = totalFrames - finalFrames;
  const sceneCount = Math.min(contentFrames, Math.max(imageCount, Math.ceil(contentFrames / Math.round(5.5 * fps))));
  const scenes: MusicScene[] = [];
  for (let i = 0; i < sceneCount; i += 1) {
    const begin = Math.floor((i * contentFrames) / sceneCount);
    const end = Math.floor(((i + 1) * contentFrames) / sceneCount);
    const frames = end - begin;
    scenes.push({ imageIndex: i % imageCount, start: begin / fps, frames, duration: frames / fps });
  }
  return { scenes, contentFrames, finalFrames, totalFrames, totalSeconds: totalFrames / fps };
}


export type MusicScene = { imageIndex: number; start: number; frames: number; duration: number };
export type MusicTimeline = { scenes: MusicScene[]; contentFrames: number; finalFrames: number; totalFrames: number; totalSeconds: number };

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


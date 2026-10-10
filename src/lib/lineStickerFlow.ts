export type LineStickerMode = "static" | "animated";
export type LineStickerCount = 8 | 16 | 24 | 32 | 40;
export type LineStickerStage = 1 | 2 | 3 | 4 | 5;
export type MotherSheetGrid = "4x2" | "4x4" | "4x5";

export type LineStickerProject = {
  version: 1;
  id: string;
  mode: LineStickerMode;
  count: LineStickerCount;
  theme: string;
  texts: string[];
  stage: LineStickerStage;
  createdAt: number;
  updatedAt: number;
};

export type MotherSheetPlanItem = {
  grid: MotherSheetGrid;
  count: number;
  startIndex: number;
  endIndex: number;
};

const PROJECT_KEY = "rxv_line_sticker_flow_project_v1";
const DB_NAME = "rxv-line-sticker-flow";
const DB_VERSION = 1;
const HANDOFF_STORE = "handoff";
const HANDOFF_KEY = "current";

export function getAllowedCounts(mode: LineStickerMode): LineStickerCount[] {
  return mode === "animated" ? [8, 16, 24] : [8, 16, 24, 32, 40];
}

export function getMotherSheetPlan(count: LineStickerCount): MotherSheetPlanItem[] {
  if (count === 8) return [{ grid: "4x2", count: 8, startIndex: 0, endIndex: 8 }];
  if (count === 16) return [{ grid: "4x4", count: 16, startIndex: 0, endIndex: 16 }];
  if (count === 24) {
    return [
      { grid: "4x4", count: 16, startIndex: 0, endIndex: 16 },
      { grid: "4x2", count: 8, startIndex: 16, endIndex: 24 },
    ];
  }
  if (count === 32) {
    return [
      { grid: "4x4", count: 16, startIndex: 0, endIndex: 16 },
      { grid: "4x4", count: 16, startIndex: 16, endIndex: 32 },
    ];
  }
  return [
    { grid: "4x5", count: 20, startIndex: 0, endIndex: 20 },
    { grid: "4x5", count: 20, startIndex: 20, endIndex: 40 },
  ];
}

function makeProjectId() {
  return `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createLineStickerProject(input: {
  mode: LineStickerMode;
  count: LineStickerCount;
  theme: string;
  texts: string[];
}): LineStickerProject {
  const now = Date.now();
  return {
    version: 1,
    id: makeProjectId(),
    mode: input.mode,
    count: input.count,
    theme: input.theme,
    texts: input.texts.slice(0, input.count),
    stage: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function readLineStickerProject(): LineStickerProject | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROJECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LineStickerProject;
    if (!parsed || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLineStickerProject(project: LineStickerProject) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PROJECT_KEY,
    JSON.stringify({ ...project, updatedAt: Date.now() }),
  );
}

export function clearLineStickerProject() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROJECT_KEY);
}

export function updateLineStickerProject(
  patch: Partial<Omit<LineStickerProject, "version" | "id" | "createdAt">>,
): LineStickerProject | null {
  const current = readLineStickerProject();
  if (!current) return null;
  const next: LineStickerProject = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };
  saveLineStickerProject(next);
  return next;
}

type StoredHandoffFile = {
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
};

export type AnimatedHandoffProject = Pick<LineStickerProject, "id" | "count" | "theme" | "texts">;

type StoredHandoff = {
  id: string;
  updatedAt: number;
  files: StoredHandoffFile[];
  /** 與來源圖片同筆寫入，避免讀到 localStorage 的另一個舊專案。 */
  project?: AnimatedHandoffProject;
};

function openFlowDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("目前瀏覽器不支援暫存貼圖，請改用最新版本瀏覽器。"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(HANDOFF_STORE)) {
        db.createObjectStore(HANDOFF_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("無法開啟貼圖暫存。"));
  });
}

export async function saveAnimatedStickerHandoff(files: File[], project?: LineStickerProject | null) {
  const db = await openFlowDb();
  try {
    const stored: StoredHandoff = {
      id: HANDOFF_KEY,
      updatedAt: Date.now(),
      project: project && project.count === files.length
        ? { id: project.id, count: project.count, theme: project.theme, texts: project.texts.slice(0, project.count) }
        : undefined,
      files: files.map((file) => ({
        name: file.name,
        type: file.type || "image/png",
        lastModified: file.lastModified || Date.now(),
        blob: file.slice(0, file.size, file.type || "image/png"),
      })),
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HANDOFF_STORE, "readwrite");
      tx.objectStore(HANDOFF_STORE).put(stored);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("貼圖暫存失敗。"));
      tx.onabort = () => reject(tx.error || new Error("貼圖暫存中斷。"));
    });
  } finally {
    db.close();
  }
}

export async function loadAnimatedStickerHandoffBundle(): Promise<{
  files: File[];
  project: AnimatedHandoffProject | null;
}> {
  const db = await openFlowDb();
  try {
    const stored = await new Promise<StoredHandoff | undefined>((resolve, reject) => {
      const tx = db.transaction(HANDOFF_STORE, "readonly");
      const request = tx.objectStore(HANDOFF_STORE).get(HANDOFF_KEY);
      request.onsuccess = () => resolve(request.result as StoredHandoff | undefined);
      request.onerror = () => reject(request.error || new Error("讀取貼圖暫存失敗。"));
    });
    if (!stored?.files?.length) return { files: [], project: null };
    const files = stored.files.map(
      (item) =>
        new File([item.blob], item.name, {
          type: item.type || "image/png",
          lastModified: item.lastModified || Date.now(),
        }),
    );
    const project = stored.project;
    return {
      files,
      project: project?.id && project.count === files.length &&
        project.texts.length === files.length
        ? project
        : null,
    };
  } finally {
    db.close();
  }
}

/** 舊呼叫相容；需要批次文字時請使用 Bundle，勿再自行讀 localStorage。 */
export async function loadAnimatedStickerHandoff(): Promise<File[]> {
  return (await loadAnimatedStickerHandoffBundle()).files;
}

export async function clearAnimatedStickerHandoff() {
  const db = await openFlowDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HANDOFF_STORE, "readwrite");
      tx.objectStore(HANDOFF_STORE).delete(HANDOFF_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("清除貼圖暫存失敗。"));
    });
  } finally {
    db.close();
  }
}

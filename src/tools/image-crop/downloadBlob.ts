/** 觸發瀏覽器下載；在下一個 frame 再 revoke，避免部分環境尚未開始下載就釋放 URL */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 250);
}

/** 檔名僅保留安全字元，避免 Windows／macOS 拒絕下載 */
export function safeDownloadBasename(name: string, fallback: string): string {
  const trimmed = name.trim() || fallback;
  const withoutExt = trimmed.replace(/\.[^/.\\]+$/, '');
  const safe = withoutExt.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 120);
  return safe.length > 0 ? safe : fallback;
}

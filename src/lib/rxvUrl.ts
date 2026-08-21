export function resolveRxvUrl(value: unknown) {
  const url = String(value || '').trim()
  if (!url || /^https?:\/\//i.test(url)) return url
  const base = String(import.meta.env.VITE_RXV_WEB_BASE_URL || '').trim().replace(/\/$/, '')
  if (url.startsWith('/api/')) return base ? `${base}${url}` : url
  return url
}

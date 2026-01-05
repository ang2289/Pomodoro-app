export function setCorsHeaders(res: import('@vercel/node').VercelResponse, req: import('@vercel/node').VercelRequest) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

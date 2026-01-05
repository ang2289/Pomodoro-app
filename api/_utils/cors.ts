import type { VercelRequest, VercelResponse } from '@vercel/node'

export function setCorsHeaders(res: VercelResponse, req: VercelRequest) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

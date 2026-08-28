import { handleGroupBuyAction } from './group-buy.js'

export default async function handler(req: any, res: any) {
  return handleGroupBuyAction(req, res, {}, 'process-payment-deadlines')
}

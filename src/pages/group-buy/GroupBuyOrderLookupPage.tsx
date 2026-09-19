import { Navigate } from 'react-router-dom'
import { getAuthToken } from '@/lib/groupBuyApi'

export default function GroupBuyOrderLookupPage() {
  if (!getAuthToken()) {
    return <Navigate to="/login?returnTo=%2Fmy%2Fgroup-buy-orders" replace />
  }

  return <Navigate to="/my/group-buy-orders" replace />
}

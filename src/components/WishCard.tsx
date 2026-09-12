import React from 'react'
import WishLightButton from './WishLightButton'

interface Wish {
  id: string
  user_name?: string
  content: string
  created_at: string
}

interface WishCardProps {
  wish: Wish
  showLightButton?: boolean
}

export default function WishCard({ wish, showLightButton = false }: WishCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 border">
      <div className="text-gray-700 text-sm">{wish.user_name || '匿名'}</div>
      <div className="font-bold text-lg mt-1">{wish.content}</div>
      <div className="text-xs text-gray-500 mt-1">{new Date(wish.created_at).toLocaleString()}</div>
      
      {showLightButton && (
        <div className="mt-4 p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 rounded-xl border border-pink-200">
          <h4 className="text-md font-bold text-center text-gray-800 mb-2">🙏 為此願望點燈祈福</h4>
          <p className="text-xs text-gray-600 text-center mb-3">
            點擊蓮花為此願望點燈祈福
          </p>
          <WishLightButton wishId={wish.id} />
        </div>
      )}
    </div>
  )
}






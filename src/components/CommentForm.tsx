import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { containsSensitiveWords } from '../utils/sensitiveWords'

interface CommentFormProps {
  wishId: string
  onCommented?: () => void
}

export default function CommentForm({ wishId, onCommented }: CommentFormProps) {
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim() || !wishId || loading) return
    
    // 檢查敏感詞
    if (containsSensitiveWords(name)) {
      alert('名字包含不當詞彙（如色情、暴力），請重新編輯。');
      return;
    }
    
    if (containsSensitiveWords(comment)) {
      alert('留言內容包含不當詞彙（如色情、暴力），請重新編輯。');
      return;
    }
    
    setLoading(true)
    try {
      await supabase.from('chant_comments').insert({
        wish_id: wishId,
        comment: comment.trim(),
        user_name: name.trim() || '匿名'
      })
      setComment('')
      setName('')
      onCommented?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2 mt-4">
      <input
        className="w-full border p-2 rounded text-sm sm:text-base"
        placeholder="你的名字（可空白）"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea
        className="w-full border p-2 rounded text-sm sm:text-base"
        placeholder="留言..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full !text-white font-semibold px-4 py-2 rounded disabled:opacity-60 shadow-md transition-all duration-200"
        style={{ background: '#4f46e5', color: '#ffffff', border: 'none' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4338ca' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4f46e5' }}
      >
        發表留言
      </button>
    </div>
  )
}



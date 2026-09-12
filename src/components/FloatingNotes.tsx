import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingNotes({ isPlaying }: { isPlaying: boolean }) {
  const [notes, setNotes] = useState<{ id: number; left: string }[]>([])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      const id = Date.now()
      const left = Math.random() * 80 + 10 + '%'
      setNotes((prev) => [...prev, { id, left }])
      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== id))
      }, 3000)
    }, 800)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="pointer-events-none fixed top-0 left-0 w-full h-full z-50">
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -150 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute text-3xl"
            style={{ left: note.left, top: '60px' }}
          >
            🎵🎶
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}












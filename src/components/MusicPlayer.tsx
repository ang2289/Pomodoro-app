import { useEffect, useRef, useState } from 'react'

const musicOptions = [
  { label: '南無阿彌陀佛 1', file: '/music/namo1.mp3' },
  { label: '南無阿彌陀佛 2', file: '/music/namo2.mp3' },
  { label: '南無阿彌陀佛 3', file: '/music/namo3.mp3' }
]

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem('selectedMusic') || musicOptions[0].file
  })
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = selected
      audioRef.current.loop = true
      audioRef.current.volume = 0.5
      if (isPlaying) {
        audioRef.current.play()
      }
      localStorage.setItem('selectedMusic', selected)
    }
  }, [selected])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="p-4 border-t mt-4 text-center">
      <h3 className="text-lg font-bold mb-2">🎵 背景音樂</h3>
      <select
        className="border rounded px-2 py-1"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {musicOptions.map((m) => (
          <option key={m.file} value={m.file}>
            {m.label}
          </option>
        ))}
      </select>
      <div className="mt-2">
        <button
          onClick={togglePlay}
          className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition"
        >
          {isPlaying ? '⏸ 暫停音樂' : '▶️ 播放音樂'}
        </button>
      </div>
      <audio ref={audioRef} autoPlay loop hidden />
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

const chantSounds = [
  { label: '音效 1', value: 'chant1.mp3' },
  { label: '音效 2', value: 'chant2.mp3' },
  { label: '音效 3', value: 'chant3.mp3' },
]

export default function ChantSoundSelector() {
  const [selectedSound, setSelectedSound] = useState(() => {
    return localStorage.getItem('chant-sound') || 'chant1.mp3'
  })
  const [isPlaying, setIsPlaying] = useState(() => {
    return localStorage.getItem('chantPlayStatus') === 'true'
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(`/sounds/chant/${selectedSound}`)
    audio.loop = true
    audioRef.current = audio

    if (isPlaying) {
      audio.play().catch(console.error)
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        togglePlay()
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      audio.pause()
    }
  }, [selectedSound, isPlaying])

  // 處理音效選擇變化
  useEffect(() => {
    localStorage.setItem('chant-sound', selectedSound)
  }, [selectedSound])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
    const newPlayingState = !isPlaying
    setIsPlaying(newPlayingState)
    localStorage.setItem('chantPlayStatus', String(newPlayingState))
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-center">🎵 背景音效</h3>
      <select
        className="w-full px-3 py-2 text-base rounded border border-gray-300 leading-normal"
        value={selectedSound}
        onChange={(e) => setSelectedSound(e.target.value)}
      >
        {chantSounds.map((sound) => (
          <option key={sound.value} value={sound.value}>
            {sound.label}
          </option>
        ))}
      </select>
      <button
        onClick={togglePlay}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-2 px-4 rounded"
      >
        {isPlaying ? '⏸️ 暫停音效' : '▶️ 播放音效'}
      </button>
    </div>
  )
}

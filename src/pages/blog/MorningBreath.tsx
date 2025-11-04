import React from "react";
import { Link } from "react-router-dom";

export default function MorningBreath() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌺 身心重啟晨間呼吸法｜為一天注入正能量
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Morning Breath Renewal: Energize Your Mind and Body for the Day
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌤️ 為什麼要練習晨間呼吸？</h2>
        <p className="mb-4">
          清晨的第一口呼吸，決定了你一天的節奏。
          深呼吸能刺激副交感神經，讓身體甦醒、頭腦清晰、心情穩定。
          每天只要三分鐘，就能喚醒全身的能量流動。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌺 三分鐘晨間呼吸法</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">第一分鐘：喚醒呼吸</strong>
            緩緩吸氣四秒，感覺空氣進入胸口，再慢慢吐氣六秒。想像每一口氣都帶來新的開始。
            <p className="text-sm text-gray-600 mt-1">
              Inhale for 4 seconds, feel the air expand your chest, exhale for 6 seconds—each breath begins a new day.
            </p>
          </li>
          <li>
            <strong className="mr-2">第二分鐘：身體覺察</strong>
            注意空氣經過鼻腔、喉嚨、胸腔的流動感，讓注意力回到身體。
            <p className="text-sm text-gray-600 mt-1">
              Notice the air moving through your nose, throat, and chest—anchor your awareness in the body.
            </p>
          </li>
          <li>
            <strong className="mr-2">第三分鐘：正能量呼吸</strong>
            吸氣時心中默念：「我吸入希望」，吐氣時：「我釋放焦慮」。
            <p className="text-sm text-gray-600 mt-1">
              Inhale saying, "I breathe in hope." Exhale saying, "I let go of worry."
            </p>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌞 結合晨間儀式的力量</h2>
        <p className="mb-4">
          你可以在刷牙、煮咖啡或散步時進行這個呼吸練習。
          讓呼吸成為生活的一部分，而不是額外的任務。
          將「覺醒」變成每日自然的習慣。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">✨ 結語：用一口氣，開啟光亮的一天</h2>
        <p className="mb-4">
          每一次深呼吸，都是與生命的重新連結。
          從早晨開始呼吸覺察，你將發現整天都更穩定、更有力量。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Practice Morning Breathing?</h3>
        <p className="mb-4">
          Your first morning breath sets the rhythm for the day.
          Deep breathing activates the parasympathetic system—awakening your body, clearing your mind, and stabilizing your mood.
          Just three minutes can recharge your energy flow.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three-Minute Morning Breathing Method</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">Minute 1 – Awakening Breath:</strong> Inhale for 4 seconds, feel the air expand your chest, exhale for 6 seconds—each breath begins a new day.
          </li>
          <li>
            <strong className="mr-2">Minute 2 – Body Awareness:</strong> Notice the air moving through your nose, throat, and chest—anchor your awareness in the body.
          </li>
          <li>
            <strong className="mr-2">Minute 3 – Positive Flow:</strong> Inhale saying, "I breathe in hope." Exhale saying, "I let go of worry."
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">The Power of Morning Rituals</h3>
        <p className="mb-4">
          Practice while brushing your teeth, making coffee, or walking.
          Let breathing be part of your life—not a chore.
          Awakening becomes effortless when it's woven into routine.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: One Breath, One Bright Day</h3>
        <p className="mb-4">
          Every deep breath reconnects you with life itself.
          Begin your morning with mindful breathing—and carry that calm energy all day.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        {/* ✅ 廣告區塊示意（可放 AdSense） */}
        <div className="text-center text-gray-400 italic">
          （這裡可放 AdSense 廣告代碼）
        </div>
      </article>
    </div>
  );
}


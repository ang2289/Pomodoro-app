import React from "react";
import { Link } from "react-router-dom";

export default function MoonlightMeditationBreath() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌕 月光冥想呼吸法｜睡前放下、迎接安眠
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Moonlight Meditation Breath: Let Go and Rest Under the Night Sky
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌙 為什麼月光適合冥想？</h2>
        <p className="mb-4">
          月光代表柔和與包容，它不像太陽那樣耀眼，
          卻能在黑夜中溫柔地照亮一切。
          當你在夜裡練習呼吸，想像月光灑落身上，
          所有的焦慮與思緒，會慢慢被光融化。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕯️ 三步睡前冥想呼吸法</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">1️⃣ 吸氣：收回心神</strong>
            吸入時感受夜晚的寧靜，
            讓白天的聲音慢慢遠離。
          </li>
          <li>
            <strong className="mr-2">2️⃣ 停留：與月光同在</strong>
            閉氣 2 秒，想像自己被月光包圍。
            光在胸口閃爍，讓你感到安全與溫暖。
          </li>
          <li>
            <strong className="mr-2">3️⃣ 吐氣：放下白天</strong>
            吐氣時，默念：「我願今晚安睡」。
            讓每次吐氣都帶走一層緊繃。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🎧 預留功能：睡眠音樂模組 Coming Soon</h2>
        <p className="mb-4">
          未來版本將新增「睡眠音樂與月光聲景」模組，
          你將能選擇自然音、鋼琴聲或木魚鐘音，
          與這套冥想呼吸練習同步播放，
          讓夜晚成為真正的療癒時刻。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪷 睡前儀式建議</h2>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>關閉手機通知，調暗燈光。</li>
          <li>播放柔和背景音或自然環境音。</li>
          <li>深呼吸三次後，再開始閱讀或休息。</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌕 結語：讓月光帶你回家</h2>
        <p className="mb-4">
          當夜幕低垂，請記得，
          你不需要再努力了。
          只要呼吸、感受、放下。
          月光會帶你進入最溫柔的夢。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Is Moonlight Good for Meditation?</h3>
        <p className="mb-4">
          Moonlight embodies softness and calm.
          It doesn't shine to dominate—it shines to soothe.
          When you breathe under its glow, worries quietly dissolve into light.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three-Step Pre-Sleep Meditation Breath</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">1️⃣ Inhale: Center Your Mind:</strong>
            Inhale the stillness of night.
            Let the noise of the day fade away.
          </li>
          <li>
            <strong className="mr-2">2️⃣ Hold: Be with the Moonlight:</strong>
            Hold for two seconds—feel moonlight wrapping around your heart, keeping you safe and warm.
          </li>
          <li>
            <strong className="mr-2">3️⃣ Exhale: Let Go of the Day:</strong>
            Exhale softly, whispering "I allow myself to rest."
            With each exhale, release another layer of tension.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Coming Soon: Sleep Music Module</h3>
        <p className="mb-4">
          Future updates will include a Sleep Music module—
          featuring natural ambient sounds, piano melodies, and soft temple bells
          that sync with your breathing for deep relaxation.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Bedtime Ritual Suggestions</h3>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>Turn off phone notifications and dim the lights.</li>
          <li>Play gentle background sounds or nature ambience.</li>
          <li>Take three slow breaths before reading or resting.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Conclusion: Let Moonlight Guide You Home</h3>
        <p className="mb-4">
          When night falls, remember—
          there's nothing more to do.
          Just breathe, feel, and let go.
          The moonlight will guide you home.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          所有文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


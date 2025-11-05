import React from "react";
import { Link } from "react-router-dom";

export default function MorningMeditationArticle() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌞 清晨靜坐法｜如何開啟充滿能量的一天
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Morning Meditation: The Art of Starting a Mindful and Energized Day
        </p>

        <p className="mb-4">
          每天早晨醒來的那一刻，是身心最有可能重啟的時刻。
          若能在起床後花 10 至 15 分鐘靜坐，
          讓呼吸、思緒與身體緩緩同步，
          一整天都會更加平靜、有方向。
        </p>

        <p className="mb-4">
          清晨靜坐不需複雜的姿勢或儀式，
          找一個安靜的角落、輕鬆坐下，
          閉上眼睛，專注於吸氣與吐氣。
          當念頭出現時，不批判也不追逐，
          只需觀察它們輕輕飄過。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🧘‍♂️ 建立晨間靜心習慣</h2>
        <p className="mb-4">
          1. 起床後先喝一杯溫水，讓身體甦醒。<br/>
          2. 打開柔光，坐在椅上或墊上。<br/>
          3. 將注意力放在呼吸或佛號上。<br/>
          4. 若有雜念，用一句話帶回注意力：「我在這裡，正在呼吸。」<br/>
          5. 結束後微笑並感謝新的一天。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <p className="mb-4">
          The moment you wake up in the morning is a powerful time to reset your
          mind and body. Spend just 10–15 minutes sitting quietly, breathing
          slowly, and allowing your awareness to settle. This simple act can
          transform your entire day.
        </p>

        <p className="mb-4">
          Find a quiet corner, sit comfortably, and close your eyes. Focus on
          your breath—inhale deeply, exhale slowly. When thoughts appear, simply
          notice them without judgment, then gently return to your breath.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💡 延伸練習 / Extended Practice</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>可搭配柔和音樂或自然鳥鳴聲。</li>
          <li>搭配番茄鐘設定 10 分鐘靜坐循環。</li>
          <li>記錄每天靜坐後的心情或靈感。</li>
          <li>End each session with gratitude for the new day.</li>
        </ul>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


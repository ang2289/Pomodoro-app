import React from "react";
import { Link } from "react-router-dom";

export default function FocusMeditation() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800 text-lg">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🧘‍♀️ 專注冥想法｜每天三分鐘讓思緒歸零
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Mindful Focus Meditation: Three Minutes to Mental Clarity
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 為什麼冥想能提升專注力？</h2>
        <p className="mb-4">
          冥想不只是放鬆，它是訓練大腦「回到當下」的技術。
          當你觀察呼吸、感受身體時，大腦的預設模式網路（DMN）會暫時關閉，
          這能顯著提升專注力與情緒穩定。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">⏳ 三分鐘專注冥想步驟</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">第一分鐘：呼吸定位</strong>
            坐直，深吸氣，感受空氣進入胸腔與腹部。
            <p className="text-sm text-gray-600 mt-1">
              Sit upright, inhale deeply, feel the air fill your lungs and abdomen.
            </p>
          </li>
          <li>
            <strong className="mr-2">第二分鐘：感官覺察</strong>
            注意身體與地面的接觸點，讓注意力安住在身體中。
            <p className="text-sm text-gray-600 mt-1">
              Notice your body touching the floor or chair, anchor attention in the present moment.
            </p>
          </li>
          <li>
            <strong className="mr-2">第三分鐘：放下思緒</strong>
            若出現雜念，只需輕聲對自己說：「我知道你在，謝謝。」然後回到呼吸。
            <p className="text-sm text-gray-600 mt-1">
              When thoughts arise, say silently, "I see you, thank you," then gently return to the breath.
            </p>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💭 專注冥想 × 番茄鐘</h2>
        <p className="mb-4">
          若你在使用番茄鐘專注 App，可將這三分鐘冥想設為「休息時段」。
          它不僅能恢復注意力，也能重啟心態，減少焦慮與疲勞。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">✨ 結語：專注，是一種溫柔的力量</h2>
        <p className="mb-4">
          專注並非緊繃的控制，而是柔軟的回到當下。
          當你學會讓心停留在此刻，你就擁有了清明與力量。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Meditation Improves Focus</h3>
        <p className="mb-4">
          Meditation isn't just relaxation—it's a practice of returning to the present.
          Observing breath and body deactivates the Default Mode Network (DMN),
          improving focus and emotional stability.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three-Minute Focus Meditation Steps</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">Minute 1 – Breathing Awareness:</strong> Sit upright, inhale deeply, feel the air fill your lungs and abdomen.
          </li>
          <li>
            <strong className="mr-2">Minute 2 – Sensory Awareness:</strong> Notice your body touching the floor or chair, anchor attention in the present moment.
          </li>
          <li>
            <strong className="mr-2">Minute 3 – Letting Go:</strong> When thoughts arise, say silently, "I see you, thank you," then gently return to the breath.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Focus Meditation × Pomodoro</h3>
        <p className="mb-4">
          You can use this 3-minute meditation during your Pomodoro breaks.
          It resets focus, restores calm, and prevents burnout.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: Focus Is a Gentle Strength</h3>
        <p className="mb-4">
          Focus isn't about control—it's the art of returning softly to the moment.
          In presence, you find both clarity and strength.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


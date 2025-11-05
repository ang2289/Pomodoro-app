import React from "react";
import { Link } from "react-router-dom";

export default function EveningMeditation() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌙 晚安冥想｜幫助你放下白天的焦慮與疲憊
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Evening Meditation: Release the Stress of the Day
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌾 為什麼睡前需要冥想？</h2>
        <p className="mb-4">
          白天的工作、學業、人際關係常讓我們神經緊繃，甚至在夜晚仍無法放鬆。
          這時候，晚安冥想是一種溫柔的練習，幫助你從思緒中抽離，
          讓身體回到當下，逐漸進入深層放鬆與睡眠狀態。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪷 冥想練習步驟</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            找個安靜的空間，點上香氛或播放輕柔音樂，讓環境幫你進入放鬆狀態。
          </li>
          <li>
            慢慢調整呼吸，觀察身體的每個部位是否仍緊繃，並在心中默念：
            <strong className="mx-1">「我現在安全，我值得休息。」</strong>
          </li>
          <li>
            配合深呼吸，感受身體逐漸鬆開，讓煩躁的能量像雲霧般飄散。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌸 每晚 10 分鐘的小禮物</h2>
        <p className="mb-4">
          晚安冥想是一份送給自己的心靈禮物。
          每天僅需十分鐘，就能提升睡眠品質與情緒穩定度。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Evening Meditation?</h3>
        <p className="mb-4">
          Work, studies, and relationships often leave us tense, making it difficult to unwind at night.
          That's where evening meditation comes in—a gentle practice to help you disconnect from busy thoughts
          and return to your body, easing you into deep relaxation and restful sleep.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Meditation Steps</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            Find a quiet space, light a candle or play soft music to set a calm atmosphere.
          </li>
          <li>
            Slowly adjust your breathing. Scan your body for tension and silently repeat:
            <strong className="mx-1">"I am safe now. I deserve to rest."</strong>
          </li>
          <li>
            With each deep breath, feel your body loosen and let restless energy drift away like mist.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">A Ten-Minute Gift Each Night</h3>
        <p className="mb-4">
          This practice is a gift to yourself. Just ten minutes a night can improve your sleep and emotional balance.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


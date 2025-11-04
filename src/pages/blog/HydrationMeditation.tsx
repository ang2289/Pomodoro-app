import React from "react";
import { Link } from "react-router-dom";

export default function HydrationMeditation() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          💧 補水冥想法｜用喝水喚醒覺察
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Hydration Meditation: Awaken Awareness Through Water
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌊 為什麼「喝水」也能冥想？</h2>
        <p className="mb-4">
          我們常在口渴時匆忙喝水，卻忽略了這個最簡單的自我照顧儀式。
          「補水冥想」讓喝水變成一種覺察練習，提醒自己此刻身體需要什麼，
          也讓心靈回歸平靜與當下。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪷 五感覺察練習</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            看著水杯，觀察光線在水面上的反射。
          </li>
          <li>
            聽水流的聲音，感受那份清澈與平靜。
          </li>
          <li>
            聞一口空氣，感受清新的氣息。
          </li>
          <li>
            慢慢喝下一口水，感受水流過喉嚨、進入身體的瞬間。
          </li>
          <li>
            在心中輕聲說：「謝謝這份滋養。」
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💧 每次喝水，都是一次重啟</h2>
        <p className="mb-4">
          當你用覺察的方式喝水，身體獲得補充，心靈也被清洗。
          這是一個簡單卻強大的習慣，提醒自己：你在照顧的不只是身體，還有當下的自己。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Can Drinking Water Be Meditation?</h3>
        <p className="mb-4">
          We often drink water hurriedly, forgetting that this simple act is a form of self-care.
          "Hydration meditation" turns drinking into mindfulness, helping you reconnect with your body and stay present.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Five-Senses Awareness Practice</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            Look at your glass—observe how light dances on the surface of the water.
          </li>
          <li>
            Listen to the sound of the pour—soft, flowing, and pure.
          </li>
          <li>
            Inhale deeply; notice the fresh scent of the moment.
          </li>
          <li>
            Sip slowly. Feel the water flowing down your throat, entering your body.
          </li>
          <li>
            Silently whisper: "Thank you for this nourishment."
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Each Sip Is a Reset</h3>
        <p className="mb-4">
          Each mindful sip is a reset for your body and soul.
          You're not just hydrating your body—you're nurturing your awareness of the present moment.
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


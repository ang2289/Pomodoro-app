import React from "react";
import { Link } from "react-router-dom";

export default function MorningRitual() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌸 早晨儀式｜為自己點亮一天的心能量
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Morning Ritual: Ignite Your Inner Energy for the Day
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌅 為什麼需要早晨儀式？</h2>
        <p className="mb-4">
          早晨是一天中最乾淨的時刻。當你以覺察和感恩開始，
          那股平靜能量會影響整個白天。即使只有五分鐘，也能改變你的節奏與心境。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌞 建立你的早晨三步驟</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">靜坐 1 分鐘：</strong>閉上眼，感受呼吸，讓思緒慢慢歸零。
          </li>
          <li>
            <strong className="mr-2">感恩練習：</strong>默念三件讓你感激的事，讓心變得溫柔。
          </li>
          <li>
            <strong className="mr-2">設定意圖：</strong>對自己說：「今天的我會以平靜和專注前進。」
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕯️ 一杯水、一個笑容</h2>
        <p className="mb-4">
          起床後喝一杯水、對鏡子微笑，這些小舉動會釋放正向能量，
          幫助你快速啟動一天的幸福循環。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌸 結語：給自己溫柔的開始</h2>
        <p className="mb-4">
          不論你多忙，都值得用幾分鐘與自己對話。
          每個早晨都是新的起點，請為自己點亮那盞內在的小燈。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why You Need a Morning Ritual</h3>
        <p className="mb-4">
          Morning is the purest time of the day. Starting with awareness and gratitude shapes your entire rhythm.
          Even five mindful minutes can shift your mindset and mood.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Your Morning Ritual in Three Steps</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">1-Minute Stillness:</strong> Close your eyes, breathe deeply, and let your thoughts settle.
          </li>
          <li>
            <strong className="mr-2">Gratitude Practice:</strong> Recall three things you're grateful for to soften your heart.
          </li>
          <li>
            <strong className="mr-2">Set an Intention:</strong> Tell yourself, "Today, I move forward with calm and clarity."
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">A Glass of Water, a Smile</h3>
        <p className="mb-4">
          Drink a glass of water and smile at yourself in the mirror.
          Small acts like these generate positive energy and start your day in harmony.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: A Gentle Start</h3>
        <p className="mb-4">
          No matter how busy you are, you deserve a moment to meet yourself.
          Every morning is a new beginning—light your inner lamp with kindness.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


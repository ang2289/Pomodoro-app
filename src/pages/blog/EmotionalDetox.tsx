import React from "react";
import { Link } from "react-router-dom";

export default function EmotionalDetox() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌈 情緒淨化日｜用書寫重整內心能量
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Emotional Detox Day: Rebalance Your Mind Through Writing
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌬️ 為什麼情緒也需要「排毒」？</h2>
        <p className="mb-4">
          情緒就像能量流，有時會卡住、堆積或過載。
          當我們不處理它們，它們就會在潛意識中發酵。
          「情緒淨化日」是一個讓你重新整理內在能量、釋放壓力的時間。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🖋️ 書寫淨化三步驟</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">寫下你今天的情緒：</strong>不要壓抑，讓情緒自由流動在紙上。
          </li>
          <li>
            <strong className="mr-2">辨識情緒來源：</strong>問自己：「這份感受想告訴我什麼？」將焦點放在理解，而不是責怪。
          </li>
          <li>
            <strong className="mr-2">轉化能量：</strong>最後，寫下一句釋放語：「我允許自己放下，迎接新的平靜。」
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕊️ 書寫時的小建議</h2>
        <p className="mb-4">
          不必要求完美的文字，也不用在意格式。
          你可以使用筆記本、便利貼、甚至手機記事。
          重點是讓情緒被「看見」與「釋放」。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌈 結語：讓心回到清澈狀態</h2>
        <p className="mb-4">
          每一次書寫，都是一場小小的療癒。
          當你願意整理內在世界，外在生活也會逐漸變得輕盈。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Emotions Need Detox</h3>
        <p className="mb-4">
          Emotions are energy—they flow, get stuck, and build up over time.
          When ignored, they ferment in our subconscious.
          "Emotional Detox Day" helps you release tension and restore mental balance.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Writing Cleanse in Three Steps</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Step 1 – Write your feelings:</strong> Let your emotions flow freely onto paper without judgment.
          </li>
          <li>
            <strong className="mr-2">Step 2 – Identify the source:</strong> Ask, "What is this emotion trying to tell me?" Focus on understanding, not blame.
          </li>
          <li>
            <strong className="mr-2">Step 3 – Transform the energy:</strong> Write an affirmation such as "I allow myself to let go and welcome peace."
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Writing Tips</h3>
        <p className="mb-4">
          Don't aim for perfect sentences.
          Use a notebook, sticky note, or phone app—what matters is that your emotions are seen and released.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: Return Your Heart to Clarity</h3>
        <p className="mb-4">
          Every writing session is a gentle act of healing.
          When you clear your inner world, your outer life becomes lighter too.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


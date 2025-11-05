import React from "react";
import { Link } from "react-router-dom";

export default function ChantFocusArticle() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          📿 唸經與專注力訓練｜讓心更靜、念更定
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Chanting and Focus Training – A Practice to Calm the Mind and Strengthen Concentration
        </p>

        <p className="mb-4">
          許多人在唸經時會發現，念著念著心思就飄走了。這是自然現象，因為大腦習慣四處遊走。
          若能善用「專注力訓練法」──例如番茄鐘或呼吸計數──便能幫助我們回到當下，
          讓每一句佛號都更有力量、更清晰。
        </p>

        <p className="mb-4">
          嘗試設定一個 25 分鐘的唸經時間，期間不滑手機、不交談，
          只是單純地專注於聲音與心念。每完成一段，就深呼吸三次並微笑，
          感謝自己又多了一次與內心相處的練習。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪷 專注的修行過程</h2>
        <p className="mb-4">
          專注不是壓力，而是平靜的累積。透過固定節奏的唸經，
          我們能訓練心的穩定，就像在大海中練習「不被浪帶走」。
          這樣的練習不僅能提升記憶力與平靜感，
          也讓修行更有深度與持續力。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <p className="mb-4">
          Many practitioners find their thoughts drifting while chanting.
          This is natural—the mind tends to wander. By using focus techniques such as
          the Pomodoro timer or mindful breathing, you can strengthen your concentration
          and return to the present moment more easily.
        </p>

        <p className="mb-4">
          Try setting a 25-minute chanting session with no distractions—no phone, no talking.
          Just focus on the sound and the intention behind each word.
          After completing a session, take a few deep breaths and smile.
          This practice helps you connect more deeply with yourself.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💡 延伸練習 / Further Practice</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>每天固定時間唸經，例如早晨或睡前。</li>
          <li>將番茄鐘結合唸經，建立節奏感。</li>
          <li>可搭配柔和背景音樂或頌缽聲。</li>
          <li>Use a journal to note your feelings after each session.</li>
        </ul>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


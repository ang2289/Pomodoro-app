import React from "react";
import { Link } from "react-router-dom";
import ArticleCTA from "@/components/ArticleCTA";

export default function FocusReset() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800 text-lg">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🔥 專注力重啟術｜5 分鐘讓大腦回到最佳狀態
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Focus Reset Technique: Recharge Your Brain in 5 Minutes
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">⚡ 為什麼專注力會「用完」？</h2>
        <p className="mb-4">
          專注力是一種能量，長時間維持會消耗大量腦力。
          當我們持續工作超過 45 分鐘，大腦會開始分心、效率下降。
          若不適時重啟，就會出現「假忙碌、真疲倦」的現象。
        </p>

        <ArticleCTA placement="start" focus="tools" />


        <h2 className="text-2xl font-semibold mt-8 mb-3">🧠 五分鐘重啟法</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">閉眼 30 秒：</strong>遮住雙眼，讓視覺神經休息，釋放感官壓力。
          </li>
          <li>
            <strong className="mr-2">深呼吸三次：</strong>吸氣 4 秒、停 4 秒、吐氣 6 秒，讓心率回穩。
          </li>
          <li>
            <strong className="mr-2">伸展肩頸與背部：</strong>站起來做 3 次全身伸展，讓血液重新循環。
          </li>
          <li>
            <strong className="mr-2">注視遠方 20 秒：</strong>讓眼睛看向窗外或遠處，減輕眼部疲勞。
          </li>
          <li>
            <strong className="mr-2">正念提問：</strong>問自己：「我現在的最重要任務是什麼？」
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕹️ 番茄鐘與重啟的完美搭配</h2>
        <p className="mb-4">
          若你使用番茄鐘計時法，建議每 4 次工作循環後，
          進行一次完整的「專注力重啟」，搭配伸展、喝水或冥想。
          這能顯著提升長期專注品質與情緒穩定度。
        </p>

        <ArticleCTA placement="middle" focus="tools" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">💡 結語：專注不是壓力，而是節奏</h2>
        <p className="mb-4">
          專注力的維持，靠的不是拼命，而是節奏。
          學會休息，就能走得更遠。你的大腦，也值得被溫柔對待。
        </p>

        <ArticleCTA placement="bottom" focus="tools" />

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Does Focus Run Out?</h3>
        <p className="mb-4">
          Focus is energy — it depletes over time.
          After 45 minutes of intense work, your brain starts to wander.
          Without timely resets, we fall into "busy but unproductive" cycles.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Five-Minute Reset</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Close your eyes (30s):</strong> Cover your eyes to rest your visual cortex and reset sensory load.
          </li>
          <li>
            <strong className="mr-2">Deep breathing (3x):</strong> Inhale for 4s, hold for 4s, exhale for 6s to calm your nervous system.
          </li>
          <li>
            <strong className="mr-2">Stretch:</strong> Stand up, stretch your shoulders and spine three times to improve circulation.
          </li>
          <li>
            <strong className="mr-2">Look far (20s):</strong> Gaze into the distance to relax your eye muscles.
          </li>
          <li>
            <strong className="mr-2">Mindful Check-in:</strong> Ask yourself, "What's the single most important task right now?"
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Perfect Pairing with Pomodoro</h3>
        <p className="mb-4">
          Combine this with Pomodoro cycles: after every 4 sessions, do a full reset — stretch, hydrate, or meditate.
          This significantly improves focus quality and emotional balance.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: Focus Is About Rhythm, Not Pressure</h3>
        <p className="mb-4">
          Sustaining focus isn't about force—it's about rhythm.
          Resting wisely lets you go further. Your brain deserves gentle care too.
        </p>

        <ArticleCTA placement="afterFaq" focus="tools" />

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


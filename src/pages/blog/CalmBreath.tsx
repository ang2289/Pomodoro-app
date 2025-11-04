import React from "react";
import { Link } from "react-router-dom";

export default function CalmBreath() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌸 10 秒平靜呼吸法｜任何時刻快速穩定心情
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          10-Second Calm Breath: Instantly Regain Inner Peace Anytime
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕊️ 為什麼是 10 秒？</h2>
        <p className="mb-4">
          當焦慮突如其來、情緒快要爆發時，
          你不需要長時間冥想，只要 10 秒深呼吸，
          就能重新奪回對情緒的主導權。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌸 10 秒平靜呼吸步驟</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">吸氣 4 秒：</strong>
            感受空氣進入鼻腔與胸口，專注在氣流。
          </li>
          <li>
            <strong className="mr-2">停留 2 秒：</strong>
            想像你的情緒暫停，像按下暫停鍵。
          </li>
          <li>
            <strong className="mr-2">吐氣 4 秒：</strong>
            想像焦慮隨氣流慢慢釋放。
          </li>
        </ol>
        <p className="mb-4 text-sm text-gray-600">
          <strong>4-2-4 呼吸法：</strong>
          吸氣四秒、停留兩秒、吐氣四秒。想像平靜流入，壓力流出。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💡 何時使用這個方法？</h2>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>準備開會或面試前</li>
          <li>情緒緊繃或爭執後</li>
          <li>工作中突然感到煩躁或倦怠時</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">📱 與 App 搭配練習</h2>
        <p className="mb-4">
          可在番茄鐘 App 的「專注中斷」階段加入 10 秒呼吸提醒，
          也能在唸經或祈願牆中增加「平靜呼吸模式」，
          讓使用者隨時透過短暫練習回到安定狀態。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌼 結語：一口氣，就是力量</h2>
        <p className="mb-4">
          平靜不需等待。
          下一次當你心煩意亂時，
          試著深吸一口氣——那一刻，你已開始改變。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why 10 Seconds?</h3>
        <p className="mb-4">
          When anxiety hits suddenly, you don't need a long meditation.
          Just 10 seconds of controlled breathing can help you regain emotional balance.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">10-Second Calm Breath Steps</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Inhale 4 seconds:</strong>
            Feel the air entering your nose and chest, focusing on the flow.
          </li>
          <li>
            <strong className="mr-2">Hold 2 seconds:</strong>
            Imagine your emotions paused, like hitting pause.
          </li>
          <li>
            <strong className="mr-2">Exhale 4 seconds:</strong>
            Imagine anxiety releasing with the air flow.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">When to Use This Method?</h3>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>Before meetings or interviews</li>
          <li>After emotional tension or arguments</li>
          <li>When feeling irritable or exhausted at work</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Practice with App Integration</h3>
        <p className="mb-4">
          Integrate this into your Pomodoro App as a break reminder or "Calm Mode" option—
          helping users quickly recover focus between sessions.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: One Breath, One Force</h3>
        <p className="mb-4">
          Peace doesn't wait.
          The moment you take that first deep breath, change has already begun.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          所有文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
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


import React from "react";
import { Link } from "react-router-dom";

export default function EveningBreath() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌬️ 夜間放鬆呼吸法｜用一口氣卸下白天壓力
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Evening Relaxing Breath: Let Go of the Day with a Single Breath
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌙 為什麼夜晚呼吸特別重要？</h2>
        <p className="mb-4">
          一整天的緊張與壓力若未釋放，會悄悄堆積成焦慮與疲倦。
          睡前進行深層呼吸，能啟動副交感神經，幫助身體進入放鬆模式，
          為明天儲備新的能量。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌬️ 三步驟夜間放鬆呼吸法</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">第一步：放慢呼吸節奏</strong>
            吸氣四秒，吐氣八秒。想像吐氣時把一整天的煩惱都慢慢釋放。
            <p className="text-sm text-gray-600 mt-1">
              Inhale for 4 seconds, exhale for 8 seconds. Visualize releasing all stress with each breath out.
            </p>
          </li>
          <li>
            <strong className="mr-2">第二步：放鬆身體重心</strong>
            感受身體的重量被床或椅子承接，告訴自己：「我已安全，現在可以休息了。」
            <p className="text-sm text-gray-600 mt-1">
              Feel your body supported by the bed or chair. Tell yourself, "I am safe. It's time to rest."
            </p>
          </li>
          <li>
            <strong className="mr-2">第三步：心靜呼吸法</strong>
            每吸一次氣，默念「平靜」；每吐一次氣，默念「釋放」。重複三分鐘，就能讓心回歸安穩。
            <p className="text-sm text-gray-600 mt-1">
              Inhale "Calm", exhale "Release". Three minutes bring your mind back to serenity.
            </p>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪷 與冥想或睡前音樂結合</h2>
        <p className="mb-4">
          若你搭配冥想 App 或睡眠音樂播放，
          可在進入深呼吸時播放柔和樂曲或自然音，
          幫助大腦更快切換到休息狀態。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💤 結語：一口氣，卸下整天的世界</h2>
        <p className="mb-4">
          呼吸是最溫柔的療癒方式。
          不需要任何儀式，只要一口氣，就能讓身心回到平靜。
          今晚，讓呼吸成為你最安全的避風港。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Evening Breathing Matters</h3>
        <p className="mb-4">
          Daily tension accumulates silently.
          Evening breathing activates the parasympathetic system, relaxing your body and preparing it for restful sleep.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three-Step Evening Relaxation Breath</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">Step 1 – Slow the Rhythm:</strong> Inhale for 4 seconds, exhale for 8 seconds. Visualize releasing all stress with each breath out.
          </li>
          <li>
            <strong className="mr-2">Step 2 – Ground the Body:</strong> Feel your body supported by the bed or chair. Tell yourself, "I am safe. It's time to rest."
          </li>
          <li>
            <strong className="mr-2">Step 3 – Peaceful Breathing:</strong> Inhale "Calm", exhale "Release". Three minutes bring your mind back to serenity.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Combine with Meditation or Sleep Music</h3>
        <p className="mb-4">
          Pair this practice with a meditation app or soft music.
          Calming sounds help your brain transition into rest mode more naturally.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: One Breath, Release the Whole Day</h3>
        <p className="mb-4">
          Breathing is the gentlest form of healing.
          One breath at a time, you return to peace.
          Tonight, let your breath be your safe harbor.
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


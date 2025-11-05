import React from "react";
import { Link } from "react-router-dom";

export default function GratitudeBreathJournal() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌺 感恩呼吸日記｜用三口氣記錄今日的平靜
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Gratitude Breath Journal: Three Breaths to Remember Today's Peace
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌸 為什麼呼吸能成為感恩練習？</h2>
        <p className="mb-4">
          每一次深呼吸，都是與生命的重逢。
          感恩呼吸讓我們從忙碌中停下腳步，
          回望今日的一點微光、一份溫暖。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪷 三口感恩呼吸練習</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">第一口氣：感謝自己</strong>
            吸氣時默念：「謝謝我仍在努力」，
            吐氣時釋放壓力與不安。
          </li>
          <li>
            <strong className="mr-2">第二口氣：感謝他人</strong>
            想起今天幫助你、陪伴你的人，
            讓呼吸成為一份無聲的祝福。
          </li>
          <li>
            <strong className="mr-2">第三口氣：感謝當下</strong>
            感受此刻的平靜、空氣與心跳。
            吸氣時說「我在這裡」，吐氣時說「我很好」。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">📔 在 App 中建立「感恩呼吸日記」</h2>
        <p className="mb-4">
          可在每日任務或祈願牆下方新增「感恩三口氣」區塊，
          讓使用者輸入當日的三件感恩小事，
          並以呼吸動畫或音效引導完成紀錄。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💞 習慣的力量</h2>
        <p className="mb-4">
          每天三口氣，只需一分鐘，
          卻能在一週內重塑情緒穩定度與幸福感。
          感恩不是事件，而是一種呼吸的節奏。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">✨ 結語：平靜的紀錄，會閃光</h2>
        <p className="mb-4">
          當你回頭看這些感恩日記，
          會發現它們像夜空中的星，
          每一顆都在提醒你：「你已經做得很好」。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Can Breathing Be Gratitude Practice?</h3>
        <p className="mb-4">
          Every deep breath reconnects you with life itself.
          Gratitude breathing helps you pause, notice, and appreciate the small lights of your day.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three Gratitude Breaths Practice</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">First Breath: Thank Yourself:</strong>
            Inhale "Thank you, self, for trying."
            Exhale tension and doubt.
          </li>
          <li>
            <strong className="mr-2">Second Breath: Thank Others:</strong>
            Think of someone who supported you today—
            let your breath send them silent gratitude.
          </li>
          <li>
            <strong className="mr-2">Third Breath: Thank the Present:</strong>
            Feel your breath and heartbeat.
            Inhale "I am here." Exhale "I am okay."
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Build "Gratitude Breath Journal" in App</h3>
        <p className="mb-4">
          Add a "Three Gratitude Breaths" section in your app's daily log.
          Let users type three things they're thankful for, guided by calm breathing visuals or sound.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">The Power of Habit</h3>
        <p className="mb-4">
          Just one minute a day can reshape emotional stability and joy.
          Gratitude is not an event—it's a breathing rhythm.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Conclusion: Peaceful Records Will Shine</h3>
        <p className="mb-4">
          Looking back on your gratitude logs,
          you'll see stars of kindness reminding you—
          you've already done enough, and you are enough.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          所有文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


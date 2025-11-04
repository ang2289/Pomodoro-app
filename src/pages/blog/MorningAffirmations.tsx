import React from "react";
import { Link } from "react-router-dom";

export default function MorningAffirmations() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌅 早晨肯定語｜用正向意念開啟新的一天
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Morning Affirmations: Start Your Day with Positive Intentions
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">☀️ 為什麼早晨肯定語如此重要？</h2>
        <p className="mb-4">
          早晨是設定一天基調的關鍵時刻。當我們在醒來時對自己說正向的話語，
          就像為心靈設定了一個溫暖的方向。肯定語不只是話語，更是對自己的承諾與鼓勵，
          能幫助我們建立自信，面對一天的挑戰。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💫 有效的肯定語三原則</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">1️⃣ 使用現在式：</strong>
            用「我是」而不是「我會成為」，讓肯定語成為當下的真實。
            例如：「我充滿能量與創造力」而不是「我會變得有能量」。
          </li>
          <li>
            <strong className="mr-2">2️⃣ 正面且具體：</strong>
            避免否定句，專注於你想要的特質。
            「我平靜且專注」比「我不會焦慮」更有效。
          </li>
          <li>
            <strong className="mr-2">3️⃣ 與個人價值連結：</strong>
            選擇與你真正相信的價值相關的肯定語，
            這樣才能產生內在的共鳴與力量。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 適合早晨的肯定語範例</h2>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>「我今天會以開放的心迎接所有可能性」</li>
          <li>「我有能力處理今天遇到的任何挑戰」</li>
          <li>「我值得擁有平靜、快樂與成功」</li>
          <li>「我對自己和他人展現善意與耐心」</li>
          <li>「我選擇專注於當下，活出最好的自己」</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕯️ 如何進行早晨肯定語練習？</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">選擇安靜的時刻：</strong>
            在起床後、開始忙碌前，給自己 5-10 分鐘的安靜時間。
          </li>
          <li>
            <strong className="mr-2">配合呼吸：</strong>
            深吸氣時在心中默念肯定語，吐氣時感受它的力量。
          </li>
          <li>
            <strong className="mr-2">大聲說出來：</strong>
            如果可能，對著鏡子大聲說出肯定語，讓聲音和表情都參與其中。
          </li>
          <li>
            <strong className="mr-2">寫下來：</strong>
            將肯定語寫在日記或便條紙上，放在顯眼的地方提醒自己。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">✨ 結語：讓肯定語成為你的早晨儀式</h2>
        <p className="mb-4">
          每天早晨，給自己一個溫柔的開始。
          用肯定語為新的一天注入正向能量，
          你會發現，簡單的幾句話，
          就能改變你對自己、對生活的看法。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Are Morning Affirmations So Important?</h3>
        <p className="mb-4">
          Morning is the key moment to set the tone for your day.
          When we speak positive words to ourselves upon waking,
          it's like setting a warm direction for our hearts.
          Affirmations are not just words—they're promises and encouragement to ourselves,
          helping us build confidence to face the day's challenges.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three Principles of Effective Affirmations</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">1️⃣ Use Present Tense:</strong>
            Use "I am" instead of "I will become," making the affirmation a present reality.
            For example: "I am full of energy and creativity" rather than "I will become energetic."
          </li>
          <li>
            <strong className="mr-2">2️⃣ Positive and Specific:</strong>
            Avoid negatives; focus on qualities you want.
            "I am calm and focused" is more effective than "I won't be anxious."
          </li>
          <li>
            <strong className="mr-2">3️⃣ Connect with Personal Values:</strong>
            Choose affirmations related to values you truly believe in,
            so they resonate internally and generate power.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Morning Affirmation Examples</h3>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>"I welcome all possibilities today with an open heart"</li>
          <li>"I have the ability to handle any challenges I encounter today"</li>
          <li>"I deserve peace, joy, and success"</li>
          <li>"I show kindness and patience to myself and others"</li>
          <li>"I choose to focus on the present and live as my best self"</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">How to Practice Morning Affirmations</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">Choose a Quiet Time:</strong>
            Give yourself 5-10 minutes of quiet time after waking, before starting your busy day.
          </li>
          <li>
            <strong className="mr-2">Combine with Breathing:</strong>
            Inhale deeply while silently repeating the affirmation, exhale and feel its power.
          </li>
          <li>
            <strong className="mr-2">Say It Aloud:</strong>
            If possible, say the affirmation out loud in front of a mirror, engaging both voice and expression.
          </li>
          <li>
            <strong className="mr-2">Write It Down:</strong>
            Write the affirmation in a journal or on a sticky note, place it somewhere visible as a reminder.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Conclusion: Let Affirmations Be Your Morning Ritual</h3>
        <p className="mb-4">
          Every morning, give yourself a gentle start.
          Use affirmations to inject positive energy into your new day.
          You'll discover that simple words
          can change how you see yourself and life.
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


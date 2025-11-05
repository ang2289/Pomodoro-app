import React from "react";
import { Link } from "react-router-dom";

export default function EveningGratitudeJournal() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌙 夜間感恩日記｜結束一天的溫柔儀式
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Evening Gratitude Journal: A Gentle Ritual to End Your Day
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌌 為什麼要在夜晚寫感恩日記？</h2>
        <p className="mb-4">
          夜晚是回顧與沉澱的時刻。當一天即將結束，
          寫下感恩的事能幫助我們轉換視角，從疲憊中看見美好，
          從挫折中看見成長。這不僅是記錄，更是一種心靈的整理與修復。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">📔 夜間感恩日記的三個問題</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">1️⃣ 今天最感謝的一件事：</strong>
            可能是一頓美好的餐點、一句溫暖的話，或是一個意外的幫助。
            寫下具體的細節，讓感恩不只是空泛的詞彙。
          </li>
          <li>
            <strong className="mr-2">2️⃣ 今天學到的一個小啟發：</strong>
            即使是不順遂的一天，也有值得學習的地方。
            記錄下這個啟發，讓它成為明天的養分。
          </li>
          <li>
            <strong className="mr-2">3️⃣ 想對明天的自己說的話：</strong>
            給明天的自己一個鼓勵或提醒，讓感恩的力量延續到新的一天。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕯️ 如何建立寫日記的習慣？</h2>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">設定固定時間：</strong>
            在睡前 30 分鐘，找一個安靜的角落，讓寫日記成為睡前的儀式。
          </li>
          <li>
            <strong className="mr-2">不需要完美：</strong>
            即使只有一句話，也比完全不寫好。給自己彈性，不要因為壓力而放棄。
          </li>
          <li>
            <strong className="mr-2">使用紙筆或 App：</strong>
            選擇最適合自己的方式，紙筆能帶來觸感，App 則便於回顧與搜尋。
          </li>
          <li>
            <strong className="mr-2">搭配呼吸練習：</strong>
            寫之前先深呼吸三次，讓心情平靜下來，更能專注於感恩的時刻。
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">✨ 感恩日記的療癒力量</h2>
        <p className="mb-4">
          研究顯示，每天寫感恩日記能顯著提升幸福感與睡眠品質。
          當我們主動尋找生活中的美好，大腦會逐漸形成正向思考的模式。
          即使是不起眼的小事，也能成為支撐我們度過困難時刻的力量。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💤 結語：讓感恩成為睡前的最後一盞燈</h2>
        <p className="mb-4">
          當你學會在夜晚感謝今天的自己，
          你會發現，即使是最平凡的一天，
          也藏著值得珍惜的瞬間。
          讓感恩日記成為你與自己對話的橋樑，
          讓每一天的結束，都帶著溫柔與希望。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Write a Gratitude Journal at Night?</h3>
        <p className="mb-4">
          Night is a time for reflection and settling. As the day ends,
          writing down what you're grateful for helps shift your perspective,
          finding beauty in exhaustion and growth in setbacks.
          This is not just recording—it's a form of emotional healing.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three Questions for Evening Gratitude Journal</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">1️⃣ One Thing You're Most Grateful For Today:</strong>
            It could be a good meal, a kind word, or unexpected help.
            Write down the details so gratitude becomes tangible, not just words.
          </li>
          <li>
            <strong className="mr-2">2️⃣ One Small Insight You Learned Today:</strong>
            Even on difficult days, there's something to learn.
            Record this insight—let it nourish tomorrow.
          </li>
          <li>
            <strong className="mr-2">3️⃣ Something You Want to Say to Tomorrow's Self:</strong>
            Give tomorrow's self an encouragement or reminder,
            letting gratitude carry forward into the new day.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">How to Build a Journaling Habit</h3>
        <ul className="list-disc ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Set a Fixed Time:</strong>
            Find a quiet corner 30 minutes before bed, making journaling a pre-sleep ritual.
          </li>
          <li>
            <strong className="mr-2">It Doesn't Have to Be Perfect:</strong>
            Even one sentence is better than nothing. Give yourself flexibility—don't quit due to pressure.
          </li>
          <li>
            <strong className="mr-2">Use Paper or an App:</strong>
            Choose what works best for you. Paper brings texture; apps make review and search easier.
          </li>
          <li>
            <strong className="mr-2">Combine with Breathing:</strong>
            Take three deep breaths before writing to calm your mind and focus on gratitude.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">The Healing Power of Gratitude Journaling</h3>
        <p className="mb-4">
          Research shows that daily gratitude journaling significantly improves happiness and sleep quality.
          When we actively seek beauty in life, our brains gradually form positive thinking patterns.
          Even small, unnoticed moments can become strength to get through difficult times.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Conclusion: Let Gratitude Be the Last Light Before Sleep</h3>
        <p className="mb-4">
          When you learn to thank today's self at night,
          you'll discover that even the most ordinary day
          holds moments worth cherishing.
          Let gratitude journaling be a bridge for conversation with yourself,
          so every day ends with gentleness and hope.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          所有文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


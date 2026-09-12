import React from 'react';
import { Link } from "react-router-dom";
import ArticleCTA from "@/components/ArticleCTA";

export default function EveningDetox() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800 text-lg">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌙 晚間放鬆法｜睡前五分鐘的心靈排毒
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Evening Detox: 5-Minute Nighttime Mind Cleanse for Inner Peace
        </p>

        <p className="mb-4">
          在現代生活的壓力轟炸下，睡前總是胡思亂想、翻來覆去睡不著？這篇文章帶你用五分鐘，清除一天累積的壓力與雜念，讓你徹底安睡！
        </p>

        <ArticleCTA placement="start" focus="tools" />


        <p className="mb-6 text-sm text-gray-500 italic">
          💤 Struggling with racing thoughts at bedtime? This five-minute routine is your quick fix to release stress and mental clutter — so you can finally get the deep sleep you deserve.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">1. 關掉螢幕，關掉世界</h2>
        <p className="mb-4">
          睡前一小時停止滑手機，才能讓大腦逐漸進入休息模式。藍光干擾睡眠品質，也讓你情緒起伏不定。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">2. 進行 5 次深呼吸</h2>
        <p className="mb-4">
          深呼吸是最簡單卻被低估的心靈清潔劑。吸氣 4 秒、閉氣 4 秒、吐氣 4 秒，重複五次，讓焦慮和雜念慢慢離開你的身體。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">3. 寫下一件「我感謝的事」</h2>
        <p className="mb-4">
          就算今天很糟，也一定有一件值得感激的事。寫下它，可以幫你轉化壓力，讓心情沉澱下來，為入睡鋪路。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">4. 觀想「心靈淨空」</h2>
        <p className="mb-4">
          閉上眼睛，想像一道光洗去煩惱與疲憊，如水流般沖淡焦慮。可想像在溫泉、陽光中被安撫與包圍。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">5. 對自己說「你已經做得夠好了」</h2>
        <p className="mb-4">
          今晚不再批判自己，允許自己「無條件地休息」，因為你已經努力了一整天。
        </p>

        <ArticleCTA placement="middle" focus="tools" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">✨ 結語</h2>
        <p className="mb-10">
          今晚，請帶著溫柔與感激入睡。你值得一場深沉平靜的夢。
        </p>

        <ArticleCTA placement="bottom" focus="tools" />

        <hr className="my-8 border-gray-300" />

        {/* English Version */}
        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <p className="mb-4">
          In our fast-paced modern world, bedtime often brings racing thoughts and endless tossing and turning. This five-minute routine will help you release accumulated stress and mental clutter, paving the way for truly restful sleep.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Step 1: Turn Off Screens</h3>
        <p className="mb-4">
          Stop using your phone one hour before bed. This allows your brain to gradually enter rest mode. Blue light disrupts sleep quality and keeps your emotions unsettled.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Step 2: Take 5 Deep Breaths</h3>
        <p className="mb-4">
          Deep breathing is the simplest and most underestimated mind cleanser. Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds. Repeat five times to let anxiety and racing thoughts gradually leave your body.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Step 3: Write Down One Thing You're Grateful For</h3>
        <p className="mb-4">
          Even on the worst days, there's always something worth being grateful for. Writing it down helps transform stress, allowing your mind to settle and prepare for sleep.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Step 4: Visualize "Mind Detox"</h3>
        <p className="mb-4">
          Close your eyes and imagine a light washing away your worries and fatigue, like water gently rinsing away anxiety. Visualize yourself in a warm spring or surrounded by gentle sunlight.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Step 5: Tell Yourself "You've Done Enough"</h3>
        <p className="mb-4">
          Tonight, let go of self-criticism. Allow yourself to rest unconditionally, because you've already worked hard all day.
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


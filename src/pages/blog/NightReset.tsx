import React from "react";
import { Link } from "react-router-dom";

export default function NightReset() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🌙 夜間重啟法｜放下焦慮、迎接安眠
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Night Reset Ritual: Let Go of Anxiety and Embrace Rest
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌌 為什麼需要夜間重啟？</h2>
        <p className="mb-4">
          當我們結束忙碌的一天，心裡仍殘留著許多未完成的思緒與壓力。
          若不釋放，它們會在夜裡化為焦慮與失眠。夜間重啟法能幫助你整理能量，
          與自己和平道別今日。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🕯️ 三步驟放鬆儀式</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">調整光線：</strong>關掉刺眼燈光，點上溫暖的小夜燈或香氛燭。
          </li>
          <li>
            <strong className="mr-2">呼吸釋放：</strong>用 4-7-8 呼吸法深呼吸三次，放慢心跳與思緒。
          </li>
          <li>
            <strong className="mr-2">感恩書寫：</strong>在筆記上寫下三件讓你感激的事，讓心平靜下來。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌙 聽覺與香氣的療癒力量</h2>
        <p className="mb-4">
          柔和的音樂與淡淡香氣能引導大腦進入放鬆模式。
          可以播放輕柔鋼琴曲、自然水聲，搭配薰衣草或洋甘菊香氣，
          幫助你從思緒回到感官。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💤 結語：為夢境留下一盞溫柔的燈</h2>
        <p className="mb-4">
          夜晚不只是結束，更是重生的起點。
          當你學會溫柔地與自己告別，安眠便會自然降臨。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why You Need a Night Reset</h3>
        <p className="mb-4">
          At the end of a busy day, lingering thoughts and stress can transform into anxiety at night.
          A nightly reset helps you release tension, restore calm, and gently say goodbye to the day.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three-Step Relaxation Ritual</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Soften the Light:</strong> Dim the lights and light a soft candle or diffuser.
          </li>
          <li>
            <strong className="mr-2">Breathing Reset:</strong> Use the 4-7-8 breathing technique to slow your heartbeat and calm your mind.
          </li>
          <li>
            <strong className="mr-2">Gratitude Writing:</strong> Write down three things you're thankful for before bed.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">The Healing Power of Sound and Scent</h3>
        <p className="mb-4">
          Gentle sounds and soothing scents help your brain enter relaxation mode.
          Try soft piano music, nature sounds, or lavender aroma to bring your focus back to the senses.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: Leave a Gentle Light for Your Dreams</h3>
        <p className="mb-4">
          Night is not just an end—it's the beginning of renewal.
          When you learn to say goodnight to yourself with kindness, rest will find you naturally.
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


import React from "react";
import { Link } from "react-router-dom";

export default function SelfDialogueMeditation() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🪞 自我對話冥想｜傾聽內在聲音的練習
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Self-Dialogue Meditation: Listening to Your Inner Voice
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🫧 為什麼要練習「與自己對話」？</h2>
        <p className="mb-4">
          我們每天都與外界對話，卻常忽略了最重要的那個人——自己。
          自我對話冥想讓你有機會停下來，觀察內心真正的感受與需求，
          並以溫柔的方式與自己重新連結。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💬 三步驟內在對話練習</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">靜心觀察：</strong>閉上眼，深呼吸三次，觀察內心出現的第一個念頭。不批評，只觀察。
          </li>
          <li>
            <strong className="mr-2">誠實傾聽：</strong>問自己：「我現在真正需要的是什麼？」也許是休息、安靜、或一點鼓勵。
          </li>
          <li>
            <strong className="mr-2">溫柔回應：</strong>對自己說：「沒關係，我聽見你了。」讓這句話成為心靈的擁抱。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪞 鏡子前的練習</h2>
        <p className="mb-4">
          若能在鏡子前練習，注視自己的眼睛，
          嘗試微笑並說出一句肯定語：「我正在變得更平靜、更堅定。」
          你會發現，這份溫柔的力量會慢慢長出來。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 結語：與自己成為朋友</h2>
        <p className="mb-4">
          當你願意靜下來傾聽內在的聲音，
          你會發現焦慮漸漸淡去，取而代之的是理解與平靜。
          每一次自我對話，都是自我療癒的開始。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Practice Self-Dialogue?</h3>
        <p className="mb-4">
          We talk to others all day, yet often forget the most important person—ourselves.
          Self-dialogue meditation gives you a pause to notice your true feelings and needs,
          reconnecting with yourself in a kind and honest way.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Inner Dialogue Practice in Three Steps</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Observe:</strong> Close your eyes, take three deep breaths, and notice your first thought. Don't judge—just observe.
          </li>
          <li>
            <strong className="mr-2">Listen Honestly:</strong> Ask, "What do I really need right now?" Maybe it's rest, quiet, or a bit of encouragement.
          </li>
          <li>
            <strong className="mr-2">Respond Kindly:</strong> Tell yourself, "It's okay, I hear you." Let those words be an embrace for your soul.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Mirror Practice</h3>
        <p className="mb-4">
          Practice in front of a mirror. Look into your own eyes, smile gently,
          and say an affirmation: "I'm becoming calmer and stronger."
          You'll feel that gentle strength begin to grow inside you.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: Become Friends with Yourself</h3>
        <p className="mb-4">
          When you listen to your inner voice, anxiety fades away—replaced by understanding and peace.
          Every self-dialogue is the first step toward healing.
        </p>

        <p className="mt-8 text-gray-500 text-center text-sm">
          文章由 RxV 夢想創作工作室撰寫 · 保留所有權利
        </p>

        <hr className="my-8 border-gray-300" />

        
      </article>
    </div>
  );
}


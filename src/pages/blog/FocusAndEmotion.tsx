import React from "react";
import { Link } from "react-router-dom";

export default function FocusAndEmotion() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          💭 專注與情緒的關聯｜當心散了，效率也會消失
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Focus and Emotion Connection: When the Mind Wanders, Efficiency Fades
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🧩 專注與情緒，其實是雙向的</h2>
        <p className="mb-4">
          很多人以為專注力只是「意志力」的問題，
          但其實情緒穩定度才是專注力的基礎。
          當焦慮或煩躁升起，大腦的前額葉皮質（掌管專注與決策）會被壓制，
          導致「心亂、效率低」的惡性循環。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🎯 當情緒影響專注時，大腦發生了什麼？</h2>
        <ul className="list-disc ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">焦慮：</strong>大腦進入「威脅模式」，思考變得片段化。
            <p className="text-sm text-gray-600 mt-1">
              Anxiety activates the amygdala, making your thoughts fragmented and reactive.
            </p>
          </li>
          <li>
            <strong className="mr-2">憤怒：</strong>注意力會鎖定在問題或對象上，忽略全局。
            <p className="text-sm text-gray-600 mt-1">
              Anger narrows attention, causing fixation on triggers rather than solutions.
            </p>
          </li>
          <li>
            <strong className="mr-2">悲傷：</strong>能量下降，思考速度變慢，動機減弱。
            <p className="text-sm text-gray-600 mt-1">
              Sadness slows cognition and motivation, reducing task engagement.
            </p>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪶 讓情緒幫助你「專注」的方法</h2>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">覺察當下情緒：</strong>專注不是壓抑，而是承認。問自己：「我現在的情緒是什麼？」這一步讓理性重新接管大腦。
            <p className="text-sm text-gray-600 mt-1">
              Acknowledge your emotion: Ask yourself, "What am I feeling right now?" Recognition restores rational control.
            </p>
          </li>
          <li>
            <strong className="mr-2">呼吸轉換：</strong>利用深呼吸降低壓力荷爾蒙皮質醇，讓專注力自然回歸。
            <p className="text-sm text-gray-600 mt-1">
              Breathing reset: Deep breathing reduces cortisol, helping focus return naturally.
            </p>
          </li>
          <li>
            <strong className="mr-2">將情緒轉化為動能：</strong>將焦慮視為提醒，而非敵人。它提示你「某件事很重要」，學會善用這份能量。
            <p className="text-sm text-gray-600 mt-1">
              Transform emotion into action: Anxiety signals importance — use it as focused motivation.
            </p>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">💡 結語：平靜是專注的最佳燃料</h2>
        <p className="mb-4">
          專注與情緒的平衡，不在於壓抑，而在於理解。
          當你願意與情緒共處，大腦會自動進入更高效、更穩定的狀態。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Focus and Emotion Work Both Ways</h3>
        <p className="mb-4">
          Focus and emotion are deeply connected.
          Emotional instability disrupts the prefrontal cortex — the center of decision-making and attention —
          causing mental clutter and reduced efficiency.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">What Happens When Emotion Affects Focus?</h3>
        <ul className="list-disc ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">Anxiety:</strong> Brain enters "threat mode," thoughts become fragmented.
          </li>
          <li>
            <strong className="mr-2">Anger:</strong> Attention narrows, fixating on triggers rather than solutions.
          </li>
          <li>
            <strong className="mr-2">Sadness:</strong> Energy drops, thinking slows, motivation weakens.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">Methods to Help Emotion Serve Focus</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-4">
          <li>
            <strong className="mr-2">Acknowledge your emotion:</strong> Ask yourself, "What am I feeling right now?" Recognition restores rational control.
          </li>
          <li>
            <strong className="mr-2">Breathing reset:</strong> Deep breathing reduces cortisol, helping focus return naturally.
          </li>
          <li>
            <strong className="mr-2">Transform emotion into action:</strong> Anxiety signals importance — use it as focused motivation.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">Closing: Calm Is the Best Fuel for Focus</h3>
        <p className="mb-4">
          True focus doesn't come from suppressing emotion but from understanding it.
          When you coexist peacefully with your feelings, your mind operates at peak performance.
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


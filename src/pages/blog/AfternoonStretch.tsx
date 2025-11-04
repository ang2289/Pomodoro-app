import React from "react";
import { Link } from "react-router-dom";

export default function AfternoonStretch() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🧘‍♂️ 午間伸展術｜轉換心情與提升專注
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Afternoon Stretch: Refresh Your Mood and Boost Focus
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">☀️ 為什麼中午特別需要活動？</h2>
        <p className="mb-4">
          午餐後容易產生疲倦感與注意力下降，長時間久坐更會造成肌肉緊繃與血液循環不良。
          午間伸展能喚醒身體活力，讓下午的工作與學習更有效率。
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🪶 三步驟快速伸展法</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">肩頸舒展：</strong>雙手交握放在頭後，深呼吸時向後輕壓，釋放肩頸緊繃。
          </li>
          <li>
            <strong className="mr-2">脊椎伸展：</strong>雙手往上舉，手掌向天，感受整個背部被拉長。
          </li>
          <li>
            <strong className="mr-2">側身扭轉：</strong>坐姿或站姿都可，身體向左、右各輕扭三次。
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 心靈重啟的 3 分鐘</h2>
        <p className="mb-4">
          伸展不只是身體活動，更是一種心靈轉換。
          當你專注在呼吸與身體感受時，大腦會自然進入放鬆與覺察狀態，像是重新按下「重啟鍵」。
        </p>

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">Why Midday Movement Matters</h3>
        <p className="mb-4">
          After lunch, it's common to feel drowsy and lose focus. Prolonged sitting also causes muscle stiffness and poor circulation.
          Midday stretching reactivates your body and prepares your mind for a productive afternoon.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three-Step Quick Stretch</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Neck & Shoulder Stretch:</strong> Interlock fingers behind your head, gently press backward while breathing deeply to release tension.
          </li>
          <li>
            <strong className="mr-2">Spine Extension:</strong> Raise your arms overhead with palms up, feeling your back lengthen with each breath.
          </li>
          <li>
            <strong className="mr-2">Side Twist:</strong> Twist your upper body gently to the left and right three times to loosen your waist and spine.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">A Three-Minute Mind Reset</h3>
        <p className="mb-4">
          Stretching isn't only physical—it's also mental. Focusing on your breath and sensations resets your mind, like pressing a mental "refresh" button.
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


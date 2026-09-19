import React from "react";
import { Link } from "react-router-dom";
import ArticleCTA from "@/components/ArticleCTA";

export default function HealthyLunch() {
  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <article className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-3xl w-full leading-relaxed text-gray-800 text-lg">
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          🥣 健康午餐習慣｜穩定能量與思緒
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Healthy Lunch Habits: Steady Energy, Clear Mind
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌤️ 午餐的重要性</h2>
        <p className="mb-4">
          午餐不僅是補充能量的時刻，也是身心重新平衡的關鍵。
          若選擇過於油膩或高糖的餐點，容易在下午陷入疲倦與昏沉。
        </p>

        <ArticleCTA placement="start" focus="tools" />


        <h2 className="text-2xl font-semibold mt-8 mb-3">🥗 三個維持穩定能量的小祕訣</h2>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">搭配高纖蔬菜：</strong>蔬菜能穩定血糖、延長飽足感。
          </li>
          <li>
            <strong className="mr-2">選擇良好蛋白質：</strong>豆腐、雞胸肉、蛋能提升腦部專注力。
          </li>
          <li>
            <strong className="mr-2">減少過量澱粉與糖：</strong>少吃精緻碳水，維持穩定情緒。
          </li>
        </ol>

        <ArticleCTA placement="middle" focus="tools" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🍵 心靈補給的小儀式</h2>
        <p className="mb-4">
          吃飯時放下手機、專注感受食物香氣與口感，
          讓午餐成為短暫的冥想時光，幫助你重新整理思緒。
        </p>

        <ArticleCTA placement="bottom" focus="tools" />

        <hr className="my-8 border-gray-300" />

        <h2 className="text-2xl font-semibold mt-8 mb-3">🌿 English Version</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">The Importance of Lunch</h3>
        <p className="mb-4">
          Lunch is not only a refueling break, but also a moment to restore balance.
          Choosing heavy or sugary meals often leads to post-lunch drowsiness and energy crashes.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three Tips for Stable Energy</h3>
        <ol className="list-decimal ml-6 space-y-2 mb-4">
          <li>
            <strong className="mr-2">Eat more fiber:</strong> Vegetables help stabilize blood sugar and keep you full longer.
          </li>
          <li>
            <strong className="mr-2">Choose lean proteins:</strong> Tofu, eggs, or chicken breast improve mental focus.
          </li>
          <li>
            <strong className="mr-2">Limit refined carbs:</strong> Too much starch or sugar causes mood swings and fatigue.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 mb-3">A Mindful Eating Practice</h3>
        <p className="mb-4">
          Put away your phone while eating and focus on the aroma and texture of your meal.
          Let lunch be a mindful pause to clear your thoughts and restore calm.
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


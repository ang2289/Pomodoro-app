import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function DietMind2025() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <>
      <Helmet>
        {lang.startsWith("zh") ? (
          <>
            <title>飲食覺察｜從三餐開始打造心理健康｜RxV 健康專欄</title>
            <meta
              name="description"
              content="飲食不僅影響身體，也影響情緒與決策。學會飲食覺察，從三餐打造穩定的心理健康。"
            />
            <meta
              name="keywords"
              content="心理健康, 飲食控制, 正念飲食, 營養平衡, RxV 健康專欄"
            />
            <meta property="og:title" content="飲食覺察｜從三餐開始打造心理健康" />
            <meta
              property="og:description"
              content="健康飲食不只是減重，而是提升專注、情緒與生活品質的關鍵。"
            />
          </>
        ) : (
          <>
            <title>Mindful Eating｜Build Mental Wellness from Every Meal｜RxV Health</title>
            <meta
              name="description"
              content="Food shapes not just your body but your emotions and decisions. Practice mindful eating to achieve true balance."
            />
            <meta
              name="keywords"
              content="mental health, mindful eating, nutrition balance, emotional wellness, RxV blog"
            />
            <meta property="og:title" content="Mindful Eating｜Build Mental Wellness from Every Meal" />
            <meta
              property="og:description"
              content="Healthy eating is not about dieting — it's about building focus, calm, and lasting happiness."
            />
          </>
        )}
      </Helmet>
      <div className="max-w-3xl mx-auto py-10 px-6 text-lg">
      <h1 className="text-2xl font-bold mb-4">
        {lang.startsWith("zh")
          ? "🍎 飲食覺察｜從三餐開始打造心理健康"
          : "🍎 Mindful Eating｜Build Mental Wellness from Every Meal"}
      </h1>

      <p className="text-gray-600 mb-4">2025-11-04</p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            現代人生活節奏快，外食比例高，常常忽略「吃」對情緒與心理的影響。
            研究發現，營養不足與高糖高脂飲食，會降低腦部血清素分泌，
            導致焦慮與情緒不穩。
          </>
        ) : (
          <>
            Modern life is fast-paced, with high rates of dining out, often overlooking the impact
            of "eating" on emotions and mental state. Research has found that nutritional
            deficiencies and high-sugar, high-fat diets reduce brain serotonin secretion, leading
            to anxiety and emotional instability.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            若想讓心情穩定，建議採用「地中海飲食」模式：
            多吃新鮮蔬果、全穀物與橄欖油，並適量攝取魚類與堅果。
            同時減少精緻糖與加工品，能顯著降低憂鬱與慢性疲勞的風險。
          </>
        ) : (
          <>
            If you want to stabilize your mood, it's recommended to adopt the "Mediterranean diet"
            pattern: eat more fresh fruits and vegetables, whole grains, and olive oil, and
            consume fish and nuts in moderation. At the same time, reducing refined sugars and
            processed foods can significantly lower the risk of depression and chronic fatigue.
          </>
        )}
      </p>

      <p className="mb-4">
        {lang.startsWith("zh") ? (
          <>
            每一口食物都是身體的訊息。當你開始有意識地選擇食物，
            你的心理韌性與生活品質也會隨之提升。
          </>
        ) : (
          <>
            Every bite of food is a message from the body. When you begin to consciously choose
            food, your psychological resilience and quality of life will also improve.
          </>
        )}
      </p>

      <div className="text-center mt-8">
        <Link
          to="/health"
          className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2 px-6 rounded-full inline-block"
        >
          {lang.startsWith("zh") ? "← 回到健康生活專欄" : "← Back to Health Living"}
        </Link>
      </div>
      </div>
    </>
  );
}


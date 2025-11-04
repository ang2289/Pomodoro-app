import React from "react";
import { Link } from "react-router-dom";
import RSSButton from "@/components/RSSButton";

export default function BlogHome() {
  const articles = [
    {
      path: "/blog/pomodoro-focus",
      title: "🧘‍♀️ 如何用番茄鐘提升專注與靜心力",
      subtitle: "How to Use the Pomodoro Method to Enhance Focus and Mindfulness",
      description: "學習如何運用番茄鐘專注法來提升工作效能，並培養內心的平靜與覺察力。結合 25 分鐘的專注時段與短暫休息，讓效率與心靈平衡同時提升。",
      image: "🕒"
    },
    {
      path: "/blog/chant-focus",
      title: "📿 唸經與專注力訓練｜讓心更靜、念更定",
      subtitle: "Chanting and Focus Training – A Practice to Calm the Mind and Strengthen Concentration",
      description: "將專注力訓練法與唸經修行結合，幫助你在誦經時維持內心穩定。透過固定節奏的練習，訓練心的專注力，讓修行更有深度。",
      image: "🪷"
    },
    {
      path: "/blog/morning-meditation",
      title: "🌞 清晨靜坐法｜如何開啟充滿能量的一天",
      subtitle: "Morning Meditation: The Art of Starting a Mindful and Energized Day",
      description: "學習如何在早晨醒來後運用 10-15 分鐘靜坐，讓身心重啟並充滿能量。透過簡單的呼吸練習與專注訓練，開啟平靜有方向的一天。",
      image: "🌞"
    },
    {
      path: "/blog/evening-detox",
      title: "🌙 晚間放鬆法｜睡前五分鐘的心靈排毒",
      subtitle: "Evening Detox: 5-Minute Nighttime Mind Cleanse for Inner Peace",
      description: "學會五分鐘睡前排毒儀式，讓你從壓力中釋放出來、穩定情緒、安然入眠。這篇文章教你具體步驟與靜心語句，睡前告別煩惱與焦慮。",
      image: "🌙"
    },
    {
      path: "/blog/perfect-breakfast-time",
      title: "🥐 早餐不容錯過的天元時間",
      subtitle: "The Best Time for Breakfast You Shouldn't Miss",
      description: "認識早晨的「天元時間」——身心最敏銳、最渴望被滋養的黃金片刻。學習如何選擇最適合的早餐，讓營養成為調頻生活的鑰匙。",
      image: "🥐"
    },
    {
      path: "/blog/evening-meditation",
      title: "🌙 晚安冥想｜幫助你放下白天的焦慮與疲憊",
      subtitle: "Evening Meditation: Release the Stress of the Day",
      description: "白天的工作、學業、人際關係常讓我們神經緊繃，這時候，晚安冥想幫助你釋放壓力與焦慮，進入深層放鬆與睡眠。",
      image: "🌙"
    },
    {
      path: "/blog/afternoon-stretch",
      title: "🧘‍♂️ 午間伸展術｜轉換心情與提升專注",
      subtitle: "Afternoon Stretch: Refresh Your Mood and Boost Focus",
      description: "學會三步驟午間伸展術，幫助你釋放壓力、轉換心情、提升下午專注力與效率。",
      image: "🧘‍♂️"
    },
    {
      path: "/blog/healthy-lunch",
      title: "🥣 健康午餐習慣｜穩定能量與思緒",
      subtitle: "Healthy Lunch Habits: Steady Energy, Clear Mind",
      description: "學習打造穩定能量的午餐，避免昏沉與疲倦，讓下午保持清晰與專注。",
      image: "🥣"
    },
    {
      path: "/blog/hydration-meditation",
      title: "💧 補水冥想法｜用喝水喚醒覺察",
      subtitle: "Hydration Meditation: Awaken Awareness Through Water",
      description: "讓喝水變成一種冥想，透過覺察每一口水，讓身體與心靈都回到平衡與清明。",
      image: "💧"
    },
    {
      path: "/blog/morning-ritual",
      title: "🌸 早晨儀式｜為自己點亮一天的心能量",
      subtitle: "Morning Ritual: Ignite Your Inner Energy for the Day",
      description: "透過五分鐘早晨儀式，讓自己帶著平靜、感恩與清明開始新的一天。",
      image: "🌸"
    },
    {
      path: "/blog/night-reset",
      title: "🌙 夜間重啟法｜放下焦慮、迎接安眠",
      subtitle: "Night Reset Ritual: Let Go of Anxiety and Embrace Rest",
      description: "學會夜間重啟三步驟，幫助你釋放焦慮、穩定心神，迎接深層好眠。",
      image: "🌙"
    },
    {
      path: "/blog/self-dialogue-meditation",
      title: "🪞 自我對話冥想｜傾聽內在聲音的練習",
      subtitle: "Self-Dialogue Meditation: Listening to Your Inner Voice",
      description: "學會以溫柔的方式與自己對話，傾聽內在真實聲音，釋放焦慮與自我批評。",
      image: "🪞"
    },
    {
      path: "/blog/emotional-detox",
      title: "🌈 情緒淨化日｜用書寫重整內心能量",
      subtitle: "Emotional Detox Day: Rebalance Your Mind Through Writing",
      description: "透過書寫釋放內心壓力，讓情緒重新流動，找回內在的平靜與力量。",
      image: "🌈"
    },
    {
      path: "/blog/focus-reset",
      title: "🔥 專注力重啟術｜5 分鐘讓大腦回到最佳狀態",
      subtitle: "Focus Reset Technique: Recharge Your Brain in 5 Minutes",
      description: "學會五分鐘專注力重啟術，結合番茄鐘節奏，讓大腦重新充電、找回效率與平靜。",
      image: "🔥"
    },
    {
      path: "/blog/focus-and-emotion",
      title: "💭 專注與情緒的關聯｜當心散了，效率也會消失",
      subtitle: "Focus and Emotion Connection: When the Mind Wanders, Efficiency Fades",
      description: "探索情緒如何影響專注力與決策，學會運用焦慮與壓力，讓大腦重新進入高效狀態。",
      image: "💭"
    },
    {
      path: "/blog/focus-meditation",
      title: "🧘‍♀️ 專注冥想法｜每天三分鐘讓思緒歸零",
      subtitle: "Mindful Focus Meditation: Three Minutes to Mental Clarity",
      description: "每天三分鐘專注冥想，幫助你放下雜念、恢復清明，結合番茄鐘休息時段效果最佳。",
      image: "🧘‍♀️"
    },
    {
      path: "/blog/morning-breath",
      title: "🌺 身心重啟晨間呼吸法｜為一天注入正能量",
      subtitle: "Morning Breath Renewal: Energize Your Mind and Body for the Day",
      description: "每天三分鐘的晨間呼吸法，喚醒身體與心靈，為新的一天注入平靜與能量。",
      image: "🌺"
    },
    {
      path: "/blog/evening-breath",
      title: "🌬️ 夜間放鬆呼吸法｜用一口氣卸下白天壓力",
      subtitle: "Evening Relaxing Breath: Let Go of the Day with a Single Breath",
      description: "睡前三分鐘深呼吸，放下焦慮與疲憊，讓身體重啟放鬆與平靜。",
      image: "🌬️"
    },
    {
      path: "/blog/weekly-breath-challenge",
      title: "🌿 一週情緒排毒呼吸挑戰｜每天一種呼吸法重啟心能量",
      subtitle: "7-Day Emotional Detox Breath Challenge: A New Energy Each Day",
      description: "七天七種呼吸練習，幫你每天釋放壓力、重啟心靈能量，打造穩定又平靜的自己。",
      image: "🌿"
    },
    {
      path: "/blog/calm-breath",
      title: "🌸 10 秒平靜呼吸法｜任何時刻快速穩定心情",
      subtitle: "10-Second Calm Breath: Instantly Regain Inner Peace Anytime",
      description: "短短 10 秒，快速回復平靜與專注。隨時可練的呼吸技巧，適合忙碌生活中的你。",
      image: "🌸"
    },
    {
      path: "/blog/focus-breath",
      title: "🔥 專注力呼吸訓練｜用節奏引導進入心流狀態",
      subtitle: "Focused Flow Breathing: Entering the Zone with Rhythm and Breath",
      description: "三階段呼吸訓練，幫助你穩定專注、快速進入心流模式，搭配番茄鐘效果更佳。",
      image: "🔥"
    },
    {
      path: "/blog/breath-prayer",
      title: "🕯️ 呼吸與祈願｜讓每一口氣都成為祝福",
      subtitle: "Breath & Prayer: Let Every Breath Become a Blessing",
      description: "讓呼吸成為祈願的力量，在一吸一吐之間傳遞平靜與祝福。",
      image: "🕯️"
    },
    {
      path: "/blog/gratitude-breath-journal",
      title: "🌺 感恩呼吸日記｜用三口氣記錄今日的平靜",
      subtitle: "Gratitude Breath Journal: Three Breaths to Remember Today's Peace",
      description: "每天三口感恩呼吸，讓生活更柔軟、心更平靜。結合 App 日誌功能記錄幸福時刻。",
      image: "🌺"
    },
    {
      path: "/blog/chant-energy-breath",
      title: "💫 集氣呼吸法｜把願望變成能量傳遞",
      subtitle: "Energy Chant Breathing: Turning Wishes into Vibrations of Light",
      description: "結合呼吸與願望牆練習，用氣息傳遞祝福，讓願望化為光的能量。",
      image: "💫"
    },
    {
      path: "/blog/moonlight-meditation-breath",
      title: "🌕 月光冥想呼吸法｜睡前放下、迎接安眠",
      subtitle: "Moonlight Meditation Breath: Let Go and Rest Under the Night Sky",
      description: "睡前三口氣，讓月光與呼吸帶走白天的壓力。未來將推出睡眠音樂模組，讓放鬆更完整。",
      image: "🌕"
    },
    {
      path: "/blog/sleep-sound-therapy",
      title: "🎵 音樂放鬆入眠法｜聲音也能療癒你的夢",
      subtitle: "Sleep Sound Therapy｜Healing Through Sound and Calm",
      description: "聲音是最溫柔的療癒方式。教你如何用音樂陪伴夜晚，讓每個夢都更平靜。",
      image: "🎵"
    },
    {
      path: "/blog/evening-gratitude-journal",
      title: "🪞 晚間感恩筆記法｜一天的美好收心練習",
      subtitle: "Evening Gratitude Journal｜A Gentle Practice for Peaceful Nights",
      description: "睡前五分鐘的感恩練習，讓你收回一天的焦慮，帶著平靜入眠。",
      image: "🪞"
    },
    {
      path: "/blog/morning-affirmations",
      title: "🌸 清晨自我肯定語｜讓一天從自信開始",
      subtitle: "Morning Affirmations｜Begin Your Day with Confidence",
      description: "每天早晨三句肯定語，讓你以自信與平靜迎接新的一天。",
      image: "🌸"
    },
    {
      path: "/blog/power-of-silence",
      title: "🕯️ 安靜的力量｜如何用沉默恢復專注與能量",
      subtitle: "The Power of Silence｜How Stillness Restores Focus and Energy",
      description: "用三分鐘的安靜，讓思緒重整、能量回流，專注從沉默開始。",
      image: "🕯️"
    },
    {
      path: "/blog/three-minute-meditation",
      title: "🪷 靜心三分鐘｜快速轉換心情的冥想法",
      subtitle: "3-Minute Mind Reset｜Quick Meditation for Emotional Balance",
      description: "三分鐘冥想練習，讓你在繁忙生活中重新找到呼吸與平靜。",
      image: "🪷"
    },
    {
      path: "/blog/about-spiritual-growth",
      title: "🌿 心靈成長專欄｜在專注與放鬆之間，找回生活的平衡",
      subtitle: "Spiritual Growth Journal｜Finding Balance Between Focus and Calm",
      description: "從混亂到平靜，這個專欄陪你一起練習專注、呼吸與自我成長。",
      image: "🌿"
    }
  ];

  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <div className="max-w-4xl w-full">
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              📚 專注力教學文章
            </h1>
            <Link 
              to="/"
              className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-medium !text-white"
            >
              回首頁
            </Link>
          </div>
          <p className="text-gray-600 text-center mb-6">
            Focus & Mindfulness Articles
          </p>
          <p className="text-center text-gray-700">
            這些文章將幫助你學會運用番茄鐘、專注訓練與唸經修行來提升工作效能與內在平靜。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.path}
              to={article.path}
              className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300 block"
            >
              <div className="text-4xl mb-4 text-center">{article.image}</div>
              <h2 className="text-xl font-bold mb-3 text-gray-800">
                {article.title}
              </h2>
              <p className="text-sm text-gray-600 mb-3 italic">
                {article.subtitle}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {article.description}
              </p>
              <div className="mt-4 text-blue-600 font-semibold text-center">
                閱讀全文 →
              </div>
            </Link>
          ))}
        </div>

        {/* 健康專欄 */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            🩺 健康生活專欄
          </h2>
          <p className="text-gray-600 mb-6">
            探討日常保健、飲食習慣與身心平衡的實用建議，幫助你從生活細節提升健康力。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">
                😴 睡眠力回春｜每天多睡一小時，健康財富都變好
              </h3>
              <p className="text-sm text-gray-500 mb-2">2025-11-04</p>
              <p className="text-gray-700 mb-3">
                每天多睡一小時，讓身心修復、提升免疫力，同時改善決策力與生活品質。
              </p>
              <Link to="/health/sleep-balance-2025" className="text-blue-600 font-medium">
                閱讀更多 →
              </Link>
            </div>

            <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">
                🍎 飲食覺察｜從三餐開始打造心理健康
              </h3>
              <p className="text-sm text-gray-500 mb-2">2025-11-04</p>
              <p className="text-gray-700 mb-3">
                從飲食習慣出發，重建心理平衡與能量。地中海飲食有助穩定情緒、減少焦慮。
              </p>
              <Link to="/health/diet-mind-2025" className="text-blue-600 font-medium">
                閱讀更多 →
              </Link>
            </div>
          </div>
        </section>

        {/* 理財專欄 */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            💰 理財與健康平衡專欄
          </h2>
          <p className="text-gray-600 mb-6">
            收錄最新健康理財文章，讓你同時兼顧身心安定與財務自由。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">
                💖 身心平衡理財術｜讓健康與財務穩定同行
              </h3>
              <p className="text-sm text-gray-500 mb-2">2025-11-04</p>
              <p className="text-gray-700 mb-3">
                健康與理財並非衝突，而是相互支撐的關係。從飲食、運動到預算規劃，打造穩定的人生結構。
              </p>
              <Link to="/finance/health-balance-2025" className="text-blue-600 font-medium">
                閱讀更多 →
              </Link>
            </div>

            <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">
                🧘‍♀️ 退休健康金三角｜醫療、儲蓄與生活品質兼顧
              </h3>
              <p className="text-sm text-gray-500 mb-2">2025-11-04</p>
              <p className="text-gray-700 mb-3">
                從醫療保險到生活品質，建立退休後的健康金三角，讓身心與財務皆能長期穩定。
              </p>
              <Link to="/finance/retire-plan-2025" className="text-blue-600 font-medium">
                閱讀更多 →
              </Link>
            </div>
          </div>
        </section>

        <div className="flex justify-center mt-8 mb-4">
          <RSSButton />
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>所有文章由 RxV 夢想創作工作室撰寫 · 保留所有權利</p>
        </div>
      </div>
    </div>
  );
}


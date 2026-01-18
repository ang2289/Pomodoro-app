import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../../components/SEO'

interface Article {
  path: string
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  category: string
  categoryEn?: string
  date: string
  image: string
}

export default function BlogPage() {
  const { i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState<'zh-TW' | 'en'>(i18n.language as 'zh-TW' | 'en')

  const changeLanguage = (lang: 'zh-TW' | 'en') => {
    i18n.changeLanguage(lang)
    setCurrentLang(lang)
  }

  // 獲取今天的日期（格式：YYYY-MM-DD）
  const today = new Date().toISOString().split('T')[0];

  // 整合所有文章（最新 → 最舊）
  const allArticles: Article[] = [
    // 政策白話解釋文章
    {
      path: '/blog/income-tax-exemption-explained',
      title: '為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？',
      titleEn: 'Why Do Some People Not Pay Income Tax? How Is the Tax Exemption Threshold Calculated?',
      description: '所得稅免稅門檻完整解析：用生活情境說明為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思，以及一般家庭最容易誤會的地方。',
      descriptionEn: 'Complete guide to income tax exemption threshold: Real-life scenarios explaining why some people don\'t pay income tax, what tax exemptions and deductions mean in practice, and common misunderstandings among families.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💰',
    },
    {
      path: '/blog/subsidy-visibility-explained',
      title: '政府補助為什麼常常看不到？不是沒有，是你不在適用對象',
      titleEn: 'Why Are Government Subsidies Often Invisible? They Exist, But You\'re Not in the Target Group',
      description: '政府補助可見性完整解析：用白話方式說明補助為什麼不是「全民型」，常見被排除的幾種身分情境，以及一般人該如何正確理解補助存在的方式。',
      descriptionEn: 'Complete guide to subsidy visibility: Plain language explanation of why subsidies are not "universal", common excluded identity scenarios, and how ordinary people should correctly understand how subsidies exist.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💰',
    },
    {
      path: '/blog/overtime-pay-explained',
      title: '加班費一定要給嗎？為什麼很多人其實拿不到？',
      titleEn: 'Must Overtime Pay Be Given? Why Do Many People Actually Not Receive It?',
      description: '加班費制度完整解析：用白話方式說明加班費制度存在的原意，為什麼實務上常常拿不到，以及上班族最容易誤解的地方。',
      descriptionEn: 'Complete guide to overtime pay system: Plain language explanation of the original intent of the overtime pay system, why it\'s often not received in practice, and common misunderstandings among office workers.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '⏰',
    },
    {
      path: '/blog/dependent-deduction-explained',
      title: '扶養父母真的可以少繳稅嗎？很多人其實報錯了',
      titleEn: 'Can Supporting Parents Really Reduce Your Tax? Many People Actually File Incorrectly',
      description: '扶養扣除額完整解析：用生活案例說明扶養在制度上的真正意思，為什麼不是有給錢就算，以及一般家庭該有的正確認知。',
      descriptionEn: 'Complete guide to dependent deduction: Real-life cases explaining what dependent support truly means in the system, why giving money doesn\'t automatically count, and correct understanding for families.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '👨‍👩‍👧',
    },
    {
      path: '/blog/policy-design-reality-explained',
      title: '為什麼政策看起來對你好，實際卻無感？制度設計的現實原因',
      titleEn: 'Why Do Policies Seem Good for You But Feel Meaningless in Reality? The Real Reasons Behind System Design',
      description: '政策設計現實解析：用白話方式說明政策設計的取捨邏輯，為什麼不可能人人都直接受惠，以及一般民眾該怎麼看政策比較不焦慮。',
      descriptionEn: 'Guide to policy design reality: Plain language explanation of the trade-off logic in policy design, why not everyone can directly benefit, and how ordinary people should view policies to reduce anxiety.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '🤔',
    },
    {
      path: '/blog/nhi-premium-explained',
      title: '健保費是怎麼算的？為什麼每個人繳的不一樣？',
      titleEn: 'How Is NHI Premium Calculated? Why Does Everyone Pay Differently?',
      description: '健保費完整解析：用白話方式說明健保費的計算基礎，薪資、眷屬與補充保費的差別，以及一般人最常誤會的地方。',
      descriptionEn: 'Complete guide to NHI premium: Plain language explanation of how NHI premium is calculated, the differences between salary, dependents, and supplementary premium, and common misunderstandings.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '🏥',
    },
    {
      path: '/blog/unemployment-benefit-explained',
      title: '失業給付是什麼？非自願離職一定領得到嗎？',
      titleEn: 'What Is Unemployment Benefit? Can You Always Get It If You Are Involuntarily Terminated?',
      description: '失業給付完整解析：用實際情境說明什麼是失業給付，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到。',
      descriptionEn: 'Complete guide to unemployment benefits: Real-world scenarios explaining what unemployment benefits are, why involuntary termination is required, and why many people think they can get it but cannot.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💼',
    },
    {
      path: '/blog/labor-pension-new-system-explained',
      title: '勞退新制是什麼？雇主提撥的錢真的都給你嗎？',
      titleEn: 'What Is the New Labor Pension System? Does the Employer\'s Contribution Really All Go to You?',
      description: '勞退新制完整解析：用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異，6% 提撥實際怎麼運作，以及一般人最容易誤解的地方。',
      descriptionEn: 'Complete guide to the new labor pension system: Explained in terms office workers can understand about the core differences between new and old systems, how the 6% contribution actually works, and common misunderstandings.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💰',
    },
    {
      path: '/blog/household-registration-explained',
      title: '戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？',
      titleEn: 'Does Moving Household Registration Matter? Why Do So Many Subsidies Depend on Registration?',
      description: '戶籍制度完整解析：用白話方式說明戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區。',
      descriptionEn: 'Complete guide to household registration: Plain language explanation of the actual uses of household registration in policy, why subsidies often depend on registration, and common pitfalls for renters.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '📋',
    },
    {
      path: '/blog/government-announcement-impact-explained',
      title: '政府公告一定會影響你嗎？哪些政策其實跟多數人無關？',
      titleEn: 'Will Government Announcements Always Affect You? Which Policies Actually Have Nothing to Do with Most People?',
      description: '政府公告影響解析：用白話方式說明為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」，以及一般民眾該怎麼判斷要不要關心。',
      descriptionEn: 'Guide to government announcement impact: Plain language explanation of why there are so many government announcements, which are "informational" vs "impactful", and how ordinary people should decide whether to care.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '📢',
    },
    {
      path: '/blog/labor-insurance-pension-explained',
      title: '勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點',
      titleEn: 'What Is Labor Insurance Pension? Under What Circumstances Can You Receive It? Common Mistakes Everyone Makes',
      description: '勞保年金完整解析：用白話方式說明勞保年金與一次領的差別，什麼情況才能請領，以及一般人最容易搞錯的重點，包括年資、年齡、金額等常見誤解。',
      descriptionEn: 'Complete guide to labor insurance pension: Plain language explanation of the difference between monthly pension and lump sum payment, eligibility conditions, and common mistakes including years of service, age, and amount misconceptions.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💼',
    },
    {
      path: '/blog/long-term-care-subsidy-explained',
      title: '長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？',
      titleEn: 'What Is Long-Term Care Subsidy? How Much Can the Government Actually Help When Someone at Home Needs It?',
      description: '長照補助完整解析：用一般家庭能理解的方式說明長照補助在補什麼，哪些人比較容易符合，以及為什麼很多家庭一開始都不知道能申請。',
      descriptionEn: 'Complete guide to long-term care subsidies: Explained in terms families can understand about what long-term care subsidies cover, who is more likely to qualify, and why many families don\'t know they can apply initially.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '👵',
    },
    {
      path: '/blog/college-entrance-exam-explained',
      title: '大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？',
      titleEn: 'What Does the College Entrance Exam Test? How Is the System Designed? How Does It Differ from the Old Joint Exam?',
      description: '大學學測完整解析：用一般家庭能理解的方式說明為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方。',
      descriptionEn: 'Complete guide to college entrance exams: Explained in terms families can understand about why the exam system exists, how exam scores are used, and common misunderstandings among parents and students.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '📚',
    },
    {
      path: '/blog/hsr-booking-system-explained',
      title: '高鐵訂票為什麼這麼難？售票制度是怎麼設計的？',
      titleEn: 'Why Is HSR Booking So Difficult? How Is the Ticketing System Designed?',
      description: '高鐵訂票制度完整解析：用白話方式說明為什麼一開賣就容易滿，系統怎麼分配座位，以及為什麼不是先來先得這麼簡單。',
      descriptionEn: 'Complete guide to HSR booking system: Plain language explanation of why tickets sell out quickly, how the system allocates seats, and why it\'s not as simple as first-come-first-served.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '🚄',
    },
    {
      path: '/blog/minimum-wage-impact-explained',
      title: '基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？',
      titleEn: 'What Is Minimum Wage? Why Do Some People Get Raises While Others Have a Harder Time After Adjustment?',
      description: '基本工資調整影響完整解析：用白話方式說明基本工資的設計目的，調整後對不同身分的實際影響，以及為什麼不是所有人都直接受惠。',
      descriptionEn: 'Complete guide to minimum wage adjustment impact: Plain language explanation of the design purpose of minimum wage, actual impact on different groups after adjustment, and why not everyone directly benefits.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💰',
    },
    {
      path: '/blog/income-tax-brackets-explained',
      title: '所得稅級距是什麼？為什麼加薪反而繳更多稅？一次白話說清楚',
      titleEn: 'What Are Income Tax Brackets? Why Do You Pay More Tax After a Raise? Plain Language Explanation',
      description: '所得稅級距完整解析：用白話方式解釋什麼是所得稅級距，為什麼不是全部收入都用最高稅率，以及一般上班族最常誤解的地方。',
      descriptionEn: 'Complete guide to income tax brackets: Plain language explanation of what income tax brackets are, why not all income uses the highest rate, and common misconceptions among office workers.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💰',
    },
    {
      path: '/blog/minimum-wage-explained',
      title: '什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？',
      titleEn: 'What Is Minimum Wage? What Impact Will Employers and Employees Face After Adjustment?',
      description: '基本工資完整解析：了解基本工資的定義、為什麼每年會調整，以及對月薪制、時薪制的實際差異，用一般上班族看得懂的方式說明。',
      descriptionEn: 'Complete guide to minimum wage: Understand the definition of minimum wage, why it is adjusted annually, and the actual differences for monthly and hourly wage systems, explained in terms office workers can understand.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '💼',
    },
    {
      path: '/blog/labor-insurance-explained',
      title: '勞保是什麼？你每個月繳的錢到底保障了哪些事情？',
      titleEn: 'What Is Labor Insurance? What Does the Money You Pay Each Month Actually Cover?',
      description: '勞保完整解析：了解勞保在保什麼，包括生病、失能、退休各怎麼用，以及為什麼很多人快退休才發現不夠，用白話方式一次澄清常見迷思。',
      descriptionEn: 'Complete guide to labor insurance: Understand what labor insurance covers, including how to use it for illness, disability, and retirement, and why many people discover it\'s not enough near retirement. Plain language clarification of common misconceptions.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '🛡️',
    },
    {
      path: '/blog/cheng-li-chun-policy-role-explained',
      title: '為什麼新聞一直提到鄭麗君？她在政策裡扮演什麼角色？跟一般人有關嗎？',
      titleEn: 'Why Is Cheng Li-chun Frequently Mentioned in News? What Role Does She Play in Policy? Does It Matter to Ordinary People?',
      description: '鄭麗君政策角色完整解析：了解鄭麗君在政策制定與執行中的角色定位，以及這些政策對一般民眾的實際影響。',
      descriptionEn: 'Complete guide to Cheng Li-chun\'s policy role: Understand her role in policy formulation and implementation, and the actual impact of these policies on ordinary people.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: today,
      image: '👤',
    },
    {
      path: '/blog/taiwan-us-tariff-explained',
      title: '為什麼最近一直在談台美關稅？跟你我有什麼關係？',
      titleEn: 'Why Is Taiwan-US Tariff Frequently Discussed? What Does It Have to Do with You and Me?',
      description: '台美關稅完整解析：整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異，並加入常見誤解 Q&A，幫助讀者快速判斷這是不是需要關注的議題。',
      descriptionEn: 'Complete guide to Taiwan-US tariffs: Understand why "Taiwan-US tariffs" frequently appear in recent news, learn the differences in relevance for government, industries, and ordinary people, and get answers to common misconceptions to quickly determine if this is an issue worth your attention.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: '2026-01-20',
      image: '🇺🇸',
    },
    {
      path: '/blog/tariff-adjustment-impact',
      title: '關稅調整會影響哪些東西？一般人會被影響嗎？',
      titleEn: 'What Will Be Affected by Tariff Adjustments? Will Ordinary People Be Impacted?',
      description: '關稅調整完整解析：了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等，用一般人能懂的方式說明對生活的實際影響。',
      descriptionEn: 'Complete guide to tariff adjustments: Learn what items may be affected by tariff adjustments, including import product prices, cars, home appliances, and daily necessities. Explained in plain language about the actual impact on daily life.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: '2026-01-19',
      image: '💼',
    },
    {
      path: '/blog/232-clause-explained',
      title: '232 條款是什麼？為什麼台灣一直被提到？一次白話解釋',
      titleEn: 'What is Section 232? Why is Taiwan Frequently Mentioned? Plain Language Explanation',
      description: '232 條款完整解析：了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及。用一般人能懂的方式說明對生活的影響。',
      descriptionEn: 'Complete guide to Section 232: Learn what Section 232 is, why it relates to national security and import tariffs, and why Taiwan is frequently mentioned. Explained in plain language about its impact on daily life.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: '2026-01-18',
      image: '📜',
    },
    {
      path: '/blog/subsidy-eligibility-explained',
      title: '政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件',
      titleEn: 'How to Determine Government Subsidy Eligibility? Why Others Can Get It But You Cannot? Complete Guide to Key Conditions',
      description: '政府補助完整解析：了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件，快速判斷自己是否符合補助資格。',
      descriptionEn: 'Complete guide to government subsidies: Learn the key eligibility criteria including identity, income, residence, and usage conditions to quickly determine if you qualify.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: '2026-01-17',
      image: '💰',
    },
    {
      path: '/blog/house-tax-explained',
      title: '房屋稅是什麼？自住、出租、空屋差在哪？一般人一定要懂的重點整理',
      titleEn: 'What is House Tax? Differences Between Owner-Occupied, Rental, and Vacant Properties - Essential Guide',
      description: '房屋稅完整解析：了解自住、出租、空屋在房屋稅認定與稅率上的差異，以及一般房屋持有者需要知道的重點。',
      descriptionEn: 'Complete guide to house tax: Learn the differences in tax assessment and rates for owner-occupied, rental, and vacant properties, and key points property owners need to know.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: '2026-01-16',
      image: '🏠',
    },
    {
      path: '/blog/car-import-tariff-explained',
      title: '汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）',
      titleEn: 'What is Car Import Tariff? Does It Affect Car Prices? Essential Guide for Everyone (2026 Latest)',
      description: '汽車關稅完整解析：了解進口車關稅如何計算、對車價的影響，以及一般消費者需要知道的重點。',
      descriptionEn: 'Complete guide to car import tariffs: Learn how import car tariffs are calculated, their impact on car prices, and key points consumers need to know.',
      category: '政策白話解釋',
      categoryEn: 'Policy Explained',
      date: '2026-01-15',
      image: '🚗',
    },
    // 專注力文章
    {
      path: '/blog/pomodoro-focus',
      title: '如何用番茄鐘提升專注與靜心力',
      titleEn: 'How to Use the Pomodoro Method to Enhance Focus and Mindfulness',
      description: '學習如何運用番茄鐘專注法來提升工作效能，並培養內心的平靜與覺察力。',
      descriptionEn: 'Learn how to use the Pomodoro technique to improve work efficiency and cultivate inner peace and awareness.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-15',
      image: '🕒',
    },
    {
      path: '/blog/chant-focus',
      title: '唸經與專注力訓練｜讓心更靜、念更定',
      titleEn: 'Chanting and Focus Training – A Practice to Calm the Mind and Strengthen Concentration',
      description: '將專注力訓練法與唸經修行結合，幫助你在誦經時維持內心穩定。',
      descriptionEn: 'Combine focus training with chanting practice to help maintain inner stability during recitation.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-14',
      image: '🪷',
    },
    {
      path: '/blog/morning-meditation',
      title: '清晨靜坐法｜如何開啟充滿能量的一天',
      titleEn: 'Morning Meditation: The Art of Starting a Mindful and Energized Day',
      description: '學習如何在早晨醒來後運用 10-15 分鐘靜坐，讓身心重啟並充滿能量。',
      descriptionEn: 'Learn how to use 10-15 minutes of meditation after waking up to restart your body and mind with energy.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-13',
      image: '🌞',
    },
    {
      path: '/blog/focus-reset',
      title: '專注力重啟術｜5 分鐘讓大腦回到最佳狀態',
      titleEn: 'Focus Reset Technique: Recharge Your Brain in 5 Minutes',
      description: '學會五分鐘專注力重啟術，結合番茄鐘節奏，讓大腦重新充電、找回效率與平靜。',
      descriptionEn: 'Learn a 5-minute focus reset technique that combines with Pomodoro rhythm to recharge your brain and restore efficiency and calm.',
      category: '專注力',
      categoryEn: 'Focus',
      date: '2025-01-12',
      image: '🔥',
    },
    // 健康文章
    {
      path: '/health/sleep-balance-2025',
      title: '睡眠力回春｜每天多睡一小時，健康財富都變好',
      titleEn: 'Sleep Power Rejuvenation: One Extra Hour Daily Improves Health and Wealth',
      description: '每天多睡一小時，讓身心修復、提升免疫力，同時改善決策力與生活品質。',
      descriptionEn: 'One extra hour of sleep daily helps body and mind recover, boosts immunity, and improves decision-making and quality of life.',
      category: '健康',
      categoryEn: 'Health',
      date: '2025-01-11',
      image: '😴',
    },
    {
      path: '/health/diet-mind-2025',
      title: '飲食覺察｜從三餐開始打造心理健康',
      titleEn: 'Dietary Awareness: Building Mental Health Through Three Meals',
      description: '從飲食習慣出發，重建心理平衡與能量。地中海飲食有助穩定情緒、減少焦慮。',
      descriptionEn: 'Start from dietary habits to rebuild psychological balance and energy. Mediterranean diet helps stabilize emotions and reduce anxiety.',
      category: '健康',
      categoryEn: 'Health',
      date: '2025-01-10',
      image: '🍎',
    },
    // 理財文章
    {
      path: '/finance/health-balance-2025',
      title: '身心平衡理財術｜讓健康與財務穩定同行',
      titleEn: 'Mind-Body Balance Financial Strategy: Health and Financial Stability Together',
      description: '健康與理財並非衝突，而是相互支撐的關係。從飲食、運動到預算規劃，打造穩定的人生結構。',
      descriptionEn: 'Health and finance are not conflicting but mutually supportive. From diet and exercise to budget planning, build a stable life structure.',
      category: '理財',
      categoryEn: 'Finance',
      date: '2025-01-09',
      image: '💖',
    },
    {
      path: '/finance/retire-plan-2025',
      title: '退休健康金三角｜醫療、儲蓄與生活品質兼顧',
      titleEn: 'Retirement Health Triangle: Medical, Savings and Quality of Life',
      description: '從醫療保險到生活品質，建立退休後的健康金三角，讓身心與財務皆能長期穩定。',
      descriptionEn: 'From health insurance to quality of life, build a retirement health triangle for long-term stability of body, mind and finances.',
      category: '理財',
      categoryEn: 'Finance',
      date: '2025-01-08',
      image: '🧘‍♀️',
    },
    {
      path: '/finance/anti-fraud-2025',
      title: '反詐騙指南｜保護你的財務安全',
      titleEn: 'Anti-Fraud Guide: Protect Your Financial Security',
      description: '認識常見詐騙手法，學習如何保護個人財務安全，避免成為詐騙受害者。',
      descriptionEn: 'Learn about common fraud tactics and how to protect your personal financial security to avoid becoming a fraud victim.',
      category: '理財',
      categoryEn: 'Finance',
      date: '2025-01-07',
      image: '🛡️',
    },
  ]

  // 依日期排序（最新 → 最舊）
  const sortedArticles = [...allArticles].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const content = {
    'zh-TW': {
      title: '文章專區（Blog）',
      subtitle: '每週更新 AI 工具、健康、補助與生活文章。提升 SEO，自然流量成長。',
      readMore: '閱讀更多',
      category: '分類',
      date: '日期',
      backToHome: '返回首頁',
    },
    en: {
      title: 'Blog Articles',
      subtitle: 'Weekly updates on AI tools, health, subsidies and lifestyle articles. Boost SEO and grow organic traffic.',
      readMore: 'Read More',
      category: 'Category',
      date: 'Date',
      backToHome: 'Back to Home',
    },
  }

  const currentContent = content[currentLang]

  return (
    <>
      <SEO
        title={`${currentContent.title} — Weekly Articles on AI Tools, Health & Finance`}
        description={currentContent.subtitle}
        keywords="blog, articles, AI tools, health, finance, lifestyle, SEO"
        url="https://pomodoro-app-eight-rouge.vercel.app/blog"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 pb-24">
        {/* 語系切換按鈕 */}
        <div className="flex justify-end mb-6 gap-2">
          <button
            onClick={() => changeLanguage('zh-TW')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentLang === 'zh-TW'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            繁體中文
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              currentLang === 'en'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            English
          </button>
        </div>

        {/* 標題 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-4">
          {currentContent.title}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {currentContent.subtitle}
        </p>

        {/* 文章列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedArticles.map((article) => (
            <Link
              key={article.path}
              to={article.path}
              className="group bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-4 text-center">{article.image}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                  {currentLang === 'zh-TW' ? article.category : (article.categoryEn || article.category)}
                </span>
                <span className="text-xs text-gray-500">
                  {article.date}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {currentLang === 'zh-TW' ? article.title : (article.titleEn || article.title)}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                {currentLang === 'zh-TW' ? article.description : (article.descriptionEn || article.description)}
              </p>
              <div className="text-blue-600 font-semibold text-sm text-center group-hover:text-blue-700 transition-colors">
                {currentContent.readMore} →
              </div>
            </Link>
          ))}
        </div>

        {/* 🛍 文章首頁中的「好物推薦專區」 */}
        <section className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-bold mb-4">🛒 好物推薦專區</h2>
          <p className="text-gray-600 mb-6">每篇都有導購影片＋懶人介紹文＋Shopee 分潤連結</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link 
              to="/goods/airfryer-keshaui" 
              className="block border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <img 
                src="/assets/airfryer-keshaui-cover.png" 
                alt="氣炸鍋封面" 
                className="w-full rounded mb-2 object-cover"
              />
              <h3 className="font-semibold text-lg">科帥氣炸鍋推薦</h3>
              <p className="text-sm text-gray-500">附影片｜限時送清潔泡泡＋12 件烘焙組</p>
            </Link>
          </div>

          <div className="mt-4 text-right">
            <Link to="/goods" className="text-blue-600 hover:underline">
              👉 看更多好物推薦文章
            </Link>
          </div>
        </section>

        {/* 返回首頁 */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {currentContent.backToHome}
          </Link>
        </div>
      </main>
    </>
  )
}





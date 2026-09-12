/**
 * 詐騙風險判斷器（純前端，無 API 呼叫）
 * 使用關鍵字/句型/連結/規則計分
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ScamResult {
  score: number;
  level: RiskLevel;
  reasons: string[];
  tips: string[];
  matched: string[];
}

// 短網址網域（合併為單一 regex）
const SHORT_URL_REGEX = /bit\.ly|t\.co|tinyurl|reurl\.cc|pse\.is|shorturl|ow\.ly|is\.gd|buff\.ly|adf\.ly|tr\.im/i;

// 規則：{ pattern: RegExp | string, points: number, reason: string, matchKey: string }
const RULES: Array<{
  pattern: RegExp | string;
  points: number;
  reason: string;
  matchKey: string;
}> = [
  // 連結與短網址
  { pattern: /https?:\/\//i, points: 8, reason: '含有 http/https 連結', matchKey: 'link_http' },
  { pattern: /www\./i, points: 5, reason: '含有 www 網址', matchKey: 'link_www' },
  { pattern: SHORT_URL_REGEX, points: 12, reason: '含有短網址', matchKey: 'shorturl' },

  // 金融字眼
  { pattern: /匯款|轉帳|atm/i, points: 10, reason: '提及匯款/轉帳/ATM', matchKey: 'finance_transfer' },
  { pattern: /解鎖|解除|分期|分期付款/i, points: 12, reason: '提及解除分期/解鎖', matchKey: 'finance_unlock' },
  { pattern: /保證金|刷流水|刷單/i, points: 14, reason: '提及保證金/刷流水', matchKey: 'finance_deposit' },
  { pattern: /保證獲利|內部消息|內線/i, points: 14, reason: '提及保證獲利/內部消息', matchKey: 'finance_profit' },
  { pattern: /投資|高報酬|穩賺/i, points: 10, reason: '投資/高報酬話術', matchKey: 'finance_invest' },
  { pattern: /限時|名額有限|立刻|今天截止|馬上行動/i, points: 8, reason: '製造限時緊迫感', matchKey: 'finance_urgent' },

  // 威嚇/緊迫
  { pattern: /帳號停用|帳戶異常|違規/i, points: 12, reason: '宣稱帳號/帳戶異常', matchKey: 'threat_account' },
  { pattern: /法律責任|警方|法院|傳票|偵辦/i, points: 12, reason: '宣稱法律/警方/法院', matchKey: 'threat_legal' },
  { pattern: /立即|馬上|盡快|緊急/i, points: 5, reason: '緊急催促用語', matchKey: 'urgent' },

  // 客服/官方話術
  { pattern: /客服|線上客服|專員為您服務/i, points: 6, reason: '透過訊息要求聯繫客服（建議改用官方管道）', matchKey: 'fake_support' },
  { pattern: /請撥打|請點擊|請登入/i, points: 6, reason: '要求撥打/點擊/登入', matchKey: 'action_request' },

  // 個資/驗證
  { pattern: /otp|驗證碼|簡訊碼|動態密碼/i, points: 14, reason: '要求 OTP/驗證碼', matchKey: 'otp' },
  { pattern: /銀行卡|cvv|安全碼|背面三碼/i, points: 14, reason: '要求銀行卡/安全碼', matchKey: 'card_info' },
  { pattern: /身分證|帳密|密碼|登入密碼/i, points: 10, reason: '要求身分證/帳密', matchKey: 'identity' },

  // 誘導行動
  { pattern: /加(line|賴)|加入line|加我(line|賴)/i, points: 8, reason: '誘導加 LINE', matchKey: 'add_line' },
  { pattern: /下載(app|應用程式)|安裝app/i, points: 10, reason: '誘導下載 APP', matchKey: 'download_app' },
  { pattern: /點(擊|選)?(連結|網址|連結)/i, points: 10, reason: '誘導點擊連結', matchKey: 'click_link' },

  // 包裹/中獎
  { pattern: /海外包裹|未領包裹|您的包裹/i, points: 10, reason: '包裹未領/海外包裹相關話術（常見風險特徵）', matchKey: 'parcel' },
  { pattern: /中獎|恭喜您|您獲選|得獎/i, points: 8, reason: '中獎/獲選話術（常見風險特徵）', matchKey: 'prize' },
];

const TIPS_BY_LEVEL: Record<RiskLevel, string[]> = {
  LOW: [
    '此內容風險較低，但仍請勿點擊不明連結、勿提供 OTP 或個人資料。',
    '若有疑慮，請撥打 165 反詐騙專線，或改用官網/官方客服查證。',
  ],
  MEDIUM: [
    '此內容可能具詐騙風險，建議提高警覺。',
    '請勿點擊任何連結、勿提供 OTP、驗證碼、銀行卡資訊。',
    '請改用官網或官方客服查證，或撥打 165 反詐騙專線。',
  ],
  HIGH: [
    '此內容具高詐騙風險，請勿點擊任何連結、勿提供任何資訊。',
    '切勿提供 OTP、驗證碼、身分證、銀行卡、帳密。',
    '請勿透過訊息內連結操作，改上官網或撥打 165 反詐騙專線查證。',
  ],
};

export function analyzeScam(text: string): ScamResult {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return {
      score: 0,
      level: 'LOW',
      reasons: [],
      tips: TIPS_BY_LEVEL.LOW,
      matched: [],
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const matched: string[] = [];

  for (const rule of RULES) {
    const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
    if (regex.test(trimmed)) {
      score += rule.points;
      if (!reasons.includes(rule.reason)) {
        reasons.push(rule.reason);
      }
      if (!matched.includes(rule.matchKey)) {
        matched.push(rule.matchKey);
      }
    }
  }

  score = Math.min(100, score);

  let level: RiskLevel;
  if (score <= 29) level = 'LOW';
  else if (score <= 59) level = 'MEDIUM';
  else level = 'HIGH';

  return {
    score,
    level,
    reasons,
    tips: TIPS_BY_LEVEL[level],
    matched,
  };
}

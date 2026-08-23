# RxV 專案 i18n 硬編碼文字掃描報告

掃描範圍：`src/pages`、`src/components`、`src/layouts`。專案中**無** `src/layout`、`src/features`、`src/modules` 目錄，故未掃描。

方法：啟發式偵測（1）單行 JSX 子節點 `>文字<`；（2）`title` / `description` / `placeholder` / `alt` / `aria-label` / `label` 等字串屬性；（3）`<SEO />` 區塊內之 title、description、keywords。**已含 `t(` 的列會略過**。單行超過 220 字元之列不列入 JSX 掃描（長段落可能未完全列出）。

## 1. 摘要統計

| 項目 | 數量 |
| --- | ---:|
| 推估未使用 `t()` 的命中筆數 | **2242** |

### 依類型（kind）

| kind | 筆數 |
| --- | ---:|
| `jsx-text` | 1639 |
| `jsx-text-en` | 247 |
| `attr:title` | 98 |
| `attr:description` | 54 |
| `seo-title` | 53 |
| `seo-description` | 53 |
| `seo-keywords` | 53 |
| `attr:placeholder` | 26 |
| `attr:alt` | 9 |
| `attr:aria-label` | 8 |
| `attr:label` | 2 |

### 依區塊（bucket）

| bucket | 說明 | 筆數 |
| --- | --- | ---:|
| `blog` | 部落格／政策長文頁 | 1348 |
| `section-page` | 工具／補助／財經等區塊頁 | 428 |
| `pages-other` | 其餘頁面 | 363 |
| `components` | 共用元件 | 98 |
| `home` | 首頁 index | 5 |

## 2. 命中最多的檔案（Top 25）

| 筆數 | 檔案 |
| ---:| --- |
| 63 | `src/pages/tools/QrCodeTool.tsx` |
| 43 | `src/pages/help/index.tsx` |
| 41 | `src/pages/PricingPage.tsx` |
| 39 | `src/pages/blog/line-delete-photos-videos-safe.tsx` |
| 38 | `src/pages/blog/tariff-adjustment-impact.tsx` |
| 38 | `src/pages/tools/ai-summary.tsx` |
| 38 | `src/pages/tools/ImageToVideo.tsx` |
| 37 | `src/pages/tools/ImageCompress.tsx` |
| 35 | `src/pages/blog/government-announcement-impact-explained.tsx` |
| 35 | `src/pages/blog/labor-pension-new-system-explained.tsx` |
| 35 | `src/pages/tools/ImageResize--old.tsx` |
| 33 | `src/pages/blog/ai-free-tools-2026.tsx` |
| 33 | `src/pages/blog/household-registration-explained.tsx` |
| 33 | `src/pages/blog/line-sticker-outsourcing-guide.tsx` |
| 31 | `src/pages/blog/labor-insurance-pension-explained.tsx` |
| 31 | `src/pages/blog/unemployment-benefit-explained.tsx` |
| 30 | `src/pages/blog/ai-summary-guide.tsx` |
| 30 | `src/pages/blog/homework-helper-guide.tsx` |
| 30 | `src/pages/blog/overtime-pay-explained.tsx` |
| 29 | `src/pages/blog/labor-insurance-explained.tsx` |
| 29 | `src/pages/blog/qr-code-generator.tsx` |
| 29 | `src/pages/blog/taiwan-us-tariff-explained.tsx` |
| 28 | `src/pages/blog/minimum-wage-explained.tsx` |
| 28 | `src/pages/blog/minimum-wage-impact-explained.tsx` |
| 28 | `src/pages/tools/ImageResize.tsx` |

## 3. 哪些頁面「英文 UI」覆蓋較不足？

以下為 **部落格 bucket** 命中數較高之檔案（內文多為中文硬編碼；切換 `en-US` 時常仍顯示中文）：

| 筆數 | 檔案 |
| ---:| --- |
| 39 | `src/pages/blog/line-delete-photos-videos-safe.tsx` |
| 38 | `src/pages/blog/tariff-adjustment-impact.tsx` |
| 35 | `src/pages/blog/government-announcement-impact-explained.tsx` |
| 35 | `src/pages/blog/labor-pension-new-system-explained.tsx` |
| 33 | `src/pages/blog/ai-free-tools-2026.tsx` |
| 33 | `src/pages/blog/household-registration-explained.tsx` |
| 33 | `src/pages/blog/line-sticker-outsourcing-guide.tsx` |
| 31 | `src/pages/blog/labor-insurance-pension-explained.tsx` |
| 31 | `src/pages/blog/unemployment-benefit-explained.tsx` |
| 30 | `src/pages/blog/ai-summary-guide.tsx` |
| 30 | `src/pages/blog/homework-helper-guide.tsx` |
| 30 | `src/pages/blog/overtime-pay-explained.tsx` |
| 29 | `src/pages/blog/labor-insurance-explained.tsx` |
| 29 | `src/pages/blog/qr-code-generator.tsx` |
| 29 | `src/pages/blog/taiwan-us-tariff-explained.tsx` |
| 28 | `src/pages/blog/minimum-wage-explained.tsx` |
| 28 | `src/pages/blog/minimum-wage-impact-explained.tsx` |
| 27 | `src/pages/blog/long-term-care-subsidy-explained.tsx` |
| 27 | `src/pages/blog/MorningAffirmations.tsx` |
| 27 | `src/pages/blog/nhi-premium-explained.tsx` |
| 26 | `src/pages/blog/free-ai-tools.tsx` |
| 26 | `src/pages/blog/hsr-booking-system-explained.tsx` |
| 26 | `src/pages/blog/policy-design-reality-explained.tsx` |
| 26 | `src/pages/blog/subsidy-visibility-explained.tsx` |
| 25 | `src/pages/blog/ThreeMinuteMeditation.tsx` |

**工具／定價／說明頁**若命中多，代表按鈕、小標、SEO 等仍有硬編碼，建議優先導入 `t()` 或依語系分支。

## 4. SEO / meta / FAQ 相關

- `seo-title`：53 筆（多為 `<SEO title="..." />` 硬編碼）
- `seo-description`：53 筆
- `seo-keywords`：53 筆

多數頁面 **title / description 未綁 i18n**，切換語言時 HTML `<title>` 與 meta 可能仍為中文（若專案未另做 Helmet 語系切換）。FAQ 區塊若為長段落，可能因單行長度被略掃；請以手動搜尋 `FAQ` / 中文補強。

## 5. Navigation / Button

導航列若已使用 `t(nav_*)` 則不會出現在本報告。本報告中的 `jsx-text` / `attr:label` 多為頁面內按鈕、小標、卡片標題等。

---

## 6. 明細（依檔案分組）

### `src/pages/tools/QrCodeTool.tsx`（63 筆）

- **Line:** 542
  - **Kind:** `seo-title`
  - **Original:** "QR Code 產生器｜網址、WiFi、Email 與 Logo｜RxV"
  - **Suggested key:** `tools.QrCodeTool.qr_code_產生器_網址_wifi_email_與_logo_rxv`

- **Line:** 542
  - **Kind:** `seo-description`
  - **Original:** "線上產生 QR Code：網址、文字、郵件、電話與 WiFi；可調顏色、尺寸並嵌入 Logo。瀏覽器即可用，下載 PNG／SVG。"
  - **Suggested key:** `tools.QrCodeTool.線上產生_qr_code_網址_文字_郵件_電話與_wifi_可調顏色`

- **Line:** 542
  - **Kind:** `seo-keywords`
  - **Original:** "QR Code 產生器, WiFi QR, 網址 QR, 免費工具"
  - **Suggested key:** `tools.QrCodeTool.qr_code_產生器_wifi_qr_網址_qr_免費工具`

- **Line:** 534
  - **Kind:** `attr:title`
  - **Original:** "QR Code 預覽"
  - **Suggested key:** `tools.QrCodeTool.qr_code_預覽`

- **Line:** 543
  - **Kind:** `attr:title`
  - **Original:** "QR Code 產生器｜網址、WiFi、Email 與 Logo｜RxV"
  - **Suggested key:** `tools.QrCodeTool.qr_code_產生器_網址_wifi_email_與_logo_rxv`

- **Line:** 544
  - **Kind:** `attr:description`
  - **Original:** "線上產生 QR Code：網址、文字、郵件、電話與 WiFi；可調顏色、尺寸並嵌入 Logo。瀏覽器即可用，下載 PNG／SVG。"
  - **Suggested key:** `tools.QrCodeTool.線上產生_qr_code_網址_文字_郵件_電話與_wifi_可調顏色`

- **Line:** 557
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 產生器（免費）｜AI工具推薦"
  - **Suggested key:** `tools.QrCodeTool.qr_code_產生器_免費_ai工具推薦`

- **Line:** 558
  - **Kind:** `jsx-text`
  - **Original:** "這是一款免費QR Code 產生器，可用於將網址、文字與聯絡資訊快速轉成可掃描內容，支援線上使用，不需下載，快速完成任務。"
  - **Suggested key:** `tools.QrCodeTool.這是一款免費qr_code_產生器_可用於將網址_文字與聯絡資訊快速轉成`

- **Line:** 560
  - **Kind:** `jsx-text`
  - **Original:** "適合誰用："
  - **Suggested key:** `tools.QrCodeTool.適合誰用`

- **Line:** 564
  - **Kind:** `jsx-text`
  - **Original:** "常見情境："
  - **Suggested key:** `tools.QrCodeTool.常見情境`

- **Line:** 568
  - **Kind:** `jsx-text`
  - **Original:** "推薦搭配："
  - **Suggested key:** `tools.QrCodeTool.推薦搭配`

- **Line:** 596
  - **Kind:** `jsx-text`
  - **Original:** "內容"
  - **Suggested key:** `tools.QrCodeTool.內容`

- **Line:** 631
  - **Kind:** `jsx-text`
  - **Original:** "留空時顯示範例網址"
  - **Suggested key:** `tools.QrCodeTool.留空時顯示範例網址`

- **Line:** 645
  - **Kind:** `attr:placeholder`
  - **Original:** "輸入任意文字…"
  - **Suggested key:** `tools.QrCodeTool.輸入任意文字`

- **Line:** 648
  - **Kind:** `jsx-text`
  - **Original:** "留空時顯示預設提示文字"
  - **Suggested key:** `tools.QrCodeTool.留空時顯示預設提示文字`

- **Line:** 666
  - **Kind:** `jsx-text`
  - **Original:** "將編碼為 mailto:（留空顯示範例）"
  - **Suggested key:** `tools.QrCodeTool.將編碼為_mailto_留空顯示範例`

- **Line:** 684
  - **Kind:** `jsx-text`
  - **Original:** "將編碼為 tel:（可含國碼 +）"
  - **Suggested key:** `tools.QrCodeTool.將編碼為_tel_可含國碼`

- **Line:** 729
  - **Kind:** `attr:placeholder`
  - **Original:** "WiFi 密碼"
  - **Suggested key:** `tools.QrCodeTool.wifi_密碼`

- **Line:** 752
  - **Kind:** `jsx-text`
  - **Original:** "短網址產生失敗"
  - **Suggested key:** `tools.QrCodeTool.短網址產生失敗`

- **Line:** 765
  - **Kind:** `jsx-text`
  - **Original:** "已產生短網址"
  - **Suggested key:** `tools.QrCodeTool.已產生短網址`

- **Line:** 793
  - **Kind:** `jsx-text`
  - **Original:** "一鍵套用模板"
  - **Suggested key:** `tools.QrCodeTool.一鍵套用模板`

- **Line:** 794
  - **Kind:** `jsx-text`
  - **Original:** "快速建立常見商業情境的 QR Code 內容與配色"
  - **Suggested key:** `tools.QrCodeTool.快速建立常見商業情境的_qr_code_內容與配色`

- **Line:** 828
  - **Kind:** `jsx-text`
  - **Original:** "顏色"
  - **Suggested key:** `tools.QrCodeTool.顏色`

- **Line:** 830
  - **Kind:** `jsx-text`
  - **Original:** "QR 樣式模板"
  - **Suggested key:** `tools.QrCodeTool.qr_樣式模板`

- **Line:** 853
  - **Kind:** `attr:aria-label`
  - **Original:** "前景色"
  - **Suggested key:** `tools.QrCodeTool.前景色`

- **Line:** 881
  - **Kind:** `attr:aria-label`
  - **Original:** "背景色"
  - **Suggested key:** `tools.QrCodeTool.背景色`

- **Line:** 903
  - **Kind:** `jsx-text`
  - **Original:** "社群尺寸"
  - **Suggested key:** `tools.QrCodeTool.社群尺寸`

- **Line:** 914
  - **Kind:** `jsx-text`
  - **Original:** "輸出尺寸（像素）"
  - **Suggested key:** `tools.QrCodeTool.輸出尺寸_像素`

- **Line:** 934
  - **Kind:** `jsx-text`
  - **Original:** "中央 Logo（選填）"
  - **Suggested key:** `tools.QrCodeTool.中央_logo_選填`

- **Line:** 969
  - **Kind:** `jsx-text`
  - **Original:** "QR 預覽"
  - **Suggested key:** `tools.QrCodeTool.qr_預覽`

- **Line:** 987
  - **Kind:** `jsx-text`
  - **Original:** "掃描測試"
  - **Suggested key:** `tools.QrCodeTool.掃描測試`

- **Line:** 1000
  - **Kind:** `jsx-text`
  - **Original:** "模擬手機掃描效果"
  - **Suggested key:** `tools.QrCodeTool.模擬手機掃描效果`

- **Line:** 1021
  - **Kind:** `jsx-text`
  - **Original:** "目前為預設範例內容，開始輸入後會即時更新"
  - **Suggested key:** `tools.QrCodeTool.目前為預設範例內容_開始輸入後會即時更新`

- **Line:** 1097
  - **Kind:** `jsx-text`
  - **Original:** "如何使用此工具？"
  - **Suggested key:** `tools.QrCodeTool.如何使用此工具`

- **Line:** 1102
  - **Kind:** `jsx-text`
  - **Original:** "使用步驟"
  - **Suggested key:** `tools.QrCodeTool.使用步驟`

- **Line:** 1104
  - **Kind:** `jsx-text`
  - **Original:** "輸入網址或文字"
  - **Suggested key:** `tools.QrCodeTool.輸入網址或文字`

- **Line:** 1105
  - **Kind:** `jsx-text`
  - **Original:** "自訂 QR Code 內容"
  - **Suggested key:** `tools.QrCodeTool.自訂_qr_code_內容`

- **Line:** 1106
  - **Kind:** `jsx-text`
  - **Original:** "下載圖片"
  - **Suggested key:** `tools.QrCodeTool.下載圖片`

- **Line:** 1109
  - **Kind:** `jsx-text`
  - **Original:** "適合使用情境"
  - **Suggested key:** `tools.QrCodeTool.適合使用情境`

- **Line:** 1111
  - **Kind:** `jsx-text`
  - **Original:** "活動海報"
  - **Suggested key:** `tools.QrCodeTool.活動海報`

- **Line:** 1112
  - **Kind:** `jsx-text`
  - **Original:** "菜單 QR"
  - **Suggested key:** `tools.QrCodeTool.菜單_qr`

- **Line:** 1113
  - **Kind:** `jsx-text`
  - **Original:** "社群分享"
  - **Suggested key:** `tools.QrCodeTool.社群分享`

- **Line:** 1118
  - **Kind:** `jsx-text`
  - **Original:** "免費 QR Code 產生器"
  - **Suggested key:** `tools.QrCodeTool.免費_qr_code_產生器`

- **Line:** 1121
  - **Kind:** `jsx-text`
  - **Original:** "什麼是 QR Code？"
  - **Suggested key:** `tools.QrCodeTool.什麼是_qr_code`

- **Line:** 1128
  - **Kind:** `jsx-text`
  - **Original:** "常見問題"
  - **Suggested key:** `tools.QrCodeTool.常見問題`

- **Line:** 1131
  - **Kind:** `jsx-text`
  - **Original:** "Q：QR Code 可以商業使用嗎？"
  - **Suggested key:** `tools.QrCodeTool.q_qr_code_可以商業使用嗎`

- **Line:** 1132
  - **Kind:** `jsx-text`
  - **Original:** "A：本工具生成的 QR Code 可自由使用。"
  - **Suggested key:** `tools.QrCodeTool.a_本工具生成的_qr_code_可自由使用`

- **Line:** 1135
  - **Kind:** `jsx-text`
  - **Original:** "Q：可以下載高畫質嗎？"
  - **Suggested key:** `tools.QrCodeTool.q_可以下載高畫質嗎`

- **Line:** 1136
  - **Kind:** `jsx-text`
  - **Original:** "A：支援 128～1024 像素與 SVG 格式。"
  - **Suggested key:** `tools.QrCodeTool.a_支援_128_1024_像素與_svg_格式`

- **Line:** 1142
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 怎麼製作？"
  - **Suggested key:** `tools.QrCodeTool.qr_code_怎麼製作`

- **Line:** 1143
  - **Kind:** `jsx-text`
  - **Original:** "輸入網址或文字後即可自動生成，並可自訂顏色、尺寸與 Logo 後下載使用。"
  - **Suggested key:** `tools.QrCodeTool.輸入網址或文字後即可自動生成_並可自訂顏色_尺寸與_logo_後下載使用`

- **Line:** 1147
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 可以放 Logo 嗎？"
  - **Suggested key:** `tools.QrCodeTool.qr_code_可以放_logo_嗎`

- **Line:** 1148
  - **Kind:** `jsx-text`
  - **Original:** "可以，但需保持高對比與足夠留白，避免影響掃描成功率。"
  - **Suggested key:** `tools.QrCodeTool.可以_但需保持高對比與足夠留白_避免影響掃描成功率`

- **Line:** 1152
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 掃描失敗原因"
  - **Suggested key:** `tools.QrCodeTool.qr_code_掃描失敗原因`

- **Line:** 1154
  - **Kind:** `jsx-text`
  - **Original:** "顏色對比過低"
  - **Suggested key:** `tools.QrCodeTool.顏色對比過低`

- **Line:** 1155
  - **Kind:** `jsx-text`
  - **Original:** "尺寸過小"
  - **Suggested key:** `tools.QrCodeTool.尺寸過小`

- **Line:** 1156
  - **Kind:** `jsx-text`
  - **Original:** "中間 Logo 過大"
  - **Suggested key:** `tools.QrCodeTool.中間_logo_過大`

- **Line:** 1162
  - **Kind:** `jsx-text`
  - **Original:** "什麼是QR Code 產生器？"
  - **Suggested key:** `tools.QrCodeTool.什麼是qr_code_產生器`

- **Line:** 1167
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.QrCodeTool.為什麼使用這個工具`

- **Line:** 1169
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.QrCodeTool.免費使用`

- **Line:** 1170
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.QrCodeTool.不需安裝`

- **Line:** 1171
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.QrCodeTool.支援快速處理`

- **Line:** 1174
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `tools.QrCodeTool.相關工具`

### `src/pages/help/index.tsx`（43 筆）

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "免費試用"
  - **Suggested key:** `help.index.免費試用`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "新用戶註冊後即可獲得"
  - **Suggested key:** `help.index.新用戶註冊後即可獲得`

- **Line:** 84
  - **Kind:** `jsx-text`
  - **Original:** "試用期為"
  - **Suggested key:** `help.index.試用期為`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "試用期過後，點數仍可使用，但無法再補充試用額度"
  - **Suggested key:** `help.index.試用期過後_點數仍可使用_但無法再補充試用額度`

- **Line:** 86
  - **Kind:** `jsx-text`
  - **Original:** "試用額度與付費點數共用，使用時會優先扣除試用額度"
  - **Suggested key:** `help.index.試用額度與付費點數共用_使用時會優先扣除試用額度`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "登入方式"
  - **Suggested key:** `help.index.登入方式`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "支援 Email 註冊與登入"
  - **Suggested key:** `help.index.支援_email_註冊與登入`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "登入後即可開始使用所有功能"
  - **Suggested key:** `help.index.登入後即可開始使用所有功能`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "💡 提示："
  - **Suggested key:** `help.index.提示`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "計算原則"
  - **Suggested key:** `help.index.計算原則`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "系統會依"
  - **Suggested key:** `help.index.系統會依`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "每次使用 AI 功能時，會即時扣除對應點數"
  - **Suggested key:** `help.index.每次使用_ai_功能時_會即時扣除對應點數`

- **Line:** 116
  - **Kind:** `jsx-text`
  - **Original:** "點數不足時無法使用功能，需補充點數後才能繼續使用"
  - **Suggested key:** `help.index.點數不足時無法使用功能_需補充點數後才能繼續使用`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "範例說明"
  - **Suggested key:** `help.index.範例說明`

- **Line:** 125
  - **Kind:** `jsx-text`
  - **Original:** "輸入 2,500 字文章進行摘要 → 扣除"
  - **Suggested key:** `help.index.輸入_2_500_字文章進行摘要_扣除`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "輸入 300 字題目進行解題 → 扣除"
  - **Suggested key:** `help.index.輸入_300_字題目進行解題_扣除`

- **Line:** 133
  - **Kind:** `jsx-text`
  - **Original:** "輸入 1,000 字內容進行分析 → 扣除"
  - **Suggested key:** `help.index.輸入_1_000_字內容進行分析_扣除`

- **Line:** 140
  - **Kind:** `jsx-text`
  - **Original:** "⚠️ 注意："
  - **Suggested key:** `help.index.注意`

- **Line:** 154
  - **Kind:** `jsx-text`
  - **Original:** "點數購買與補充流程"
  - **Suggested key:** `help.index.點數購買與補充流程`

- **Line:** 155
  - **Kind:** `jsx-text`
  - **Original:** "目前支援以下付款方式（透過綠界金流）："
  - **Suggested key:** `help.index.目前支援以下付款方式_透過綠界金流`

- **Line:** 157
  - **Kind:** `jsx-text`
  - **Original:** "信用卡付款"
  - **Suggested key:** `help.index.信用卡付款`

- **Line:** 158
  - **Kind:** `jsx-text`
  - **Original:** "ATM 虛擬帳號轉帳"
  - **Suggested key:** `help.index.atm_虛擬帳號轉帳`

- **Line:** 163
  - **Kind:** `jsx-text`
  - **Original:** "補點流程說明"
  - **Suggested key:** `help.index.補點流程說明`

- **Line:** 165
  - **Kind:** `jsx-text`
  - **Original:** "選擇你想購買的點數方案"
  - **Suggested key:** `help.index.選擇你想購買的點數方案`

- **Line:** 166
  - **Kind:** `jsx-text`
  - **Original:** "透過綠界付款（信用卡或 ATM 虛擬帳號）"
  - **Suggested key:** `help.index.透過綠界付款_信用卡或_atm_虛擬帳號`

- **Line:** 167
  - **Kind:** `jsx-text`
  - **Original:** "付款成功後，系統會自動加點並 Email 通知"
  - **Suggested key:** `help.index.付款成功後_系統會自動加點並_email_通知`

- **Line:** 168
  - **Kind:** `jsx-text`
  - **Original:** "無需填寫表單，最快幾秒內自動完成"
  - **Suggested key:** `help.index.無需填寫表單_最快幾秒內自動完成`

- **Line:** 173
  - **Kind:** `jsx-text`
  - **Original:** "點數方案參考"
  - **Suggested key:** `help.index.點數方案參考`

- **Line:** 175
  - **Kind:** `jsx-text`
  - **Original:** "NT$99 → 100,000 點（約 30～35 次摘要）"
  - **Suggested key:** `help.index.nt_99_100_000_點_約_30_35_次摘要`

- **Line:** 176
  - **Kind:** `jsx-text`
  - **Original:** "NT$199 → 300,000 點（約 90～100 次摘要）"
  - **Suggested key:** `help.index.nt_199_300_000_點_約_90_100_次摘要`

- **Line:** 181
  - **Kind:** `jsx-text`
  - **Original:** "常見問題 Q&amp;A"
  - **Suggested key:** `help.index.常見問題_q_amp_a`

- **Line:** 184
  - **Kind:** `jsx-text`
  - **Original:** "Q: 付款後多久會補點？"
  - **Suggested key:** `help.index.q_付款後多久會補點`

- **Line:** 185
  - **Kind:** `jsx-text`
  - **Original:** "A: 一般會在 5～10 秒內完成補點，並收到 Email 通知。"
  - **Suggested key:** `help.index.a_一般會在_5_10_秒內完成補點_並收到_email_通知`

- **Line:** 188
  - **Kind:** `jsx-text`
  - **Original:** "Q: 點數有使用期限嗎？"
  - **Suggested key:** `help.index.q_點數有使用期限嗎`

- **Line:** 189
  - **Kind:** `jsx-text`
  - **Original:** "A: 沒有。點數為一次性額度，不限時間，用完為止。"
  - **Suggested key:** `help.index.a_沒有_點數為一次性額度_不限時間_用完為止`

- **Line:** 192
  - **Kind:** `jsx-text`
  - **Original:** "Q: 可以退款嗎？"
  - **Suggested key:** `help.index.q_可以退款嗎`

- **Line:** 193
  - **Kind:** `jsx-text`
  - **Original:** "A: 點數使用後即視為完成服務，恕不退款。未用完點數可永久保留。"
  - **Suggested key:** `help.index.a_點數使用後即視為完成服務_恕不退款_未用完點數可永久保留`

- **Line:** 196
  - **Kind:** `jsx-text`
  - **Original:** "Q: 點數可以轉讓嗎？"
  - **Suggested key:** `help.index.q_點數可以轉讓嗎`

- **Line:** 197
  - **Kind:** `jsx-text`
  - **Original:** "A: 不可。每筆點數與帳號綁定，不可轉讓或轉移。"
  - **Suggested key:** `help.index.a_不可_每筆點數與帳號綁定_不可轉讓或轉移`

- **Line:** 204
  - **Kind:** `jsx-text`
  - **Original:** "⚠️ 提醒事項："
  - **Suggested key:** `help.index.提醒事項`

- **Line:** 207
  - **Kind:** `jsx-text`
  - **Original:** "使用前請先登入帳號"
  - **Suggested key:** `help.index.使用前請先登入帳號`

- **Line:** 208
  - **Kind:** `jsx-text`
  - **Original:** "點數為一次性使用，不限時間但無法退款"
  - **Suggested key:** `help.index.點數為一次性使用_不限時間但無法退款`

- **Line:** 209
  - **Kind:** `jsx-text`
  - **Original:** "若需大量點數購買或企業合作，請來信聯絡"
  - **Suggested key:** `help.index.若需大量點數購買或企業合作_請來信聯絡`

### `src/pages/PricingPage.tsx`（41 筆）

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "繁體中文"
  - **Suggested key:** `pages.PricingPage.繁體中文`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "免費體驗"
  - **Suggested key:** `pages.PricingPage.免費體驗`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "不需信用卡"
  - **Suggested key:** `pages.PricingPage.不需信用卡`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "不限使用期限"
  - **Suggested key:** `pages.PricingPage.不限使用期限`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "摘要與作業解題共用"
  - **Suggested key:** `pages.PricingPage.摘要與作業解題共用`

- **Line:** 109
  - **Kind:** `jsx-text`
  - **Original:** "一次購買"
  - **Suggested key:** `pages.PricingPage.一次購買`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "不自動續費"
  - **Suggested key:** `pages.PricingPage.不自動續費`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "不限使用期限"
  - **Suggested key:** `pages.PricingPage.不限使用期限`

- **Line:** 141
  - **Kind:** `jsx-text`
  - **Original:** "一次購買"
  - **Suggested key:** `pages.PricingPage.一次購買`

- **Line:** 142
  - **Kind:** `jsx-text`
  - **Original:** "不自動續費"
  - **Suggested key:** `pages.PricingPage.不自動續費`

- **Line:** 143
  - **Kind:** `jsx-text`
  - **Original:** "不限使用期限"
  - **Suggested key:** `pages.PricingPage.不限使用期限`

- **Line:** 162
  - **Kind:** `attr:title`
  - **Original:** "使用說明"
  - **Suggested key:** `pages.PricingPage.使用說明`

- **Line:** 166
  - **Kind:** `jsx-text`
  - **Original:** "🎁 新用戶免費體驗額度"
  - **Suggested key:** `pages.PricingPage.新用戶免費體驗額度`

- **Line:** 173
  - **Kind:** `jsx-text`
  - **Original:** "💳 付費使用方案"
  - **Suggested key:** `pages.PricingPage.付費使用方案`

- **Line:** 175
  - **Kind:** `jsx-text`
  - **Original:** "NT$99 方案："
  - **Suggested key:** `pages.PricingPage.nt_99_方案`

- **Line:** 176
  - **Kind:** `jsx-text`
  - **Original:** "NT$199 方案："
  - **Suggested key:** `pages.PricingPage.nt_199_方案`

- **Line:** 181
  - **Kind:** `jsx-text`
  - **Original:** "📌 使用額度計算說明"
  - **Suggested key:** `pages.PricingPage.使用額度計算說明`

- **Line:** 189
  - **Kind:** `jsx-text`
  - **Original:** "重要說明："
  - **Suggested key:** `pages.PricingPage.重要說明`

- **Line:** 197
  - **Kind:** `attr:title`
  - **Original:** "📊 字數如何計算？"
  - **Suggested key:** `pages.PricingPage.字數如何計算`

- **Line:** 201
  - **Kind:** `jsx-text`
  - **Original:** "系統會依照你實際送出與產生的文字數量累計"
  - **Suggested key:** `pages.PricingPage.系統會依照你實際送出與產生的文字數量累計`

- **Line:** 202
  - **Kind:** `jsx-text`
  - **Original:** "使用中可即時查看「已使用」與「剩餘可用」"
  - **Suggested key:** `pages.PricingPage.使用中可即時查看_已使用_與_剩餘可用`

- **Line:** 203
  - **Kind:** `jsx-text`
  - **Original:** "使用額度用完後，服務將暫停，需再次購買使用方案才能繼續使用"
  - **Suggested key:** `pages.PricingPage.使用額度用完後_服務將暫停_需再次購買使用方案才能繼續使用`

- **Line:** 210
  - **Kind:** `attr:title`
  - **Original:** "📌 字數計算方式說明"
  - **Suggested key:** `pages.PricingPage.字數計算方式說明`

- **Line:** 218
  - **Kind:** `jsx-text`
  - **Original:** "範例說明："
  - **Suggested key:** `pages.PricingPage.範例說明`

- **Line:** 220
  - **Kind:** `jsx-text`
  - **Original:** "輸入 2,500 字文章摘要 → 使用 2,500 字"
  - **Suggested key:** `pages.PricingPage.輸入_2_500_字文章摘要_使用_2_500_字`

- **Line:** 221
  - **Kind:** `jsx-text`
  - **Original:** "解題輸入 300 字題目 → 使用 300 字"
  - **Suggested key:** `pages.PricingPage.解題輸入_300_字題目_使用_300_字`

- **Line:** 233
  - **Kind:** `attr:title`
  - **Original:** "🔒 使用與公平性說明"
  - **Suggested key:** `pages.PricingPage.使用與公平性說明`

- **Line:** 237
  - **Kind:** `jsx-text`
  - **Original:** "為維持服務品質，系統會進行合理的資源控管"
  - **Suggested key:** `pages.PricingPage.為維持服務品質_系統會進行合理的資源控管`

- **Line:** 238
  - **Kind:** `jsx-text`
  - **Original:** "異常或非一般使用行為，可能會受到限制"
  - **Suggested key:** `pages.PricingPage.異常或非一般使用行為_可能會受到限制`

- **Line:** 239
  - **Kind:** `jsx-text`
  - **Original:** "所有方案之實際使用狀況，以系統顯示為準"
  - **Suggested key:** `pages.PricingPage.所有方案之實際使用狀況_以系統顯示為準`

- **Line:** 251
  - **Kind:** `jsx-text-en`
  - **Original:** "No expiration date"
  - **Suggested key:** `pages.PricingPage.no_expiration_date`

- **Line:** 252
  - **Kind:** `jsx-text-en`
  - **Original:** "Shared usage limit for summary and homework"
  - **Suggested key:** `pages.PricingPage.shared_usage_limit_for_summary_and_h`

- **Line:** 262
  - **Kind:** `jsx-text-en`
  - **Original:** "No expiration date"
  - **Suggested key:** `pages.PricingPage.no_expiration_date`

- **Line:** 263
  - **Kind:** `jsx-text-en`
  - **Original:** "No auto-renewal"
  - **Suggested key:** `pages.PricingPage.no_auto_renewal`

- **Line:** 264
  - **Kind:** `jsx-text-en`
  - **Original:** "Purchase again when used up"
  - **Suggested key:** `pages.PricingPage.purchase_again_when_used_up`

- **Line:** 284
  - **Kind:** `jsx-text-en`
  - **Original:** "No expiration date"
  - **Suggested key:** `pages.PricingPage.no_expiration_date`

- **Line:** 285
  - **Kind:** `jsx-text-en`
  - **Original:** "No auto-renewal"
  - **Suggested key:** `pages.PricingPage.no_auto_renewal`

- **Line:** 286
  - **Kind:** `jsx-text-en`
  - **Original:** "Purchase again when used up"
  - **Suggested key:** `pages.PricingPage.purchase_again_when_used_up`

- **Line:** 315
  - **Kind:** `jsx-text`
  - **Original:** "範例說明："
  - **Suggested key:** `pages.PricingPage.範例說明`

- **Line:** 317
  - **Kind:** `jsx-text`
  - **Original:** "輸入 2,500 字文章摘要 → 使用 2,500 字"
  - **Suggested key:** `pages.PricingPage.輸入_2_500_字文章摘要_使用_2_500_字`

- **Line:** 318
  - **Kind:** `jsx-text`
  - **Original:** "解題輸入 300 字題目 → 使用 300 字"
  - **Suggested key:** `pages.PricingPage.解題輸入_300_字題目_使用_300_字`

### `src/pages/blog/line-delete-photos-videos-safe.tsx`（39 筆）

- **Line:** 11
  - **Kind:** `seo-title`
  - **Original:** "LINE 圖片/影片怎麼安全刪除？清空間、換手機、隱私保護一次搞懂"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.line_圖片_影片怎麼安全刪除_清空間_換手機_隱私保護一次搞懂`

- **Line:** 11
  - **Kind:** `seo-description`
  - **Original:** "多數人想刪的是 LINE 圖片和影片。本篇整理：聊天室刪除、快取清理、下載資料夾與相簿處理、備份注意事項，以及什麼情況需要更徹底的清除。"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.多數人想刪的是_line_圖片和影片_本篇整理_聊天室刪除_快取清理_下`

- **Line:** 11
  - **Kind:** `seo-keywords`
  - **Original:** "LINE 刪除圖片, LINE 刪除影片, LINE 清除快取, LINE 釋放空間, LINE 換手機, LINE 隱私"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.line_刪除圖片_line_刪除影片_line_清除快取_lin`

- **Line:** 12
  - **Kind:** `attr:title`
  - **Original:** "LINE 圖片/影片怎麼安全刪除？清空間、換手機、隱私保護一次搞懂"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.line_圖片_影片怎麼安全刪除_清空間_換手機_隱私保護一次搞懂`

- **Line:** 13
  - **Kind:** `attr:description`
  - **Original:** "多數人想刪的是 LINE 圖片和影片。本篇整理：聊天室刪除、快取清理、下載資料夾與相簿處理、備份注意事項，以及什麼情況需要更徹底的清除。"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.多數人想刪的是_line_圖片和影片_本篇整理_聊天室刪除_快取清理_下`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "LINE 圖片/影片怎麼安全刪除？清空間、換手機、隱私保護一次搞懂"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.line_圖片_影片怎麼安全刪除_清空間_換手機_隱私保護一次搞懂`

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "更新日期：2026-03-04"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.更新日期_2026_03_04`

- **Line:** 33
  - **Kind:** `jsx-text`
  - **Original:** "圖片與影片"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.圖片與影片`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "先選你的目的：你是想「省空間」還是「保隱私」？"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.先選你的目的_你是想_省空間_還是_保隱私`

- **Line:** 39
  - **Kind:** `jsx-text`
  - **Original:** "省空間（一般）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.省空間_一般`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "保隱私（高需求）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.保隱私_高需求`

- **Line:** 43
  - **Kind:** `jsx-text`
  - **Original:** "方法 1：在聊天室刪除圖片/影片（最直覺）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.方法_1_在聊天室刪除圖片_影片_最直覺`

- **Line:** 45
  - **Kind:** `jsx-text`
  - **Original:** "進入對應聊天室 → 找到圖片/影片"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.進入對應聊天室_找到圖片_影片`

- **Line:** 46
  - **Kind:** `jsx-text`
  - **Original:** "長按 → 選擇「刪除」"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.長按_選擇_刪除`

- **Line:** 47
  - **Kind:** `jsx-text`
  - **Original:** "若有「相簿/記事本」也請一併檢查是否有同檔案"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.若有_相簿_記事本_也請一併檢查是否有同檔案`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "你的畫面/你的裝置"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.你的畫面_你的裝置`

- **Line:** 53
  - **Kind:** `jsx-text`
  - **Original:** "方法 2：清除快取（最有效釋放空間）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.方法_2_清除快取_最有效釋放空間`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "很多人刪了圖片還是沒空間，其實是因為 LINE 快取仍占用大量容量。"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.很多人刪了圖片還是沒空間_其實是因為_line_快取仍占用大量容量`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "LINE → 設定 → 聊天（或儲存空間/資料）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.line_設定_聊天_或儲存空間_資料`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "找到「清除快取」"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.找到_清除快取`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "清完後重開 LINE"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.清完後重開_line`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "方法 3：處理下載資料夾/相簿（很多人漏掉）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.方法_3_處理下載資料夾_相簿_很多人漏掉`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "Android：檔案管理 → Downloads / Pictures / LINE（依機型不同）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.android_檔案管理_downloads_pictures`

- **Line:** 68
  - **Kind:** `jsx-text`
  - **Original:** "iPhone：照片 App、檔案 App（下載/儲存位置）"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.iphone_照片_app_檔案_app_下載_儲存位置`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "方法 4：換手機前的「最安全流程」"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.方法_4_換手機前的_最安全流程`

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "先備份"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.先備份`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "再清理"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.再清理`

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "最後處理舊機"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.最後處理舊機`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "什麼情況需要更徹底的清除？"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.什麼情況需要更徹底的清除`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "二手轉讓手機、公司交接手機"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.二手轉讓手機_公司交接手機`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "涉及私密照片/影片，擔心殘留被復原"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.涉及私密照片_影片_擔心殘留被復原`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "你不確定是否同步到雲端/其他裝置"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.你不確定是否同步到雲端_其他裝置`

- **Line:** 136
  - **Kind:** `jsx-text`
  - **Original:** "常見 Q&A"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.常見_q_a`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "刪除後對方還看得到嗎？"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.刪除後對方還看得到嗎`

- **Line:** 138
  - **Kind:** `jsx-text`
  - **Original:** "多數情況下，對方若已下載或已快取，對方端仍可能保留。你能控制的是自己的裝置與帳號資料。"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.多數情況下_對方若已下載或已快取_對方端仍可能保留_你能控制的是自己的裝`

- **Line:** 140
  - **Kind:** `jsx-text`
  - **Original:** "刪掉圖片為什麼空間沒回來？"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.刪掉圖片為什麼空間沒回來`

- **Line:** 141
  - **Kind:** `jsx-text`
  - **Original:** "常見原因是快取與下載資料夾仍有檔案。建議優先做「清快取」與「清下載資料夾」。"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.常見原因是快取與下載資料夾仍有檔案_建議優先做_清快取_與_清下載資料夾`

- **Line:** 143
  - **Kind:** `jsx-text`
  - **Original:** "我只想快速清空間，最有效是哪個？"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.我只想快速清空間_最有效是哪個`

- **Line:** 144
  - **Kind:** `jsx-text`
  - **Original:** "通常是「清除快取」最有效，其次才是逐張刪除聊天室媒體。"
  - **Suggested key:** `blog.line-delete-photos-videos-safe.通常是_清除快取_最有效_其次才是逐張刪除聊天室媒體`

### `src/pages/blog/tariff-adjustment-impact.tsx`（38 筆）

- **Line:** 9
  - **Kind:** `seo-title`
  - **Original:** "關稅調整會影響哪些東西？一般人會被影響嗎？"
  - **Suggested key:** `blog.tariff-adjustment-impact.關稅調整會影響哪些東西_一般人會被影響嗎`

- **Line:** 9
  - **Kind:** `seo-description`
  - **Original:** "關稅調整完整解析：了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等，用一般人能懂的方式說明對生活的實際影響。"
  - **Suggested key:** `blog.tariff-adjustment-impact.關稅調整完整解析_了解關稅調整可能影響的項目_包含進口商品價格_汽車_家`

- **Line:** 9
  - **Kind:** `seo-keywords`
  - **Original:** "關稅調整, 進口商品, 汽車關稅, 家電價格, 日用品價格, 政策解釋"
  - **Suggested key:** `blog.tariff-adjustment-impact.關稅調整_進口商品_汽車關稅_家電價格_日用品價格_政策解釋`

- **Line:** 10
  - **Kind:** `attr:title`
  - **Original:** "關稅調整會影響哪些東西？一般人會被影響嗎？"
  - **Suggested key:** `blog.tariff-adjustment-impact.關稅調整會影響哪些東西_一般人會被影響嗎`

- **Line:** 11
  - **Kind:** `attr:description`
  - **Original:** "關稅調整完整解析：了解關稅調整可能影響的項目，包含進口商品價格、汽車、家電、日用品等，用一般人能懂的方式說明對生活的實際影響。"
  - **Suggested key:** `blog.tariff-adjustment-impact.關稅調整完整解析_了解關稅調整可能影響的項目_包含進口商品價格_汽車_家`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "你可能會感覺到的影響"
  - **Suggested key:** `blog.tariff-adjustment-impact.你可能會感覺到的影響`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "進口商品價格上漲"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口商品價格上漲`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "進口品牌的商品變貴了"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口品牌的商品變貴了`

- **Line:** 84
  - **Kind:** `jsx-text`
  - **Original:** "原本想買的進口商品，價格超出預算"
  - **Suggested key:** `blog.tariff-adjustment-impact.原本想買的進口商品_價格超出預算`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "需要重新考慮是否購買，或尋找替代品"
  - **Suggested key:** `blog.tariff-adjustment-impact.需要重新考慮是否購買_或尋找替代品`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "汽車價格變化"
  - **Suggested key:** `blog.tariff-adjustment-impact.汽車價格變化`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "進口車的價格可能上漲"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口車的價格可能上漲`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "原本看好的車款，可能需要增加預算"
  - **Suggested key:** `blog.tariff-adjustment-impact.原本看好的車款_可能需要增加預算`

- **Line:** 95
  - **Kind:** `jsx-text`
  - **Original:** "部分車商可能會調整促銷方案或優惠"
  - **Suggested key:** `blog.tariff-adjustment-impact.部分車商可能會調整促銷方案或優惠`

- **Line:** 101
  - **Kind:** `jsx-text`
  - **Original:** "家電價格波動"
  - **Suggested key:** `blog.tariff-adjustment-impact.家電價格波動`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "進口家電品牌（如日系、韓系、歐系）的價格"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口家電品牌_如日系_韓系_歐系_的價格`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "大型家電（冰箱、洗衣機、冷氣）的購買成本"
  - **Suggested key:** `blog.tariff-adjustment-impact.大型家電_冰箱_洗衣機_冷氣_的購買成本`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "小型家電（咖啡機、吸塵器、空氣清淨機）的價格"
  - **Suggested key:** `blog.tariff-adjustment-impact.小型家電_咖啡機_吸塵器_空氣清淨機_的價格`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "日用品價格微調"
  - **Suggested key:** `blog.tariff-adjustment-impact.日用品價格微調`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "進口食品、零食、飲料"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口食品_零食_飲料`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "進口化妝品、保養品"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口化妝品_保養品`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "進口服飾、配件"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口服飾_配件`

- **Line:** 122
  - **Kind:** `jsx-text`
  - **Original:** "進口文具、生活用品"
  - **Suggested key:** `blog.tariff-adjustment-impact.進口文具_生活用品`

- **Line:** 128
  - **Kind:** `jsx-text`
  - **Original:** "你可能感覺不到的影響"
  - **Suggested key:** `blog.tariff-adjustment-impact.你可能感覺不到的影響`

- **Line:** 130
  - **Kind:** `jsx-text`
  - **Original:** "產業鏈的間接影響"
  - **Suggested key:** `blog.tariff-adjustment-impact.產業鏈的間接影響`

- **Line:** 135
  - **Kind:** `jsx-text`
  - **Original:** "相關產業的工作機會可能受到影響"
  - **Suggested key:** `blog.tariff-adjustment-impact.相關產業的工作機會可能受到影響`

- **Line:** 136
  - **Kind:** `jsx-text`
  - **Original:** "公司營運成本變化，可能影響員工福利或薪資調整"
  - **Suggested key:** `blog.tariff-adjustment-impact.公司營運成本變化_可能影響員工福利或薪資調整`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "市場競爭格局改變，長期可能影響商品選擇"
  - **Suggested key:** `blog.tariff-adjustment-impact.市場競爭格局改變_長期可能影響商品選擇`

- **Line:** 140
  - **Kind:** `jsx-text`
  - **Original:** "如果你主要使用國產商品"
  - **Suggested key:** `blog.tariff-adjustment-impact.如果你主要使用國產商品`

- **Line:** 145
  - **Kind:** `jsx-text`
  - **Original:** "國產商品的價格通常不受進口關稅影響"
  - **Suggested key:** `blog.tariff-adjustment-impact.國產商品的價格通常不受進口關稅影響`

- **Line:** 146
  - **Kind:** `jsx-text`
  - **Original:** "你的日常消費習慣可能不會有明顯變化"
  - **Suggested key:** `blog.tariff-adjustment-impact.你的日常消費習慣可能不會有明顯變化`

- **Line:** 147
  - **Kind:** `jsx-text`
  - **Original:** "但要注意，部分國產商品可能使用進口原料，間接受到影響"
  - **Suggested key:** `blog.tariff-adjustment-impact.但要注意_部分國產商品可能使用進口原料_間接受到影響`

- **Line:** 150
  - **Kind:** `jsx-text`
  - **Original:** "如何應對關稅調整的影響？"
  - **Suggested key:** `blog.tariff-adjustment-impact.如何應對關稅調整的影響`

- **Line:** 155
  - **Kind:** `jsx-text`
  - **Original:** "關注相關商品的價格變化，提前規劃大額消費"
  - **Suggested key:** `blog.tariff-adjustment-impact.關注相關商品的價格變化_提前規劃大額消費`

- **Line:** 156
  - **Kind:** `jsx-text`
  - **Original:** "比較進口與國產商品的性價比，選擇最適合自己的選項"
  - **Suggested key:** `blog.tariff-adjustment-impact.比較進口與國產商品的性價比_選擇最適合自己的選項`

- **Line:** 157
  - **Kind:** `jsx-text`
  - **Original:** "不急著購買的商品，可以觀察價格走勢再決定"
  - **Suggested key:** `blog.tariff-adjustment-impact.不急著購買的商品_可以觀察價格走勢再決定`

- **Line:** 158
  - **Kind:** `jsx-text`
  - **Original:** "了解政策動向，但不需要過度焦慮"
  - **Suggested key:** `blog.tariff-adjustment-impact.了解政策動向_但不需要過度焦慮`

- **Line:** 167
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.tariff-adjustment-impact.提醒`

### `src/pages/tools/ai-summary.tsx`（38 筆）

- **Line:** 33
  - **Kind:** `seo-title`
  - **Original:** "AI 摘要工具｜長文、筆記與 PDF 重點整理｜RxV"
  - **Suggested key:** `tools.ai-summary.ai_摘要工具_長文_筆記與_pdf_重點整理_rxv`

- **Line:** 33
  - **Kind:** `seo-description`
  - **Original:** "線上 AI 摘要：貼上長文或筆記即可產出條列重點，協助閱讀、研究與備課。免安裝，與番茄鐘、待辦搭配更易執行。"
  - **Suggested key:** `tools.ai-summary.線上_ai_摘要_貼上長文或筆記即可產出條列重點_協助閱讀_研究與備課`

- **Line:** 33
  - **Kind:** `seo-keywords`
  - **Original:** "AI 摘要, 長文整理, 筆記摘要, 免費工具"
  - **Suggested key:** `tools.ai-summary.ai_摘要_長文整理_筆記摘要_免費工具`

- **Line:** 34
  - **Kind:** `attr:title`
  - **Original:** "AI 摘要工具｜長文、筆記與 PDF 重點整理｜RxV"
  - **Suggested key:** `tools.ai-summary.ai_摘要工具_長文_筆記與_pdf_重點整理_rxv`

- **Line:** 35
  - **Kind:** `attr:description`
  - **Original:** "線上 AI 摘要：貼上長文或筆記即可產出條列重點，協助閱讀、研究與備課。免安裝，與番茄鐘、待辦搭配更易執行。"
  - **Suggested key:** `tools.ai-summary.線上_ai_摘要_貼上長文或筆記即可產出條列重點_協助閱讀_研究與備課`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "AI 摘要工具（免費）｜AI工具推薦"
  - **Suggested key:** `tools.ai-summary.ai_摘要工具_免費_ai工具推薦`

- **Line:** 53
  - **Kind:** `jsx-text`
  - **Original:** "適合誰用："
  - **Suggested key:** `tools.ai-summary.適合誰用`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "推薦搭配："
  - **Suggested key:** `tools.ai-summary.推薦搭配`

- **Line:** 88
  - **Kind:** `jsx-text-en`
  - **Original:** "Try Summary Tool"
  - **Suggested key:** `tools.ai-summary.try_summary_tool`

- **Line:** 103
  - **Kind:** `jsx-text-en`
  - **Original:** "Buy Template"
  - **Suggested key:** `tools.ai-summary.buy_template`

- **Line:** 122
  - **Kind:** `jsx-text-en`
  - **Original:** "Supabase Edge Functions:"
  - **Suggested key:** `tools.ai-summary.supabase_edge_functions`

- **Line:** 123
  - **Kind:** `jsx-text-en`
  - **Original:** "Gemini Flash 2.0:"
  - **Suggested key:** `tools.ai-summary.gemini_flash_2_0`

- **Line:** 124
  - **Kind:** `jsx-text-en`
  - **Original:** "JSON Schema:"
  - **Suggested key:** `tools.ai-summary.json_schema`

- **Line:** 125
  - **Kind:** `jsx-text-en`
  - **Original:** "React + TypeScript:"
  - **Suggested key:** `tools.ai-summary.react_typescript`

- **Line:** 132
  - **Kind:** `jsx-text-en`
  - **Original:** "Automatic Language Detection:"
  - **Suggested key:** `tools.ai-summary.automatic_language_detection`

- **Line:** 133
  - **Kind:** `jsx-text-en`
  - **Original:** "Daily Limits:"
  - **Suggested key:** `tools.ai-summary.daily_limits`

- **Line:** 134
  - **Kind:** `jsx-text-en`
  - **Original:** "Clean JSON Output:"
  - **Suggested key:** `tools.ai-summary.clean_json_output`

- **Line:** 135
  - **Kind:** `jsx-text-en`
  - **Original:** "Multiple Input Types:"
  - **Suggested key:** `tools.ai-summary.multiple_input_types`

- **Line:** 145
  - **Kind:** `jsx-text-en`
  - **Original:** "Complete Supabase Edge Function code"
  - **Suggested key:** `tools.ai-summary.complete_supabase_edge_function_code`

- **Line:** 146
  - **Kind:** `jsx-text-en`
  - **Original:** "JSON Schema definitions"
  - **Suggested key:** `tools.ai-summary.json_schema_definitions`

- **Line:** 147
  - **Kind:** `jsx-text-en`
  - **Original:** "Frontend React components"
  - **Suggested key:** `tools.ai-summary.frontend_react_components`

- **Line:** 148
  - **Kind:** `jsx-text-en`
  - **Original:** "Production-ready API setup"
  - **Suggested key:** `tools.ai-summary.production_ready_api_setup`

- **Line:** 163
  - **Kind:** `jsx-text-en`
  - **Original:** "Buy Developer Template →"
  - **Suggested key:** `tools.ai-summary.buy_developer_template`

- **Line:** 169
  - **Kind:** `jsx-text`
  - **Original:** "如何使用此工具？"
  - **Suggested key:** `tools.ai-summary.如何使用此工具`

- **Line:** 174
  - **Kind:** `jsx-text`
  - **Original:** "使用步驟"
  - **Suggested key:** `tools.ai-summary.使用步驟`

- **Line:** 176
  - **Kind:** `jsx-text`
  - **Original:** "貼上文章或影片內容"
  - **Suggested key:** `tools.ai-summary.貼上文章或影片內容`

- **Line:** 177
  - **Kind:** `jsx-text`
  - **Original:** "生成摘要"
  - **Suggested key:** `tools.ai-summary.生成摘要`

- **Line:** 178
  - **Kind:** `jsx-text`
  - **Original:** "複製或整理內容"
  - **Suggested key:** `tools.ai-summary.複製或整理內容`

- **Line:** 181
  - **Kind:** `jsx-text`
  - **Original:** "適合使用情境"
  - **Suggested key:** `tools.ai-summary.適合使用情境`

- **Line:** 183
  - **Kind:** `jsx-text`
  - **Original:** "學習筆記"
  - **Suggested key:** `tools.ai-summary.學習筆記`

- **Line:** 184
  - **Kind:** `jsx-text`
  - **Original:** "研究資料"
  - **Suggested key:** `tools.ai-summary.研究資料`

- **Line:** 185
  - **Kind:** `jsx-text`
  - **Original:** "長文章整理"
  - **Suggested key:** `tools.ai-summary.長文章整理`

- **Line:** 191
  - **Kind:** `jsx-text`
  - **Original:** "什麼是AI 摘要工具？"
  - **Suggested key:** `tools.ai-summary.什麼是ai_摘要工具`

- **Line:** 196
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.ai-summary.為什麼使用這個工具`

- **Line:** 198
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.ai-summary.免費使用`

- **Line:** 199
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.ai-summary.不需安裝`

- **Line:** 200
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.ai-summary.支援快速處理`

- **Line:** 203
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `tools.ai-summary.相關工具`

### `src/pages/tools/ImageToVideo.tsx`（38 筆）

- **Line:** 440
  - **Kind:** `seo-title`
  - **Original:** "圖片轉短影音工具｜免費圖片轉短影音工具 - RxV AI工具中心"
  - **Suggested key:** `tools.ImageToVideo.圖片轉短影音工具_免費圖片轉短影音工具_rxv_ai工具中心`

- **Line:** 440
  - **Kind:** `seo-description`
  - **Original:** "免費圖片轉短影音工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.ImageToVideo.免費圖片轉短影音工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 440
  - **Kind:** `seo-keywords`
  - **Original:** "圖片轉短影音工具, AI工具, 免費工具"
  - **Suggested key:** `tools.ImageToVideo.圖片轉短影音工具_ai工具_免費工具`

- **Line:** 441
  - **Kind:** `attr:title`
  - **Original:** "圖片轉短影音工具｜免費圖片轉短影音工具 - RxV AI工具中心"
  - **Suggested key:** `tools.ImageToVideo.圖片轉短影音工具_免費圖片轉短影音工具_rxv_ai工具中心`

- **Line:** 442
  - **Kind:** `attr:description`
  - **Original:** "免費圖片轉短影音工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.ImageToVideo.免費圖片轉短影音工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 472
  - **Kind:** `jsx-text`
  - **Original:** "目前轉很久通常是這三種原因："
  - **Suggested key:** `tools.ImageToVideo.目前轉很久通常是這三種原因`

- **Line:** 473
  - **Kind:** `jsx-text`
  - **Original:** "1. 選了 4K"
  - **Suggested key:** `tools.ImageToVideo.1_選了_4k`

- **Line:** 474
  - **Kind:** `jsx-text`
  - **Original:** "2. 選了移動圓點星光"
  - **Suggested key:** `tools.ImageToVideo.2_選了移動圓點星光`

- **Line:** 475
  - **Kind:** `jsx-text`
  - **Original:** "3. 時間太長"
  - **Suggested key:** `tools.ImageToVideo.3_時間太長`

- **Line:** 528
  - **Kind:** `jsx-text`
  - **Original:** "上傳圖片："
  - **Suggested key:** `tools.ImageToVideo.上傳圖片`

- **Line:** 581
  - **Kind:** `jsx-text`
  - **Original:** "圖片預覽"
  - **Suggested key:** `tools.ImageToVideo.圖片預覽`

- **Line:** 584
  - **Kind:** `attr:alt`
  - **Original:** "預覽"
  - **Suggested key:** `tools.ImageToVideo.預覽`

- **Line:** 605
  - **Kind:** `jsx-text`
  - **Original:** "比例："
  - **Suggested key:** `tools.ImageToVideo.比例`

- **Line:** 616
  - **Kind:** `jsx-text`
  - **Original:** "解析度："
  - **Suggested key:** `tools.ImageToVideo.解析度`

- **Line:** 628
  - **Kind:** `jsx-text`
  - **Original:** "輸出尺寸："
  - **Suggested key:** `tools.ImageToVideo.輸出尺寸`

- **Line:** 635
  - **Kind:** `jsx-text`
  - **Original:** "動態效果："
  - **Suggested key:** `tools.ImageToVideo.動態效果`

- **Line:** 646
  - **Kind:** `jsx-text`
  - **Original:** "星光效果："
  - **Suggested key:** `tools.ImageToVideo.星光效果`

- **Line:** 661
  - **Kind:** `jsx-text`
  - **Original:** "時間數值："
  - **Suggested key:** `tools.ImageToVideo.時間數值`

- **Line:** 673
  - **Kind:** `jsx-text`
  - **Original:** "時間單位："
  - **Suggested key:** `tools.ImageToVideo.時間單位`

- **Line:** 675
  - **Kind:** `jsx-text`
  - **Original:** "秒"
  - **Suggested key:** `tools.ImageToVideo.秒`

- **Line:** 676
  - **Kind:** `jsx-text`
  - **Original:** "分"
  - **Suggested key:** `tools.ImageToVideo.分`

- **Line:** 677
  - **Kind:** `jsx-text`
  - **Original:** "時"
  - **Suggested key:** `tools.ImageToVideo.時`

- **Line:** 682
  - **Kind:** `jsx-text`
  - **Original:** "送出總時間："
  - **Suggested key:** `tools.ImageToVideo.送出總時間`

- **Line:** 701
  - **Kind:** `jsx-text`
  - **Original:** "動畫速度："
  - **Suggested key:** `tools.ImageToVideo.動畫速度`

- **Line:** 714
  - **Kind:** `jsx-text`
  - **Original:** "星光強度："
  - **Suggested key:** `tools.ImageToVideo.星光強度`

- **Line:** 727
  - **Kind:** `jsx-text`
  - **Original:** "星光密度："
  - **Suggested key:** `tools.ImageToVideo.星光密度`

- **Line:** 740
  - **Kind:** `jsx-text`
  - **Original:** "圓點大小："
  - **Suggested key:** `tools.ImageToVideo.圓點大小`

- **Line:** 762
  - **Kind:** `jsx-text`
  - **Original:** "轉檔進度"
  - **Suggested key:** `tools.ImageToVideo.轉檔進度`

- **Line:** 869
  - **Kind:** `jsx-text`
  - **Original:** "輸出結果"
  - **Suggested key:** `tools.ImageToVideo.輸出結果`

- **Line:** 908
  - **Kind:** `jsx-text`
  - **Original:** "什麼是圖片轉短影音工具？"
  - **Suggested key:** `tools.ImageToVideo.什麼是圖片轉短影音工具`

- **Line:** 913
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.ImageToVideo.為什麼使用這個工具`

- **Line:** 915
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.ImageToVideo.免費使用`

- **Line:** 916
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.ImageToVideo.不需安裝`

- **Line:** 917
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.ImageToVideo.支援快速處理`

- **Line:** 920
  - **Kind:** `jsx-text`
  - **Original:** "更多相關工具"
  - **Suggested key:** `tools.ImageToVideo.更多相關工具`

- **Line:** 922
  - **Kind:** `jsx-text`
  - **Original:** "工具中心"
  - **Suggested key:** `tools.ImageToVideo.工具中心`

- **Line:** 923
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `tools.ImageToVideo.ai摘要工具`

- **Line:** 924
  - **Kind:** `jsx-text`
  - **Original:** "AI作業解題"
  - **Suggested key:** `tools.ImageToVideo.ai作業解題`

### `src/pages/tools/ImageCompress.tsx`（37 筆）

- **Line:** 359
  - **Kind:** `seo-title`
  - **Original:** "圖片壓縮工具｜免費線上壓縮 JPG、PNG、WebP"
  - **Suggested key:** `tools.ImageCompress.圖片壓縮工具_免費線上壓縮_jpg_png_webp`

- **Line:** 359
  - **Kind:** `seo-description`
  - **Original:** "免費圖片壓縮工具，支援 JPG、PNG、WebP 線上壓縮，可選輸出格式並快速縮小檔案大小，免下載即可使用。"
  - **Suggested key:** `tools.ImageCompress.免費圖片壓縮工具_支援_jpg_png_webp_線上壓縮_可選輸出格式`

- **Line:** 359
  - **Kind:** `seo-keywords`
  - **Original:** "圖片壓縮, JPG壓縮, PNG壓縮, WebP壓縮, 線上圖片壓縮, 批量圖片壓縮"
  - **Suggested key:** `tools.ImageCompress.圖片壓縮_jpg壓縮_png壓縮_webp壓縮_線上圖片壓縮`

- **Line:** 360
  - **Kind:** `attr:title`
  - **Original:** "圖片壓縮工具｜免費線上壓縮 JPG、PNG、WebP"
  - **Suggested key:** `tools.ImageCompress.圖片壓縮工具_免費線上壓縮_jpg_png_webp`

- **Line:** 361
  - **Kind:** `attr:description`
  - **Original:** "免費圖片壓縮工具，支援 JPG、PNG、WebP 線上壓縮，可選輸出格式並快速縮小檔案大小，免下載即可使用。"
  - **Suggested key:** `tools.ImageCompress.免費圖片壓縮工具_支援_jpg_png_webp_線上壓縮_可選輸出格式`

- **Line:** 397
  - **Kind:** `jsx-text`
  - **Original:** "支援拖曳上傳與多選圖片"
  - **Suggested key:** `tools.ImageCompress.支援拖曳上傳與多選圖片`

- **Line:** 409
  - **Kind:** `jsx-text`
  - **Original:** "JPG（推薦）"
  - **Suggested key:** `tools.ImageCompress.jpg_推薦`

- **Line:** 410
  - **Kind:** `jsx-text`
  - **Original:** "WebP（更小）"
  - **Suggested key:** `tools.ImageCompress.webp_更小`

- **Line:** 411
  - **Kind:** `jsx-text`
  - **Original:** "PNG（保留透明）"
  - **Suggested key:** `tools.ImageCompress.png_保留透明`

- **Line:** 429
  - **Kind:** `jsx-text`
  - **Original:** "JPG：最通用壓縮格式（推薦）"
  - **Suggested key:** `tools.ImageCompress.jpg_最通用壓縮格式_推薦`

- **Line:** 430
  - **Kind:** `jsx-text`
  - **Original:** "WebP：體積更小，適合網站圖片"
  - **Suggested key:** `tools.ImageCompress.webp_體積更小_適合網站圖片`

- **Line:** 431
  - **Kind:** `jsx-text`
  - **Original:** "PNG：保留透明背景"
  - **Suggested key:** `tools.ImageCompress.png_保留透明背景`

- **Line:** 434
  - **Kind:** `jsx-text`
  - **Original:** "⚠ PNG 為無損格式，通常不會大幅縮小檔案。"
  - **Suggested key:** `tools.ImageCompress.png_為無損格式_通常不會大幅縮小檔案`

- **Line:** 435
  - **Kind:** `jsx-text`
  - **Original:** "PNG 屬於無損格式，壓縮後檔案不一定會變小。若需要更小的圖片檔案，建議選擇 JPG 或 WebP。"
  - **Suggested key:** `tools.ImageCompress.png_屬於無損格式_壓縮後檔案不一定會變小_若需要更小的圖片檔案_建議`

- **Line:** 443
  - **Kind:** `jsx-text`
  - **Original:** "原始圖片"
  - **Suggested key:** `tools.ImageCompress.原始圖片`

- **Line:** 446
  - **Kind:** `attr:alt`
  - **Original:** "原始圖片預覽"
  - **Suggested key:** `tools.ImageCompress.原始圖片預覽`

- **Line:** 448
  - **Kind:** `jsx-text`
  - **Original:** "請先上傳圖片"
  - **Suggested key:** `tools.ImageCompress.請先上傳圖片`

- **Line:** 454
  - **Kind:** `jsx-text`
  - **Original:** "壓縮後圖片"
  - **Suggested key:** `tools.ImageCompress.壓縮後圖片`

- **Line:** 457
  - **Kind:** `jsx-text`
  - **Original:** "壓縮中..."
  - **Suggested key:** `tools.ImageCompress.壓縮中`

- **Line:** 459
  - **Kind:** `attr:alt`
  - **Original:** "壓縮後圖片預覽"
  - **Suggested key:** `tools.ImageCompress.壓縮後圖片預覽`

- **Line:** 461
  - **Kind:** `jsx-text`
  - **Original:** "尚未產生壓縮結果"
  - **Suggested key:** `tools.ImageCompress.尚未產生壓縮結果`

- **Line:** 469
  - **Kind:** `jsx-text`
  - **Original:** "批量壓縮結果"
  - **Suggested key:** `tools.ImageCompress.批量壓縮結果`

- **Line:** 545
  - **Kind:** `jsx-text`
  - **Original:** "請先上傳並完成壓縮"
  - **Suggested key:** `tools.ImageCompress.請先上傳並完成壓縮`

- **Line:** 552
  - **Kind:** `jsx-text`
  - **Original:** "如何使用此工具？"
  - **Suggested key:** `tools.ImageCompress.如何使用此工具`

- **Line:** 554
  - **Kind:** `jsx-text`
  - **Original:** "適合誰用："
  - **Suggested key:** `tools.ImageCompress.適合誰用`

- **Line:** 561
  - **Kind:** `jsx-text`
  - **Original:** "使用步驟"
  - **Suggested key:** `tools.ImageCompress.使用步驟`

- **Line:** 563
  - **Kind:** `jsx-text`
  - **Original:** "上傳圖片"
  - **Suggested key:** `tools.ImageCompress.上傳圖片`

- **Line:** 564
  - **Kind:** `jsx-text`
  - **Original:** "選擇輸出格式"
  - **Suggested key:** `tools.ImageCompress.選擇輸出格式`

- **Line:** 565
  - **Kind:** `jsx-text`
  - **Original:** "調整壓縮品質"
  - **Suggested key:** `tools.ImageCompress.調整壓縮品質`

- **Line:** 566
  - **Kind:** `jsx-text`
  - **Original:** "下載壓縮圖片"
  - **Suggested key:** `tools.ImageCompress.下載壓縮圖片`

- **Line:** 569
  - **Kind:** `jsx-text`
  - **Original:** "適合使用情境"
  - **Suggested key:** `tools.ImageCompress.適合使用情境`

- **Line:** 571
  - **Kind:** `jsx-text`
  - **Original:** "網站圖片優化"
  - **Suggested key:** `tools.ImageCompress.網站圖片優化`

- **Line:** 572
  - **Kind:** `jsx-text`
  - **Original:** "電商商品圖"
  - **Suggested key:** `tools.ImageCompress.電商商品圖`

- **Line:** 573
  - **Kind:** `jsx-text`
  - **Original:** "社群圖片分享"
  - **Suggested key:** `tools.ImageCompress.社群圖片分享`

- **Line:** 578
  - **Kind:** `jsx-text`
  - **Original:** "常見問題"
  - **Suggested key:** `tools.ImageCompress.常見問題`

- **Line:** 590
  - **Kind:** `jsx-text`
  - **Original:** "推薦搭配工具"
  - **Suggested key:** `tools.ImageCompress.推薦搭配工具`

- **Line:** 606
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `tools.ImageCompress.相關工具`

### `src/pages/blog/government-announcement-impact-explained.tsx`（35 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "政府公告一定會影響你嗎？哪些政策其實跟多數人無關？"
  - **Suggested key:** `blog.government-announcement-impact-explained.政府公告一定會影響你嗎_哪些政策其實跟多數人無關`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "政府公告影響解析：用白話方式說明為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」，以及一般民眾該怎麼判斷要不要關心。"
  - **Suggested key:** `blog.government-announcement-impact-explained.政府公告影響解析_用白話方式說明為什麼政府公告這麼多_哪些是_資訊型_不`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "政府公告, 政策影響, 政策解釋"
  - **Suggested key:** `blog.government-announcement-impact-explained.政府公告_政策影響_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "政府公告一定會影響你嗎？哪些政策其實跟多數人無關？"
  - **Suggested key:** `blog.government-announcement-impact-explained.政府公告一定會影響你嗎_哪些政策其實跟多數人無關`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "政府公告影響解析：用白話方式說明為什麼政府公告這麼多，哪些是「資訊型」不是「影響型」，以及一般民眾該怎麼判斷要不要關心。"
  - **Suggested key:** `blog.government-announcement-impact-explained.政府公告影響解析_用白話方式說明為什麼政府公告這麼多_哪些是_資訊型_不`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "為什麼政府公告這麼多？"
  - **Suggested key:** `blog.government-announcement-impact-explained.為什麼政府公告這麼多`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "資訊透明"
  - **Suggested key:** `blog.government-announcement-impact-explained.資訊透明`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "法律要求"
  - **Suggested key:** `blog.government-announcement-impact-explained.法律要求`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "行政流程"
  - **Suggested key:** `blog.government-announcement-impact-explained.行政流程`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "服務提供"
  - **Suggested key:** `blog.government-announcement-impact-explained.服務提供`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "哪些是「資訊型」不是「影響型」？"
  - **Suggested key:** `blog.government-announcement-impact-explained.哪些是_資訊型_不是_影響型`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "資訊型公告："
  - **Suggested key:** `blog.government-announcement-impact-explained.資訊型公告`

- **Line:** 69
  - **Kind:** `jsx-text`
  - **Original:** "只是告訴你發生了什麼事，不會直接影響你的生活"
  - **Suggested key:** `blog.government-announcement-impact-explained.只是告訴你發生了什麼事_不會直接影響你的生活`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "例如：某個會議的記錄、某個研究的結果、某個活動的資訊等"
  - **Suggested key:** `blog.government-announcement-impact-explained.例如_某個會議的記錄_某個研究的結果_某個活動的資訊等`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "這些公告通常是「參考用」，不需要特別關心"
  - **Suggested key:** `blog.government-announcement-impact-explained.這些公告通常是_參考用_不需要特別關心`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "影響型公告："
  - **Suggested key:** `blog.government-announcement-impact-explained.影響型公告`

- **Line:** 77
  - **Kind:** `jsx-text`
  - **Original:** "會直接影響你的生活，需要特別注意"
  - **Suggested key:** `blog.government-announcement-impact-explained.會直接影響你的生活_需要特別注意`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "例如：稅制調整、補助申請、法規修正、服務變更等"
  - **Suggested key:** `blog.government-announcement-impact-explained.例如_稅制調整_補助申請_法規修正_服務變更等`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "這些公告通常是「行動用」，需要了解並採取行動"
  - **Suggested key:** `blog.government-announcement-impact-explained.這些公告通常是_行動用_需要了解並採取行動`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "一般民眾該怎麼判斷要不要關心？"
  - **Suggested key:** `blog.government-announcement-impact-explained.一般民眾該怎麼判斷要不要關心`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "看標題與重點字"
  - **Suggested key:** `blog.government-announcement-impact-explained.看標題與重點字`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "看適用對象"
  - **Suggested key:** `blog.government-announcement-impact-explained.看適用對象`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "看生效時間"
  - **Suggested key:** `blog.government-announcement-impact-explained.看生效時間`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "看是否需要行動"
  - **Suggested key:** `blog.government-announcement-impact-explained.看是否需要行動`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多人會被新聞標題嚇到？"
  - **Suggested key:** `blog.government-announcement-impact-explained.為什麼很多人會被新聞標題嚇到`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "原因一：新聞標題為了吸引點擊，會用誇張的用詞"
  - **Suggested key:** `blog.government-announcement-impact-explained.原因一_新聞標題為了吸引點擊_會用誇張的用詞`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "原因二：沒有區分「資訊型」和「影響型」"
  - **Suggested key:** `blog.government-announcement-impact-explained.原因二_沒有區分_資訊型_和_影響型`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "原因三：不了解政策的實際影響範圍"
  - **Suggested key:** `blog.government-announcement-impact-explained.原因三_不了解政策的實際影響範圍`

- **Line:** 126
  - **Kind:** `jsx-text`
  - **Original:** "原因四：沒有判斷標準"
  - **Suggested key:** `blog.government-announcement-impact-explained.原因四_沒有判斷標準`

- **Line:** 132
  - **Kind:** `jsx-text`
  - **Original:** "哪些政策其實跟多數人無關？"
  - **Suggested key:** `blog.government-announcement-impact-explained.哪些政策其實跟多數人無關`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "特定行業的政策"
  - **Suggested key:** `blog.government-announcement-impact-explained.特定行業的政策`

- **Line:** 138
  - **Kind:** `jsx-text`
  - **Original:** "特定地區的政策"
  - **Suggested key:** `blog.government-announcement-impact-explained.特定地區的政策`

- **Line:** 139
  - **Kind:** `jsx-text`
  - **Original:** "特定身分的政策"
  - **Suggested key:** `blog.government-announcement-impact-explained.特定身分的政策`

- **Line:** 140
  - **Kind:** `jsx-text`
  - **Original:** "資訊型公告"
  - **Suggested key:** `blog.government-announcement-impact-explained.資訊型公告`

- **Line:** 150
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.government-announcement-impact-explained.提醒`

### `src/pages/blog/labor-pension-new-system-explained.tsx`（35 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "勞退新制是什麼？雇主提撥的錢真的都給你嗎？"
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退新制是什麼_雇主提撥的錢真的都給你嗎`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "勞退新制完整解析：用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異，6% 提撥實際怎麼運作，以及一般人最容易誤解的地方。"
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退新制完整解析_用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "勞退新制, 勞退舊制, 6% 提撥, 退休金, 政策解釋"
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退新制_勞退舊制_6_提撥_退休金_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "勞退新制是什麼？雇主提撥的錢真的都給你嗎？"
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退新制是什麼_雇主提撥的錢真的都給你嗎`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "勞退新制完整解析：用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異，6% 提撥實際怎麼運作，以及一般人最容易誤解的地方。"
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退新制完整解析_用一般上班族能看懂的語氣說明勞退新制與舊制的核心差異`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "勞退新制與舊制的核心差異"
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退新制與舊制的核心差異`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "勞退舊制："
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退舊制`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "退休金是雇主在員工退休時一次給付"
  - **Suggested key:** `blog.labor-pension-new-system-explained.退休金是雇主在員工退休時一次給付`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "金額是根據工作年資和最後的薪資計算"
  - **Suggested key:** `blog.labor-pension-new-system-explained.金額是根據工作年資和最後的薪資計算`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "如果中途離職，可能領不到或領很少"
  - **Suggested key:** `blog.labor-pension-new-system-explained.如果中途離職_可能領不到或領很少`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "退休金是「公司負擔」，不是「個人專戶」"
  - **Suggested key:** `blog.labor-pension-new-system-explained.退休金是_公司負擔_不是_個人專戶`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "勞退新制："
  - **Suggested key:** `blog.labor-pension-new-system-explained.勞退新制`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "雇主每個月要提撥 6% 到你的「個人專戶」"
  - **Suggested key:** `blog.labor-pension-new-system-explained.雇主每個月要提撥_6_到你的_個人專戶`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "這筆錢會一直累積，直到你退休才能領"
  - **Suggested key:** `blog.labor-pension-new-system-explained.這筆錢會一直累積_直到你退休才能領`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "如果中途離職，這筆錢還是你的，可以帶著走"
  - **Suggested key:** `blog.labor-pension-new-system-explained.如果中途離職_這筆錢還是你的_可以帶著走`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "退休金是「個人專戶」，屬於你個人所有"
  - **Suggested key:** `blog.labor-pension-new-system-explained.退休金是_個人專戶_屬於你個人所有`

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "6% 提撥實際怎麼運作"
  - **Suggested key:** `blog.labor-pension-new-system-explained.6_提撥實際怎麼運作`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "提撥基礎"
  - **Suggested key:** `blog.labor-pension-new-system-explained.提撥基礎`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "提撥金額"
  - **Suggested key:** `blog.labor-pension-new-system-explained.提撥金額`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "提撥方式"
  - **Suggested key:** `blog.labor-pension-new-system-explained.提撥方式`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "投資收益"
  - **Suggested key:** `blog.labor-pension-new-system-explained.投資收益`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "要等到退休才能領（通常是 60 歲）"
  - **Suggested key:** `blog.labor-pension-new-system-explained.要等到退休才能領_通常是_60_歲`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "金額會根據投資收益而有所增減"
  - **Suggested key:** `blog.labor-pension-new-system-explained.金額會根據投資收益而有所增減`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "如果投資虧損，你的退休金可能會減少"
  - **Suggested key:** `blog.labor-pension-new-system-explained.如果投資虧損_你的退休金可能會減少`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "一般人最容易誤解的地方"
  - **Suggested key:** `blog.labor-pension-new-system-explained.一般人最容易誤解的地方`

- **Line:** 97
  - **Kind:** `jsx-text`
  - **Original:** "誤解一：6% 就是全部給你的"
  - **Suggested key:** `blog.labor-pension-new-system-explained.誤解一_6_就是全部給你的`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "誤解二：可以隨時領"
  - **Suggested key:** `blog.labor-pension-new-system-explained.誤解二_可以隨時領`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "誤解三：投資一定賺錢"
  - **Suggested key:** `blog.labor-pension-new-system-explained.誤解三_投資一定賺錢`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "誤解四：6% 就夠退休了"
  - **Suggested key:** `blog.labor-pension-new-system-explained.誤解四_6_就夠退休了`

- **Line:** 124
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多人到離職才開始在意？"
  - **Suggested key:** `blog.labor-pension-new-system-explained.為什麼很多人到離職才開始在意`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "平時看不到"
  - **Suggested key:** `blog.labor-pension-new-system-explained.平時看不到`

- **Line:** 130
  - **Kind:** `jsx-text`
  - **Original:** "要等到退休才能領"
  - **Suggested key:** `blog.labor-pension-new-system-explained.要等到退休才能領`

- **Line:** 131
  - **Kind:** `jsx-text`
  - **Original:** "以為有勞保就夠了"
  - **Suggested key:** `blog.labor-pension-new-system-explained.以為有勞保就夠了`

- **Line:** 132
  - **Kind:** `jsx-text`
  - **Original:** "離職時才會查"
  - **Suggested key:** `blog.labor-pension-new-system-explained.離職時才會查`

- **Line:** 140
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.labor-pension-new-system-explained.提醒`

### `src/pages/tools/ImageResize--old.tsx`（35 筆）

- **Line:** 281
  - **Kind:** `jsx-text`
  - **Original:** "處理中…"
  - **Suggested key:** `tools.ImageResize--old.處理中`

- **Line:** 286
  - **Kind:** `jsx-text`
  - **Original:** "點擊或拖曳可更換圖片"
  - **Suggested key:** `tools.ImageResize--old.點擊或拖曳可更換圖片`

- **Line:** 290
  - **Kind:** `jsx-text`
  - **Original:** "點選上傳"
  - **Suggested key:** `tools.ImageResize--old.點選上傳`

- **Line:** 301
  - **Kind:** `jsx-text`
  - **Original:** "平台尺寸"
  - **Suggested key:** `tools.ImageResize--old.平台尺寸`

- **Line:** 318
  - **Kind:** `jsx-text`
  - **Original:** "輸出解析度（長邊）"
  - **Suggested key:** `tools.ImageResize--old.輸出解析度_長邊`

- **Line:** 335
  - **Kind:** `jsx-text`
  - **Original:** "轉換模式"
  - **Suggested key:** `tools.ImageResize--old.轉換模式`

- **Line:** 339
  - **Kind:** `jsx-text`
  - **Original:** "不變形（補白，完整顯示）"
  - **Suggested key:** `tools.ImageResize--old.不變形_補白_完整顯示`

- **Line:** 343
  - **Kind:** `jsx-text`
  - **Original:** "裁切滿版（可能裁掉邊緣）"
  - **Suggested key:** `tools.ImageResize--old.裁切滿版_可能裁掉邊緣`

- **Line:** 349
  - **Kind:** `jsx-text`
  - **Original:** "下載"
  - **Suggested key:** `tools.ImageResize--old.下載`

- **Line:** 373
  - **Kind:** `jsx-text`
  - **Original:** "多平台整包輸出（ZIP）"
  - **Suggested key:** `tools.ImageResize--old.多平台整包輸出_zip`

- **Line:** 432
  - **Kind:** `jsx-text`
  - **Original:** "下載"
  - **Suggested key:** `tools.ImageResize--old.下載`

- **Line:** 462
  - **Kind:** `jsx-text`
  - **Original:** "即時預覽"
  - **Suggested key:** `tools.ImageResize--old.即時預覽`

- **Line:** 486
  - **Kind:** `jsx-text`
  - **Original:** "IG／蝦皮／Shorts 圖片尺寸一鍵轉換｜不變形補白工具"
  - **Suggested key:** `tools.ImageResize--old.ig_蝦皮_shorts_圖片尺寸一鍵轉換_不變形補白工具`

- **Line:** 509
  - **Kind:** `jsx-text`
  - **Original:** "← 返回首頁"
  - **Suggested key:** `tools.ImageResize--old.返回首頁`

- **Line:** 512
  - **Kind:** `jsx-text`
  - **Original:** "IG／蝦皮／Shorts 圖片尺寸一鍵轉換"
  - **Suggested key:** `tools.ImageResize--old.ig_蝦皮_shorts_圖片尺寸一鍵轉換`

- **Line:** 532
  - **Kind:** `jsx-text`
  - **Original:** "圖片尺寸對照表（IG／蝦皮／Shorts）"
  - **Suggested key:** `tools.ImageResize--old.圖片尺寸對照表_ig_蝦皮_shorts`

- **Line:** 537
  - **Kind:** `jsx-text`
  - **Original:** "平台 / 用途"
  - **Suggested key:** `tools.ImageResize--old.平台_用途`

- **Line:** 538
  - **Kind:** `jsx-text`
  - **Original:** "建議比例"
  - **Suggested key:** `tools.ImageResize--old.建議比例`

- **Line:** 539
  - **Kind:** `jsx-text`
  - **Original:** "建議尺寸（像素）"
  - **Suggested key:** `tools.ImageResize--old.建議尺寸_像素`

- **Line:** 540
  - **Kind:** `jsx-text`
  - **Original:** "說明"
  - **Suggested key:** `tools.ImageResize--old.說明`

- **Line:** 545
  - **Kind:** `jsx-text`
  - **Original:** "IG 貼文"
  - **Suggested key:** `tools.ImageResize--old.ig_貼文`

- **Line:** 548
  - **Kind:** `jsx-text`
  - **Original:** "正方形貼文，最常見的尺寸"
  - **Suggested key:** `tools.ImageResize--old.正方形貼文_最常見的尺寸`

- **Line:** 551
  - **Kind:** `jsx-text`
  - **Original:** "IG 直式貼文"
  - **Suggested key:** `tools.ImageResize--old.ig_直式貼文`

- **Line:** 554
  - **Kind:** `jsx-text`
  - **Original:** "螢幕佔比更大，互動率通常較佳"
  - **Suggested key:** `tools.ImageResize--old.螢幕佔比更大_互動率通常較佳`

- **Line:** 557
  - **Kind:** `jsx-text`
  - **Original:** "IG 限動 / Reels / Shorts"
  - **Suggested key:** `tools.ImageResize--old.ig_限動_reels_shorts`

- **Line:** 560
  - **Kind:** `jsx-text`
  - **Original:** "直式全螢幕，避免上下被裁切"
  - **Suggested key:** `tools.ImageResize--old.直式全螢幕_避免上下被裁切`

- **Line:** 563
  - **Kind:** `jsx-text`
  - **Original:** "蝦皮商品主圖"
  - **Suggested key:** `tools.ImageResize--old.蝦皮商品主圖`

- **Line:** 566
  - **Kind:** `jsx-text`
  - **Original:** "正方形避免裁切，商品更清楚"
  - **Suggested key:** `tools.ImageResize--old.正方形避免裁切_商品更清楚`

- **Line:** 569
  - **Kind:** `jsx-text`
  - **Original:** "Facebook 貼文"
  - **Suggested key:** `tools.ImageResize--old.facebook_貼文`

- **Line:** 572
  - **Kind:** `jsx-text`
  - **Original:** "可與 IG 貼文共用尺寸"
  - **Suggested key:** `tools.ImageResize--old.可與_ig_貼文共用尺寸`

- **Line:** 575
  - **Kind:** `jsx-text-en`
  - **Original:** "YouTube Shorts"
  - **Suggested key:** `tools.ImageResize--old.youtube_shorts`

- **Line:** 578
  - **Kind:** `jsx-text`
  - **Original:** "直式比例，封面與內容一致較佳"
  - **Suggested key:** `tools.ImageResize--old.直式比例_封面與內容一致較佳`

- **Line:** 587
  - **Kind:** `jsx-text`
  - **Original:** "常見問題"
  - **Suggested key:** `tools.ImageResize--old.常見問題`

- **Line:** 611
  - **Kind:** `jsx-text`
  - **Original:** "隱私說明"
  - **Suggested key:** `tools.ImageResize--old.隱私說明`

- **Line:** 612
  - **Kind:** `jsx-text`
  - **Original:** "圖片僅在本機瀏覽器內處理，不會上傳到任何伺服器，亦不會儲存。關閉頁面後即無任何紀錄。"
  - **Suggested key:** `tools.ImageResize--old.圖片僅在本機瀏覽器內處理_不會上傳到任何伺服器_亦不會儲存_關閉頁面後即`

### `src/pages/blog/ai-free-tools-2026.tsx`（33 筆）

- **Line:** 55
  - **Kind:** `seo-title`
  - **Original:** "2026 免費 AI 工具整理｜哪些還能用？哪些即將變訂閱？"
  - **Suggested key:** `blog.ai-free-tools-2026.2026_免費_ai_工具整理_哪些還能用_哪些即將變訂閱`

- **Line:** 55
  - **Kind:** `seo-description`
  - **Original:** "整理 2026 年目前仍可免費使用的 AI 工具與模型，包含免費限制、即將轉為訂閱的服務，幫助新手快速選對 AI、不花冤枉錢。"
  - **Suggested key:** `blog.ai-free-tools-2026.整理_2026_年目前仍可免費使用的_ai_工具與模型_包含免費限制_即`

- **Line:** 55
  - **Kind:** `seo-keywords`
  - **Original:** "免費 AI 工具, 2026 AI 工具, AI 訂閱, ChatGPT 免費, AI 商用, 新手 AI"
  - **Suggested key:** `blog.ai-free-tools-2026.免費_ai_工具_2026_ai_工具_ai_訂閱_chatgpt`

- **Line:** 56
  - **Kind:** `attr:title`
  - **Original:** "2026 免費 AI 工具整理｜哪些還能用？哪些即將變訂閱？"
  - **Suggested key:** `blog.ai-free-tools-2026.2026_免費_ai_工具整理_哪些還能用_哪些即將變訂閱`

- **Line:** 57
  - **Kind:** `attr:description`
  - **Original:** "整理 2026 年目前仍可免費使用的 AI 工具與模型，包含免費限制、即將轉為訂閱的服務，幫助新手快速選對 AI、不花冤枉錢。"
  - **Suggested key:** `blog.ai-free-tools-2026.整理_2026_年目前仍可免費使用的_ai_工具與模型_包含免費限制_即`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "目前仍可免費使用的 AI 工具類型"
  - **Suggested key:** `blog.ai-free-tools-2026.目前仍可免費使用的_ai_工具類型`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "文字生成（寫作、翻譯、摘要）"
  - **Suggested key:** `blog.ai-free-tools-2026.文字生成_寫作_翻譯_摘要`

- **Line:** 109
  - **Kind:** `jsx-text`
  - **Original:** "圖片生成"
  - **Suggested key:** `blog.ai-free-tools-2026.圖片生成`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "影片與多媒體"
  - **Suggested key:** `blog.ai-free-tools-2026.影片與多媒體`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "學習與解題輔助"
  - **Suggested key:** `blog.ai-free-tools-2026.學習與解題輔助`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "近期由免費轉為訂閱的 AI 工具趨勢"
  - **Suggested key:** `blog.ai-free-tools-2026.近期由免費轉為訂閱的_ai_工具趨勢`

- **Line:** 134
  - **Kind:** `jsx-text`
  - **Original:** "取消或大幅縮減免註冊即可用的額度"
  - **Suggested key:** `blog.ai-free-tools-2026.取消或大幅縮減免註冊即可用的額度`

- **Line:** 135
  - **Kind:** `jsx-text`
  - **Original:** "將進階模型、高品質輸出改為僅付費用戶可用"
  - **Suggested key:** `blog.ai-free-tools-2026.將進階模型_高品質輸出改為僅付費用戶可用`

- **Line:** 136
  - **Kind:** `jsx-text`
  - **Original:** "原本「無限」的免費方案改為每日／每月上限"
  - **Suggested key:** `blog.ai-free-tools-2026.原本_無限_的免費方案改為每日_每月上限`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "宣佈將在數月後終止免費版，改為純訂閱制"
  - **Suggested key:** `blog.ai-free-tools-2026.宣佈將在數月後終止免費版_改為純訂閱制`

- **Line:** 144
  - **Kind:** `jsx-text`
  - **Original:** "新手該怎麼選？免費 vs 訂閱的判斷原則"
  - **Suggested key:** `blog.ai-free-tools-2026.新手該怎麼選_免費_vs_訂閱的判斷原則`

- **Line:** 146
  - **Kind:** `jsx-text`
  - **Original:** "適合先用免費的情況："
  - **Suggested key:** `blog.ai-free-tools-2026.適合先用免費的情況`

- **Line:** 147
  - **Kind:** `jsx-text`
  - **Original:** "適合考慮訂閱的情況："
  - **Suggested key:** `blog.ai-free-tools-2026.適合考慮訂閱的情況`

- **Line:** 155
  - **Kind:** `jsx-text`
  - **Original:** "常見問題 FAQ"
  - **Suggested key:** `blog.ai-free-tools-2026.常見問題_faq`

- **Line:** 159
  - **Kind:** `jsx-text`
  - **Original:** "免費 AI 可以商用嗎？"
  - **Suggested key:** `blog.ai-free-tools-2026.免費_ai_可以商用嗎`

- **Line:** 160
  - **Kind:** `jsx-text`
  - **Original:** "不一定。大多數免費版的服務條款明確限制商業使用，或僅允許個人、非商業用途。若要商用，需確認該服務的授權條款，或選擇有明確商用授權的付費方案。"
  - **Suggested key:** `blog.ai-free-tools-2026.不一定_大多數免費版的服務條款明確限制商業使用_或僅允許個人_非商業用途`

- **Line:** 163
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多 AI 工具突然要收費？"
  - **Suggested key:** `blog.ai-free-tools-2026.為什麼很多_ai_工具突然要收費`

- **Line:** 164
  - **Kind:** `jsx-text`
  - **Original:** "AI 模型訓練與伺服器營運成本高，服務商需要營收才能持續營運。先免費後收費是常見商業策略，用來累積用戶後再轉為訂閱制。"
  - **Suggested key:** `blog.ai-free-tools-2026.ai_模型訓練與伺服器營運成本高_服務商需要營收才能持續營運_先免費後收`

- **Line:** 167
  - **Kind:** `jsx-text`
  - **Original:** "免費 AI 和付費版差在哪？"
  - **Suggested key:** `blog.ai-free-tools-2026.免費_ai_和付費版差在哪`

- **Line:** 168
  - **Kind:** `jsx-text`
  - **Original:** "常見差異包括：使用次數與額度、可用的模型等級、輸出品質與速度、是否支援商用、客服與技術支援。付費版通常額度較高、功能較完整。"
  - **Suggested key:** `blog.ai-free-tools-2026.常見差異包括_使用次數與額度_可用的模型等級_輸出品質與速度_是否支援商`

- **Line:** 171
  - **Kind:** `jsx-text`
  - **Original:** "如何知道某個 AI 工具快變訂閱了？"
  - **Suggested key:** `blog.ai-free-tools-2026.如何知道某個_ai_工具快變訂閱了`

- **Line:** 172
  - **Kind:** `jsx-text`
  - **Original:** "可關注該服務的官方公告、社群媒體或電子報。若出現「免費版即將調整」「新方案即將上線」等訊息，多半預示政策變動，建議提早找替代方案。"
  - **Suggested key:** `blog.ai-free-tools-2026.可關注該服務的官方公告_社群媒體或電子報_若出現_免費版即將調整_新方`

- **Line:** 175
  - **Kind:** `jsx-text`
  - **Original:** "新手該從哪種 AI 工具開始？"
  - **Suggested key:** `blog.ai-free-tools-2026.新手該從哪種_ai_工具開始`

- **Line:** 176
  - **Kind:** `jsx-text`
  - **Original:** "建議從「文字生成」或「摘要」類工具起步，門檻低、試錯成本小。先確認自己是否真的會常用，再考慮付費或進階功能。"
  - **Suggested key:** `blog.ai-free-tools-2026.建議從_文字生成_或_摘要_類工具起步_門檻低_試錯成本小_先確認自己是`

- **Line:** 183
  - **Kind:** `jsx-text`
  - **Original:** "延伸使用：快速搭配的實用工具"
  - **Suggested key:** `blog.ai-free-tools-2026.延伸使用_快速搭配的實用工具`

- **Line:** 253
  - **Kind:** `jsx-text`
  - **Original:** "延伸推薦：把 AI 變成可上架/可接案的成果"
  - **Suggested key:** `blog.ai-free-tools-2026.延伸推薦_把_ai_變成可上架_可接案的成果`

- **Line:** 264
  - **Kind:** `jsx-text`
  - **Original:** "LINE 貼圖一鍵打包工具"
  - **Suggested key:** `blog.ai-free-tools-2026.line_貼圖一鍵打包工具`

- **Line:** 275
  - **Kind:** `jsx-text`
  - **Original:** "不會畫畫也能做貼圖：AI＋外包完整流程"
  - **Suggested key:** `blog.ai-free-tools-2026.不會畫畫也能做貼圖_ai_外包完整流程`

### `src/pages/blog/household-registration-explained.tsx`（33 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？"
  - **Suggested key:** `blog.household-registration-explained.戶籍遷出遷入有差嗎_為什麼這麼多補助都看戶籍`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "戶籍制度完整解析：用白話方式說明戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區。"
  - **Suggested key:** `blog.household-registration-explained.戶籍制度完整解析_用白話方式說明戶籍在政策中的實際用途_為什麼補助常以戶`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "戶籍, 遷出遷入, 補助, 政策解釋"
  - **Suggested key:** `blog.household-registration-explained.戶籍_遷出遷入_補助_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "戶籍遷出遷入有差嗎？為什麼這麼多補助都看戶籍？"
  - **Suggested key:** `blog.household-registration-explained.戶籍遷出遷入有差嗎_為什麼這麼多補助都看戶籍`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "戶籍制度完整解析：用白話方式說明戶籍在政策中的實際用途，為什麼補助常以戶籍為判斷，以及租屋族最常踩到的誤區。"
  - **Suggested key:** `blog.household-registration-explained.戶籍制度完整解析_用白話方式說明戶籍在政策中的實際用途_為什麼補助常以戶`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "戶籍在政策中的實際用途"
  - **Suggested key:** `blog.household-registration-explained.戶籍在政策中的實際用途`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "補助申請"
  - **Suggested key:** `blog.household-registration-explained.補助申請`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "選舉權"
  - **Suggested key:** `blog.household-registration-explained.選舉權`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "就學"
  - **Suggested key:** `blog.household-registration-explained.就學`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "社會福利"
  - **Suggested key:** `blog.household-registration-explained.社會福利`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "稅務"
  - **Suggested key:** `blog.household-registration-explained.稅務`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "為什麼補助常以戶籍為判斷？"
  - **Suggested key:** `blog.household-registration-explained.為什麼補助常以戶籍為判斷`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "資源分配"
  - **Suggested key:** `blog.household-registration-explained.資源分配`

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "行政管理"
  - **Suggested key:** `blog.household-registration-explained.行政管理`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "防止重複申請"
  - **Suggested key:** `blog.household-registration-explained.防止重複申請`

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "公平性"
  - **Suggested key:** `blog.household-registration-explained.公平性`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "租屋族最常踩到的誤區"
  - **Suggested key:** `blog.household-registration-explained.租屋族最常踩到的誤區`

- **Line:** 84
  - **Kind:** `jsx-text`
  - **Original:** "誤區一：戶籍不重要，實際居住地才重要"
  - **Suggested key:** `blog.household-registration-explained.誤區一_戶籍不重要_實際居住地才重要`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "誤區二：房東不給遷戶籍，就沒辦法申請補助"
  - **Suggested key:** `blog.household-registration-explained.誤區二_房東不給遷戶籍_就沒辦法申請補助`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "跟房東溝通，說明遷戶籍不會影響房東的權益"
  - **Suggested key:** `blog.household-registration-explained.跟房東溝通_說明遷戶籍不會影響房東的權益`

- **Line:** 97
  - **Kind:** `jsx-text`
  - **Original:** "如果房東堅持不給遷，可以考慮換租屋處"
  - **Suggested key:** `blog.household-registration-explained.如果房東堅持不給遷_可以考慮換租屋處`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "某些補助可能可以用「實際居住證明」來申請，但這要看各縣市的規定"
  - **Suggested key:** `blog.household-registration-explained.某些補助可能可以用_實際居住證明_來申請_但這要看各縣市的規定`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "誤區三：遷戶籍很麻煩，不遷也沒關係"
  - **Suggested key:** `blog.household-registration-explained.誤區三_遷戶籍很麻煩_不遷也沒關係`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "無法申請該縣市的補助"
  - **Suggested key:** `blog.household-registration-explained.無法申請該縣市的補助`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "無法在該縣市投票"
  - **Suggested key:** `blog.household-registration-explained.無法在該縣市投票`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "無法讓小孩在該縣市的公立學校就讀"
  - **Suggested key:** `blog.household-registration-explained.無法讓小孩在該縣市的公立學校就讀`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "無法享受該縣市的社會福利"
  - **Suggested key:** `blog.household-registration-explained.無法享受該縣市的社會福利`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "一般人該注意的現實影響"
  - **Suggested key:** `blog.household-registration-explained.一般人該注意的現實影響`

- **Line:** 126
  - **Kind:** `jsx-text`
  - **Original:** "戶籍很重要"
  - **Suggested key:** `blog.household-registration-explained.戶籍很重要`

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "遷戶籍有影響"
  - **Suggested key:** `blog.household-registration-explained.遷戶籍有影響`

- **Line:** 128
  - **Kind:** `jsx-text`
  - **Original:** "租屋時要考慮"
  - **Suggested key:** `blog.household-registration-explained.租屋時要考慮`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "補助要看戶籍"
  - **Suggested key:** `blog.household-registration-explained.補助要看戶籍`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.household-registration-explained.提醒`

### `src/pages/blog/line-sticker-outsourcing-guide.tsx`（33 筆）

- **Line:** 9
  - **Kind:** `seo-title`
  - **Original:** "不會畫畫也能做 LINE 貼圖：AI＋打包工具＋外包接案完整流程"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.不會畫畫也能做_line_貼圖_ai_打包工具_外包接案完整流程`

- **Line:** 9
  - **Kind:** `seo-description`
  - **Original:** "教你用 AI 產出角色草稿、用本站工具一鍵打包 LINE 規格，並在需要時用 Fiverr 找插畫師/動畫師精修，附需求單範本與避坑清單。"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.教你用_ai_產出角色草稿_用本站工具一鍵打包_line_規格_並在需要`

- **Line:** 9
  - **Kind:** `seo-keywords`
  - **Original:** "LINE 貼圖 外包, LINE 貼圖 接案, Fiverr 插畫師, 動態貼圖, 貼圖規格, 貼圖打包"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.line_貼圖_外包_line_貼圖_接案_fiverr_插畫師`

- **Line:** 10
  - **Kind:** `attr:title`
  - **Original:** "不會畫畫也能做 LINE 貼圖：AI＋打包工具＋外包接案完整流程"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.不會畫畫也能做_line_貼圖_ai_打包工具_外包接案完整流程`

- **Line:** 11
  - **Kind:** `attr:description`
  - **Original:** "教你用 AI 產出角色草稿、用本站工具一鍵打包 LINE 規格，並在需要時用 Fiverr 找插畫師/動畫師精修，附需求單範本與避坑清單。"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.教你用_ai_產出角色草稿_用本站工具一鍵打包_line_規格_並在需要`

- **Line:** 27
  - **Kind:** `jsx-text`
  - **Original:** "不會畫畫也能做 LINE 貼圖：AI＋打包工具＋外包接案完整流程"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.不會畫畫也能做_line_貼圖_ai_打包工具_外包接案完整流程`

- **Line:** 28
  - **Kind:** `jsx-text`
  - **Original:** "更新日期：2026-03-04"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.更新日期_2026_03_04`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "AI 產草稿 → 規格打包 → 必要時外包精修"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.ai_產草稿_規格打包_必要時外包精修`

- **Line:** 36
  - **Kind:** `jsx-text`
  - **Original:** "第 1 段：AI 先產出「一致角色」草稿"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.第_1_段_ai_先產出_一致角色_草稿`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "先固定角色特徵：髮型/配件/臉型/線條粗細/用色"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.先固定角色特徵_髮型_配件_臉型_線條粗細_用色`

- **Line:** 39
  - **Kind:** `jsx-text`
  - **Original:** "先做 2 張測一致性（例如「你好」「生氣」）再開始做整組"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.先做_2_張測一致性_例如_你好_生氣_再開始做整組`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "文字請用可讀性優先：粗體、描邊、不要太細"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.文字請用可讀性優先_粗體_描邊_不要太細`

- **Line:** 43
  - **Kind:** `jsx-text`
  - **Original:** "第 2 段：用本站工具一鍵打包 LINE 規格"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.第_2_段_用本站工具一鍵打包_line_規格`

- **Line:** 44
  - **Kind:** `jsx-text`
  - **Original:** "把圖片丟進工具，選 8/16/24/32/40 張，即可輸出 LINE 上架用 ZIP（含 main/tab）。"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.把圖片丟進工具_選_8_16_24_32_40_張_即可輸出_line`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "第 3 段：什麼情況該外包？"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.第_3_段_什麼情況該外包`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "角色一致性不穩（每張臉型比例都變）"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.角色一致性不穩_每張臉型比例都變`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "你要做動態貼圖，或更精緻的線條與上色"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.你要做動態貼圖_或更精緻的線條與上色`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "你想做品牌角色，之後要延伸週邊/網站/社群素材"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.你想做品牌角色_之後要延伸週邊_網站_社群素材`

- **Line:** 62
  - **Kind:** `jsx-text`
  - **Original:** "需求單範本（直接複製給插畫師）"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.需求單範本_直接複製給插畫師`

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "避坑清單（提高過件率與省返工）"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.避坑清單_提高過件率與省返工`

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "要求透明背景 PNG + 文字描邊"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.要求透明背景_png_文字描邊`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "先出 2 張試稿：確認角色一致性再做全套"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.先出_2_張試稿_確認角色一致性再做全套`

- **Line:** 77
  - **Kind:** `jsx-text`
  - **Original:** "確認商用授權與可否二次修改"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.確認商用授權與可否二次修改`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "命名不用擔心：最後可用打包工具自動命名輸出"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.命名不用擔心_最後可用打包工具自動命名輸出`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "快速找插畫師/動畫師（Fiverr）"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.快速找插畫師_動畫師_fiverr`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "最穩的 3 種變現方式"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.最穩的_3_種變現方式`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "自己上架貼圖：累積作品數量與搜尋曝光"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.自己上架貼圖_累積作品數量與搜尋曝光`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "做「貼圖打包服務」：你負責規格，插畫師負責畫"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.做_貼圖打包服務_你負責規格_插畫師負責畫`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "品牌角色延伸：貼圖 → Banner → 社群素材"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.品牌角色延伸_貼圖_banner_社群素材`

- **Line:** 116
  - **Kind:** `jsx-text`
  - **Original:** "LINE 圖片/影片安全刪除指南"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.line_圖片_影片安全刪除指南`

- **Line:** 117
  - **Kind:** `jsx-text`
  - **Original:** "隱私/清空間/換手機前必看。"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.隱私_清空間_換手機前必看`

- **Line:** 125
  - **Kind:** `jsx-text`
  - **Original:** "貼圖一鍵打包工具"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.貼圖一鍵打包工具`

- **Line:** 126
  - **Kind:** `jsx-text`
  - **Original:** "支援 8/16/24/32/40 張輸出 ZIP。"
  - **Suggested key:** `blog.line-sticker-outsourcing-guide.支援_8_16_24_32_40_張輸出_zip`

### `src/pages/blog/labor-insurance-pension-explained.tsx`（31 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點"
  - **Suggested key:** `blog.labor-insurance-pension-explained.勞保年金是什麼_什麼情況下領得到_一般人最容易搞錯的重點`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "勞保年金完整解析：用白話方式說明勞保年金與一次領的差別，什麼情況才能請領，以及一般人最容易搞錯的重點，包括年資、年齡、金額等常見誤解。"
  - **Suggested key:** `blog.labor-insurance-pension-explained.勞保年金完整解析_用白話方式說明勞保年金與一次領的差別_什麼情況才能請領`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "勞保年金, 勞保一次領, 退休金, 年資, 政策解釋"
  - **Suggested key:** `blog.labor-insurance-pension-explained.勞保年金_勞保一次領_退休金_年資_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "勞保年金是什麼？什麼情況下領得到？一般人最容易搞錯的重點"
  - **Suggested key:** `blog.labor-insurance-pension-explained.勞保年金是什麼_什麼情況下領得到_一般人最容易搞錯的重點`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "勞保年金完整解析：用白話方式說明勞保年金與一次領的差別，什麼情況才能請領，以及一般人最容易搞錯的重點，包括年資、年齡、金額等常見誤解。"
  - **Suggested key:** `blog.labor-insurance-pension-explained.勞保年金完整解析_用白話方式說明勞保年金與一次領的差別_什麼情況才能請領`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "勞保年金與一次領的差別"
  - **Suggested key:** `blog.labor-insurance-pension-explained.勞保年金與一次領的差別`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "勞保年金（按月領）："
  - **Suggested key:** `blog.labor-insurance-pension-explained.勞保年金_按月領`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "每個月領固定的金額，可以領到過世為止"
  - **Suggested key:** `blog.labor-insurance-pension-explained.每個月領固定的金額_可以領到過世為止`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "如果年資夠長，通常比一次領更划算"
  - **Suggested key:** `blog.labor-insurance-pension-explained.如果年資夠長_通常比一次領更划算`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "但如果中途過世，剩下的就沒有了"
  - **Suggested key:** `blog.labor-insurance-pension-explained.但如果中途過世_剩下的就沒有了`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "需要符合特定的年資和年齡條件"
  - **Suggested key:** `blog.labor-insurance-pension-explained.需要符合特定的年資和年齡條件`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "一次領："
  - **Suggested key:** `blog.labor-insurance-pension-explained.一次領`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "把累積的年資換算成一次性的退休金"
  - **Suggested key:** `blog.labor-insurance-pension-explained.把累積的年資換算成一次性的退休金`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "領完就沒有了，不會繼續按月給付"
  - **Suggested key:** `blog.labor-insurance-pension-explained.領完就沒有了_不會繼續按月給付`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "適合有其他投資規劃或急需用錢的人"
  - **Suggested key:** `blog.labor-insurance-pension-explained.適合有其他投資規劃或急需用錢的人`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "金額通常比按月領的總額少"
  - **Suggested key:** `blog.labor-insurance-pension-explained.金額通常比按月領的總額少`

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "什麼情況才能請領？"
  - **Suggested key:** `blog.labor-insurance-pension-explained.什麼情況才能請領`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "年齡條件"
  - **Suggested key:** `blog.labor-insurance-pension-explained.年齡條件`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "年資條件"
  - **Suggested key:** `blog.labor-insurance-pension-explained.年資條件`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "投保條件"
  - **Suggested key:** `blog.labor-insurance-pension-explained.投保條件`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "常見誤解（年資、年齡、金額）"
  - **Suggested key:** `blog.labor-insurance-pension-explained.常見誤解_年資_年齡_金額`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "誤解一：年資只要滿 15 年就可以領"
  - **Suggested key:** `blog.labor-insurance-pension-explained.誤解一_年資只要滿_15_年就可以領`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "誤解二：年金金額會很高"
  - **Suggested key:** `blog.labor-insurance-pension-explained.誤解二_年金金額會很高`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "誤解三：可以隨時請領"
  - **Suggested key:** `blog.labor-insurance-pension-explained.誤解三_可以隨時請領`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "誤解四：一次領比較划算"
  - **Suggested key:** `blog.labor-insurance-pension-explained.誤解四_一次領比較划算`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多人快退休才發現差很多？"
  - **Suggested key:** `blog.labor-insurance-pension-explained.為什麼很多人快退休才發現差很多`

- **Line:** 123
  - **Kind:** `jsx-text`
  - **Original:** "以為有勞保就夠用"
  - **Suggested key:** `blog.labor-insurance-pension-explained.以為有勞保就夠用`

- **Line:** 124
  - **Kind:** `jsx-text`
  - **Original:** "投保薪資太低"
  - **Suggested key:** `blog.labor-insurance-pension-explained.投保薪資太低`

- **Line:** 125
  - **Kind:** `jsx-text`
  - **Original:** "年資中斷"
  - **Suggested key:** `blog.labor-insurance-pension-explained.年資中斷`

- **Line:** 126
  - **Kind:** `jsx-text`
  - **Original:** "沒有提早規劃"
  - **Suggested key:** `blog.labor-insurance-pension-explained.沒有提早規劃`

- **Line:** 134
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.labor-insurance-pension-explained.提醒`

### `src/pages/blog/unemployment-benefit-explained.tsx`（31 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "失業給付是什麼？非自願離職一定領得到嗎？"
  - **Suggested key:** `blog.unemployment-benefit-explained.失業給付是什麼_非自願離職一定領得到嗎`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "失業給付完整解析：用實際情境說明什麼是失業給付，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到。"
  - **Suggested key:** `blog.unemployment-benefit-explained.失業給付完整解析_用實際情境說明什麼是失業給付_為什麼一定要非自願離職`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "失業給付, 非自願離職, 失業, 政策解釋"
  - **Suggested key:** `blog.unemployment-benefit-explained.失業給付_非自願離職_失業_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "失業給付是什麼？非自願離職一定領得到嗎？"
  - **Suggested key:** `blog.unemployment-benefit-explained.失業給付是什麼_非自願離職一定領得到嗎`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "失業給付完整解析：用實際情境說明什麼是失業給付，為什麼一定要非自願離職，以及為什麼很多人以為能領卻領不到。"
  - **Suggested key:** `blog.unemployment-benefit-explained.失業給付完整解析_用實際情境說明什麼是失業給付_為什麼一定要非自願離職`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "什麼是失業給付？"
  - **Suggested key:** `blog.unemployment-benefit-explained.什麼是失業給付`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "一定要「非自願離職」的原因"
  - **Suggested key:** `blog.unemployment-benefit-explained.一定要_非自願離職_的原因`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "什麼是「非自願離職」？"
  - **Suggested key:** `blog.unemployment-benefit-explained.什麼是_非自願離職`

- **Line:** 69
  - **Kind:** `jsx-text`
  - **Original:** "公司倒閉、歇業、解散"
  - **Suggested key:** `blog.unemployment-benefit-explained.公司倒閉_歇業_解散`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "公司裁員、資遣"
  - **Suggested key:** `blog.unemployment-benefit-explained.公司裁員_資遣`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "公司違反勞動契約，你因此離職"
  - **Suggested key:** `blog.unemployment-benefit-explained.公司違反勞動契約_你因此離職`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "公司對你有不當行為（例如性騷擾、職場霸凌），你因此離職"
  - **Suggested key:** `blog.unemployment-benefit-explained.公司對你有不當行為_例如性騷擾_職場霸凌_你因此離職`

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "其他符合「非自願離職」定義的情況"
  - **Suggested key:** `blog.unemployment-benefit-explained.其他符合_非自願離職_定義的情況`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "什麼是「自願離職」？"
  - **Suggested key:** `blog.unemployment-benefit-explained.什麼是_自願離職`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "你自己主動提出離職"
  - **Suggested key:** `blog.unemployment-benefit-explained.你自己主動提出離職`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "你因為個人原因（例如想換工作、家庭因素）而離職"
  - **Suggested key:** `blog.unemployment-benefit-explained.你因為個人原因_例如想換工作_家庭因素_而離職`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "你因為工作不適應而離職"
  - **Suggested key:** `blog.unemployment-benefit-explained.你因為工作不適應而離職`

- **Line:** 87
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多人以為能領卻領不到？"
  - **Suggested key:** `blog.unemployment-benefit-explained.為什麼很多人以為能領卻領不到`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "誤解一：只要失業就能領"
  - **Suggested key:** `blog.unemployment-benefit-explained.誤解一_只要失業就能領`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "誤解二：非自願離職一定領得到"
  - **Suggested key:** `blog.unemployment-benefit-explained.誤解二_非自願離職一定領得到`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "離職前 3 年內，勞保年資要滿 1 年"
  - **Suggested key:** `blog.unemployment-benefit-explained.離職前_3_年內_勞保年資要滿_1_年`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "離職後要立即到就業服務站辦理求職登記"
  - **Suggested key:** `blog.unemployment-benefit-explained.離職後要立即到就業服務站辦理求職登記`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "離職後 14 天內要申請失業給付"
  - **Suggested key:** `blog.unemployment-benefit-explained.離職後_14_天內要申請失業給付`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "要持續找工作，不能拒絕就業服務站介紹的工作"
  - **Suggested key:** `blog.unemployment-benefit-explained.要持續找工作_不能拒絕就業服務站介紹的工作`

- **Line:** 116
  - **Kind:** `jsx-text`
  - **Original:** "誤解三：可以一直領到找到工作"
  - **Suggested key:** `blog.unemployment-benefit-explained.誤解三_可以一直領到找到工作`

- **Line:** 122
  - **Kind:** `jsx-text`
  - **Original:** "一般上班族該有的正確認知"
  - **Suggested key:** `blog.unemployment-benefit-explained.一般上班族該有的正確認知`

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "失業給付不是「失業補助」"
  - **Suggested key:** `blog.unemployment-benefit-explained.失業給付不是_失業補助`

- **Line:** 128
  - **Kind:** `jsx-text`
  - **Original:** "條件很嚴格"
  - **Suggested key:** `blog.unemployment-benefit-explained.條件很嚴格`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "給付有期限"
  - **Suggested key:** `blog.unemployment-benefit-explained.給付有期限`

- **Line:** 130
  - **Kind:** `jsx-text`
  - **Original:** "金額有限"
  - **Suggested key:** `blog.unemployment-benefit-explained.金額有限`

- **Line:** 138
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.unemployment-benefit-explained.提醒`

### `src/pages/blog/ai-summary-guide.tsx`（30 筆）

- **Line:** 41
  - **Kind:** `seo-title`
  - **Original:** "免費 AI工具教學｜AI摘要教學與重點整理流程"
  - **Suggested key:** `blog.ai-summary-guide.免費_ai工具教學_ai摘要教學與重點整理流程`

- **Line:** 41
  - **Kind:** `seo-description`
  - **Original:** "這篇免費 AI工具教學聚焦 AI摘要實作，從提示語設計、輸出驗證到 FAQ 與工具串接，協助你在工作與學習情境快速落地。"
  - **Suggested key:** `blog.ai-summary-guide.這篇免費_ai工具教學聚焦_ai摘要實作_從提示語設計_輸出驗證到_fa`

- **Line:** 41
  - **Kind:** `seo-keywords`
  - **Original:** "AI工具, 免費AI工具, AI摘要教學, 內容整理, 生產力"
  - **Suggested key:** `blog.ai-summary-guide.ai工具_免費ai工具_ai摘要教學_內容整理_生產力`

- **Line:** 42
  - **Kind:** `attr:title`
  - **Original:** "免費 AI工具教學｜AI摘要教學與重點整理流程"
  - **Suggested key:** `blog.ai-summary-guide.免費_ai工具教學_ai摘要教學與重點整理流程`

- **Line:** 43
  - **Kind:** `attr:description`
  - **Original:** "這篇免費 AI工具教學聚焦 AI摘要實作，從提示語設計、輸出驗證到 FAQ 與工具串接，協助你在工作與學習情境快速落地。"
  - **Suggested key:** `blog.ai-summary-guide.這篇免費_ai工具教學聚焦_ai摘要實作_從提示語設計_輸出驗證到_fa`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要教學：用免費AI工具快速抓重點的完整流程"
  - **Suggested key:** `blog.ai-summary-guide.ai摘要教學_用免費ai工具快速抓重點的完整流程`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "目錄"
  - **Suggested key:** `blog.ai-summary-guide.目錄`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "步驟一：定義摘要格式"
  - **Suggested key:** `blog.ai-summary-guide.步驟一_定義摘要格式`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "步驟二：二次提問優化"
  - **Suggested key:** `blog.ai-summary-guide.步驟二_二次提問優化`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "步驟三：接回工作流"
  - **Suggested key:** `blog.ai-summary-guide.步驟三_接回工作流`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "常見錯誤與修正"
  - **Suggested key:** `blog.ai-summary-guide.常見錯誤與修正`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "FAQ 與 CTA"
  - **Suggested key:** `blog.ai-summary-guide.faq_與_cta`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "步驟一：先定義你要的摘要格式"
  - **Suggested key:** `blog.ai-summary-guide.步驟一_先定義你要的摘要格式`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "步驟二：用 AI摘要先壓縮，再做二次提問"
  - **Suggested key:** `blog.ai-summary-guide.步驟二_用_ai摘要先壓縮_再做二次提問`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "步驟三：把摘要接到你的工作與學習流程"
  - **Suggested key:** `blog.ai-summary-guide.步驟三_把摘要接到你的工作與學習流程`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "作業解題工具"
  - **Suggested key:** `blog.ai-summary-guide.作業解題工具`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 工具"
  - **Suggested key:** `blog.ai-summary-guide.qr_code_工具`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "常見錯誤與修正方式"
  - **Suggested key:** `blog.ai-summary-guide.常見錯誤與修正方式`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "立即實測入口"
  - **Suggested key:** `blog.ai-summary-guide.立即實測入口`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `blog.ai-summary-guide.ai摘要工具`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "工具中心"
  - **Suggested key:** `blog.ai-summary-guide.工具中心`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "作業解題工具"
  - **Suggested key:** `blog.ai-summary-guide.作業解題工具`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 工具"
  - **Suggested key:** `blog.ai-summary-guide.qr_code_工具`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "FAQ：AI摘要實作常見問題"
  - **Suggested key:** `blog.ai-summary-guide.faq_ai摘要實作常見問題`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "Q1：AI摘要會不會漏重點？"
  - **Suggested key:** `blog.ai-summary-guide.q1_ai摘要會不會漏重點`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "A：可能，所以要用二次提問補強，並用原文段落對照檢查。"
  - **Suggested key:** `blog.ai-summary-guide.a_可能_所以要用二次提問補強_並用原文段落對照檢查`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "Q2：摘要格式要固定嗎？"
  - **Suggested key:** `blog.ai-summary-guide.q2_摘要格式要固定嗎`

- **Line:** 116
  - **Kind:** `jsx-text`
  - **Original:** "A：建議固定，固定格式能讓免費AI工具輸出更一致、更容易比較。"
  - **Suggested key:** `blog.ai-summary-guide.a_建議固定_固定格式能讓免費ai工具輸出更一致_更容易比較`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "Q3：如何快速落地到工作？"
  - **Suggested key:** `blog.ai-summary-guide.q3_如何快速落地到工作`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "A：把摘要直接接到會議紀錄、任務清單與分享素材，讓 AI工具 成果可立即執行。"
  - **Suggested key:** `blog.ai-summary-guide.a_把摘要直接接到會議紀錄_任務清單與分享素材_讓_ai工具_成果可立即`

### `src/pages/blog/homework-helper-guide.tsx`（30 筆）

- **Line:** 41
  - **Kind:** `seo-title`
  - **Original:** "免費 AI工具教學｜作業解題教學與步驟化實作"
  - **Suggested key:** `blog.homework-helper-guide.免費_ai工具教學_作業解題教學與步驟化實作`

- **Line:** 41
  - **Kind:** `seo-description`
  - **Original:** "這篇免費 AI工具教學聚焦作業解題流程，整理題目輸入模板、步驟化提示語、FAQ 與工具串接技巧，協助你穩定提升理解與解題效率。"
  - **Suggested key:** `blog.homework-helper-guide.這篇免費_ai工具教學聚焦作業解題流程_整理題目輸入模板_步驟化提示語`

- **Line:** 41
  - **Kind:** `seo-keywords`
  - **Original:** "AI工具, 免費AI工具, 作業解題教學, 學習效率, AI摘要"
  - **Suggested key:** `blog.homework-helper-guide.ai工具_免費ai工具_作業解題教學_學習效率_ai摘要`

- **Line:** 42
  - **Kind:** `attr:title`
  - **Original:** "免費 AI工具教學｜作業解題教學與步驟化實作"
  - **Suggested key:** `blog.homework-helper-guide.免費_ai工具教學_作業解題教學與步驟化實作`

- **Line:** 43
  - **Kind:** `attr:description`
  - **Original:** "這篇免費 AI工具教學聚焦作業解題流程，整理題目輸入模板、步驟化提示語、FAQ 與工具串接技巧，協助你穩定提升理解與解題效率。"
  - **Suggested key:** `blog.homework-helper-guide.這篇免費_ai工具教學聚焦作業解題流程_整理題目輸入模板_步驟化提示語`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "作業解題教學：如何用 AI工具提升理解力而不是只抄答案"
  - **Suggested key:** `blog.homework-helper-guide.作業解題教學_如何用_ai工具提升理解力而不是只抄答案`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "目錄"
  - **Suggested key:** `blog.homework-helper-guide.目錄`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "題目整理模板"
  - **Suggested key:** `blog.homework-helper-guide.題目整理模板`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "步驟化回覆策略"
  - **Suggested key:** `blog.homework-helper-guide.步驟化回覆策略`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "與 AI摘要結合"
  - **Suggested key:** `blog.homework-helper-guide.與_ai摘要結合`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "結果驗證方法"
  - **Suggested key:** `blog.homework-helper-guide.結果驗證方法`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "FAQ 與 CTA"
  - **Suggested key:** `blog.homework-helper-guide.faq_與_cta`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "先建立「題目整理模板」"
  - **Suggested key:** `blog.homework-helper-guide.先建立_題目整理模板`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "要求步驟化回覆，而不是直接答案"
  - **Suggested key:** `blog.homework-helper-guide.要求步驟化回覆_而不是直接答案`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "把作業解題與 AI摘要結合"
  - **Suggested key:** `blog.homework-helper-guide.把作業解題與_ai摘要結合`

- **Line:** 87
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `blog.homework-helper-guide.ai摘要工具`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "作業解題工具"
  - **Suggested key:** `blog.homework-helper-guide.作業解題工具`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 工具"
  - **Suggested key:** `blog.homework-helper-guide.qr_code_工具`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "如何判斷工具回答是否可信"
  - **Suggested key:** `blog.homework-helper-guide.如何判斷工具回答是否可信`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "推薦的起手順序"
  - **Suggested key:** `blog.homework-helper-guide.推薦的起手順序`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "作業解題工具"
  - **Suggested key:** `blog.homework-helper-guide.作業解題工具`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `blog.homework-helper-guide.ai摘要工具`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "工具中心"
  - **Suggested key:** `blog.homework-helper-guide.工具中心`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "FAQ：作業解題工具常見問題"
  - **Suggested key:** `blog.homework-helper-guide.faq_作業解題工具常見問題`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "Q1：會不會變成依賴工具？"
  - **Suggested key:** `blog.homework-helper-guide.q1_會不會變成依賴工具`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "A：只要你要求步驟化解釋並自己驗證，就會是學習加速，而非依賴。"
  - **Suggested key:** `blog.homework-helper-guide.a_只要你要求步驟化解釋並自己驗證_就會是學習加速_而非依賴`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "Q2：哪個年級適合用？"
  - **Suggested key:** `blog.homework-helper-guide.q2_哪個年級適合用`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "A：國中到大學都可用，關鍵是輸入條件要完整，並持續做結果比對。"
  - **Suggested key:** `blog.homework-helper-guide.a_國中到大學都可用_關鍵是輸入條件要完整_並持續做結果比對`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "Q3：可以搭配哪些工具？"
  - **Suggested key:** `blog.homework-helper-guide.q3_可以搭配哪些工具`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "A：建議搭配 AI摘要、QR 分發與圖片尺寸工具，形成完整學習工作流。"
  - **Suggested key:** `blog.homework-helper-guide.a_建議搭配_ai摘要_qr_分發與圖片尺寸工具_形成完整學習工作流`

### `src/pages/blog/overtime-pay-explained.tsx`（30 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "加班費一定要給嗎？為什麼很多人其實拿不到？"
  - **Suggested key:** `blog.overtime-pay-explained.加班費一定要給嗎_為什麼很多人其實拿不到`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "加班費制度完整解析：用白話方式說明加班費制度存在的原意，為什麼實務上常常拿不到，以及上班族最容易誤解的地方。"
  - **Suggested key:** `blog.overtime-pay-explained.加班費制度完整解析_用白話方式說明加班費制度存在的原意_為什麼實務上常常`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "加班費, 責任制, 補休, 勞動權益, 政策解釋"
  - **Suggested key:** `blog.overtime-pay-explained.加班費_責任制_補休_勞動權益_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "加班費一定要給嗎？為什麼很多人其實拿不到？"
  - **Suggested key:** `blog.overtime-pay-explained.加班費一定要給嗎_為什麼很多人其實拿不到`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "加班費制度完整解析：用白話方式說明加班費制度存在的原意，為什麼實務上常常拿不到，以及上班族最容易誤解的地方。"
  - **Suggested key:** `blog.overtime-pay-explained.加班費制度完整解析_用白話方式說明加班費制度存在的原意_為什麼實務上常常`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "加班費制度存在的原意"
  - **Suggested key:** `blog.overtime-pay-explained.加班費制度存在的原意`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "保障勞工權益"
  - **Suggested key:** `blog.overtime-pay-explained.保障勞工權益`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "防止過度加班"
  - **Suggested key:** `blog.overtime-pay-explained.防止過度加班`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "公平性"
  - **Suggested key:** `blog.overtime-pay-explained.公平性`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "為什麼實務上常常拿不到？"
  - **Suggested key:** `blog.overtime-pay-explained.為什麼實務上常常拿不到`

- **Line:** 69
  - **Kind:** `jsx-text`
  - **Original:** "原因一：責任制"
  - **Suggested key:** `blog.overtime-pay-explained.原因一_責任制`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "原因二：補休"
  - **Suggested key:** `blog.overtime-pay-explained.原因二_補休`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "原因三：雇主不承認是「加班」"
  - **Suggested key:** `blog.overtime-pay-explained.原因三_雇主不承認是_加班`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "原因四：勞工不敢要求"
  - **Suggested key:** `blog.overtime-pay-explained.原因四_勞工不敢要求`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "常見灰色地帶（責任制、補休）"
  - **Suggested key:** `blog.overtime-pay-explained.常見灰色地帶_責任制_補休`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "責任制："
  - **Suggested key:** `blog.overtime-pay-explained.責任制`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "只有特定行業和職位才能適用責任制"
  - **Suggested key:** `blog.overtime-pay-explained.只有特定行業和職位才能適用責任制`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "要經過主管機關核定"
  - **Suggested key:** `blog.overtime-pay-explained.要經過主管機關核定`

- **Line:** 109
  - **Kind:** `jsx-text`
  - **Original:** "即使適用責任制，如果工作時間超過合理範圍，還是要給加班費"
  - **Suggested key:** `blog.overtime-pay-explained.即使適用責任制_如果工作時間超過合理範圍_還是要給加班費`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "補休："
  - **Suggested key:** `blog.overtime-pay-explained.補休`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "補休是「額外的福利」，不能代替「法定的加班費」"
  - **Suggested key:** `blog.overtime-pay-explained.補休是_額外的福利_不能代替_法定的加班費`

- **Line:** 122
  - **Kind:** `jsx-text`
  - **Original:** "如果選擇補休，要在一定期限內休完（通常是 6 個月內）"
  - **Suggested key:** `blog.overtime-pay-explained.如果選擇補休_要在一定期限內休完_通常是_6_個月內`

- **Line:** 123
  - **Kind:** `jsx-text`
  - **Original:** "如果沒休完，還是要給加班費"
  - **Suggested key:** `blog.overtime-pay-explained.如果沒休完_還是要給加班費`

- **Line:** 124
  - **Kind:** `jsx-text`
  - **Original:** "補休的時數要等於加班的時數，不能「打折」"
  - **Suggested key:** `blog.overtime-pay-explained.補休的時數要等於加班的時數_不能_打折`

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "上班族最容易誤解的地方"
  - **Suggested key:** `blog.overtime-pay-explained.上班族最容易誤解的地方`

- **Line:** 130
  - **Kind:** `jsx-text`
  - **Original:** "誤解一：責任制就不用給加班費"
  - **Suggested key:** `blog.overtime-pay-explained.誤解一_責任制就不用給加班費`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "誤解二：補休可以代替加班費"
  - **Suggested key:** `blog.overtime-pay-explained.誤解二_補休可以代替加班費`

- **Line:** 144
  - **Kind:** `jsx-text`
  - **Original:** "誤解三：自己留下來做事不算加班"
  - **Suggested key:** `blog.overtime-pay-explained.誤解三_自己留下來做事不算加班`

- **Line:** 151
  - **Kind:** `jsx-text`
  - **Original:** "誤解四：加班費是「福利」不是「權利」"
  - **Suggested key:** `blog.overtime-pay-explained.誤解四_加班費是_福利_不是_權利`

- **Line:** 159
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.overtime-pay-explained.提醒`

### `src/pages/blog/labor-insurance-explained.tsx`（29 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "勞保是什麼？你每個月繳的錢到底保障了哪些事情？"
  - **Suggested key:** `blog.labor-insurance-explained.勞保是什麼_你每個月繳的錢到底保障了哪些事情`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "勞保完整解析：了解勞保在保什麼，包括生病、失能、退休各怎麼用，以及為什麼很多人快退休才發現不夠，用白話方式一次澄清常見迷思。"
  - **Suggested key:** `blog.labor-insurance-explained.勞保完整解析_了解勞保在保什麼_包括生病_失能_退休各怎麼用_以及為什麼`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "勞保, 勞工保險, 退休金, 失能給付, 政策解釋"
  - **Suggested key:** `blog.labor-insurance-explained.勞保_勞工保險_退休金_失能給付_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "勞保是什麼？你每個月繳的錢到底保障了哪些事情？"
  - **Suggested key:** `blog.labor-insurance-explained.勞保是什麼_你每個月繳的錢到底保障了哪些事情`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "勞保完整解析：了解勞保在保什麼，包括生病、失能、退休各怎麼用，以及為什麼很多人快退休才發現不夠，用白話方式一次澄清常見迷思。"
  - **Suggested key:** `blog.labor-insurance-explained.勞保完整解析_了解勞保在保什麼_包括生病_失能_退休各怎麼用_以及為什麼`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "勞保在保什麼？"
  - **Suggested key:** `blog.labor-insurance-explained.勞保在保什麼`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "普通傷病"
  - **Suggested key:** `blog.labor-insurance-explained.普通傷病`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "職業災害"
  - **Suggested key:** `blog.labor-insurance-explained.職業災害`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "失能"
  - **Suggested key:** `blog.labor-insurance-explained.失能`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "死亡"
  - **Suggested key:** `blog.labor-insurance-explained.死亡`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "生育"
  - **Suggested key:** `blog.labor-insurance-explained.生育`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "老年給付（退休金）"
  - **Suggested key:** `blog.labor-insurance-explained.老年給付_退休金`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "生病、失能、退休各怎麼用？"
  - **Suggested key:** `blog.labor-insurance-explained.生病_失能_退休各怎麼用`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "生病時："
  - **Suggested key:** `blog.labor-insurance-explained.生病時`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "失能時："
  - **Suggested key:** `blog.labor-insurance-explained.失能時`

- **Line:** 84
  - **Kind:** `jsx-text`
  - **Original:** "退休時："
  - **Suggested key:** `blog.labor-insurance-explained.退休時`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "一次請領"
  - **Suggested key:** `blog.labor-insurance-explained.一次請領`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "按月領（年金）"
  - **Suggested key:** `blog.labor-insurance-explained.按月領_年金`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多人快退休才發現不夠？"
  - **Suggested key:** `blog.labor-insurance-explained.為什麼很多人快退休才發現不夠`

- **Line:** 101
  - **Kind:** `jsx-text`
  - **Original:** "以為勞保就夠用"
  - **Suggested key:** `blog.labor-insurance-explained.以為勞保就夠用`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "投保薪資太低"
  - **Suggested key:** `blog.labor-insurance-explained.投保薪資太低`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "年資中斷"
  - **Suggested key:** `blog.labor-insurance-explained.年資中斷`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "沒有提早規劃"
  - **Suggested key:** `blog.labor-insurance-explained.沒有提早規劃`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "常見迷思一次澄清"
  - **Suggested key:** `blog.labor-insurance-explained.常見迷思一次澄清`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "迷思一：勞保退休金就是全部退休金"
  - **Suggested key:** `blog.labor-insurance-explained.迷思一_勞保退休金就是全部退休金`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "迷思二：投保薪資越高越好"
  - **Suggested key:** `blog.labor-insurance-explained.迷思二_投保薪資越高越好`

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "迷思三：換工作會影響退休金"
  - **Suggested key:** `blog.labor-insurance-explained.迷思三_換工作會影響退休金`

- **Line:** 134
  - **Kind:** `jsx-text`
  - **Original:** "迷思四：勞保和勞退是一樣的"
  - **Suggested key:** `blog.labor-insurance-explained.迷思四_勞保和勞退是一樣的`

- **Line:** 142
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.labor-insurance-explained.提醒`

### `src/pages/blog/qr-code-generator.tsx`（29 筆）

- **Line:** 41
  - **Kind:** `seo-title`
  - **Original:** "免費 AI工具教學｜QR Code 實作與素材優化"
  - **Suggested key:** `blog.qr-code-generator.免費_ai工具教學_qr_code_實作與素材優化`

- **Line:** 41
  - **Kind:** `seo-description`
  - **Original:** "本篇免費 AI工具教學聚焦 QR Code 實務應用，整理尺寸、對比、落地頁與 FAQ，並提供 AI摘要與圖片工具串接路徑，協助快速完成分享與追蹤。"
  - **Suggested key:** `blog.qr-code-generator.本篇免費_ai工具教學聚焦_qr_code_實務應用_整理尺寸_對比_落`

- **Line:** 41
  - **Kind:** `seo-keywords`
  - **Original:** "AI工具, 免費AI工具, QR Code 教學, 圖片優化, 短網址"
  - **Suggested key:** `blog.qr-code-generator.ai工具_免費ai工具_qr_code_教學_圖片優化_短網址`

- **Line:** 42
  - **Kind:** `attr:title`
  - **Original:** "免費 AI工具教學｜QR Code 實作與素材優化"
  - **Suggested key:** `blog.qr-code-generator.免費_ai工具教學_qr_code_實作與素材優化`

- **Line:** 43
  - **Kind:** `attr:description`
  - **Original:** "本篇免費 AI工具教學聚焦 QR Code 實務應用，整理尺寸、對比、落地頁與 FAQ，並提供 AI摘要與圖片工具串接路徑，協助快速完成分享與追蹤。"
  - **Suggested key:** `blog.qr-code-generator.本篇免費_ai工具教學聚焦_qr_code_實務應用_整理尺寸_對比_落`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 教學：用免費工具建立可追蹤的分享入口"
  - **Suggested key:** `blog.qr-code-generator.qr_code_教學_用免費工具建立可追蹤的分享入口`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "目錄"
  - **Suggested key:** `blog.qr-code-generator.目錄`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "目標頁設定"
  - **Suggested key:** `blog.qr-code-generator.目標頁設定`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "設計三原則"
  - **Suggested key:** `blog.qr-code-generator.設計三原則`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "文案與 AI摘要搭配"
  - **Suggested key:** `blog.qr-code-generator.文案與_ai摘要搭配`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "教育場景應用"
  - **Suggested key:** `blog.qr-code-generator.教育場景應用`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "FAQ 與 CTA"
  - **Suggested key:** `blog.qr-code-generator.faq_與_cta`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "先定義掃碼後的目標頁"
  - **Suggested key:** `blog.qr-code-generator.先定義掃碼後的目標頁`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "工具中心"
  - **Suggested key:** `blog.qr-code-generator.工具中心`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "設計面：對比、尺寸與留白三原則"
  - **Suggested key:** `blog.qr-code-generator.設計面_對比_尺寸與留白三原則`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "內容面：搭配 AI摘要提升點擊意圖"
  - **Suggested key:** `blog.qr-code-generator.內容面_搭配_ai摘要提升點擊意圖`

- **Line:** 87
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `blog.qr-code-generator.ai摘要工具`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "教育場景：搭配作業解題快速分發教材"
  - **Suggested key:** `blog.qr-code-generator.教育場景_搭配作業解題快速分發教材`

- **Line:** 95
  - **Kind:** `jsx-text`
  - **Original:** "作業解題工具"
  - **Suggested key:** `blog.qr-code-generator.作業解題工具`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "實作建議：三步完成可用的 QR Code 分享流程"
  - **Suggested key:** `blog.qr-code-generator.實作建議_三步完成可用的_qr_code_分享流程`

- **Line:** 101
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 產生器"
  - **Suggested key:** `blog.qr-code-generator.qr_code_產生器`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "圖片尺寸工具"
  - **Suggested key:** `blog.qr-code-generator.圖片尺寸工具`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "FAQ：QR Code 常見問題"
  - **Suggested key:** `blog.qr-code-generator.faq_qr_code_常見問題`

- **Line:** 109
  - **Kind:** `jsx-text`
  - **Original:** "Q1：為什麼掃碼率不穩？"
  - **Suggested key:** `blog.qr-code-generator.q1_為什麼掃碼率不穩`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "A：多半是尺寸過小、對比不足或留白不夠，先從這三點優先調整。"
  - **Suggested key:** `blog.qr-code-generator.a_多半是尺寸過小_對比不足或留白不夠_先從這三點優先調整`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "Q2：要不要加 logo？"
  - **Suggested key:** `blog.qr-code-generator.q2_要不要加_logo`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "A：可以，但避免遮蓋過多關鍵區域，並務必做多場景測試。"
  - **Suggested key:** `blog.qr-code-generator.a_可以_但避免遮蓋過多關鍵區域_並務必做多場景測試`

- **Line:** 117
  - **Kind:** `jsx-text`
  - **Original:** "Q3：怎麼提升掃碼後行動率？"
  - **Suggested key:** `blog.qr-code-generator.q3_怎麼提升掃碼後行動率`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "A：搭配 AI摘要產生清楚價值文案，再把落地頁 CTA 簡化為單一步驟。"
  - **Suggested key:** `blog.qr-code-generator.a_搭配_ai摘要產生清楚價值文案_再把落地頁_cta_簡化為單一步驟`

### `src/pages/blog/taiwan-us-tariff-explained.tsx`（29 筆）

- **Line:** 47
  - **Kind:** `seo-title`
  - **Original:** "為什麼最近一直在談台美關稅？跟你我有什麼關係？"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.為什麼最近一直在談台美關稅_跟你我有什麼關係`

- **Line:** 47
  - **Kind:** `seo-description`
  - **Original:** "台美關稅完整解析：整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異，並加入常見誤解 Q&A，幫助讀者快速判斷這是不是需要關注的議題。"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.台美關稅完整解析_整理近期新聞常出現_台美關稅_的原因_說明政府_產業與`

- **Line:** 47
  - **Kind:** `seo-keywords`
  - **Original:** "台美關稅, 台灣美國關稅, 貿易政策, 關稅談判, 政策解釋"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.台美關稅_台灣美國關稅_貿易政策_關稅談判_政策解釋`

- **Line:** 48
  - **Kind:** `attr:title`
  - **Original:** "為什麼最近一直在談台美關稅？跟你我有什麼關係？"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.為什麼最近一直在談台美關稅_跟你我有什麼關係`

- **Line:** 49
  - **Kind:** `attr:description`
  - **Original:** "台美關稅完整解析：整理近期新聞常出現「台美關稅」的原因，說明政府、產業與一般民眾的關聯差異，並加入常見誤解 Q&A，幫助讀者快速判斷這是不是需要關注的議題。"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.台美關稅完整解析_整理近期新聞常出現_台美關稅_的原因_說明政府_產業與`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "為什麼最近一直在談台美關稅？"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.為什麼最近一直在談台美關稅`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "國際貿易環境變化"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.國際貿易環境變化`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "產業競爭與供應鏈調整"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.產業競爭與供應鏈調整`

- **Line:** 101
  - **Kind:** `jsx-text`
  - **Original:** "政策協商與談判"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.政策協商與談判`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "對不同層面的影響差異"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.對不同層面的影響差異`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "政府層面"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.政府層面`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "貿易談判與外交關係"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.貿易談判與外交關係`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "產業政策與經濟發展"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.產業政策與經濟發展`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "國家競爭力與國際地位"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.國家競爭力與國際地位`

- **Line:** 146
  - **Kind:** `jsx-text`
  - **Original:** "產業層面"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.產業層面`

- **Line:** 151
  - **Kind:** `jsx-text`
  - **Original:** "出口產品的價格競爭力"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.出口產品的價格競爭力`

- **Line:** 152
  - **Kind:** `jsx-text`
  - **Original:** "企業營運成本與獲利"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.企業營運成本與獲利`

- **Line:** 153
  - **Kind:** `jsx-text`
  - **Original:** "市場拓展與訂單變化"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.市場拓展與訂單變化`

- **Line:** 159
  - **Kind:** `jsx-text`
  - **Original:** "一般民眾層面"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.一般民眾層面`

- **Line:** 164
  - **Kind:** `jsx-text`
  - **Original:** "如果關稅調整影響進口商品，可能間接影響物價"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.如果關稅調整影響進口商品_可能間接影響物價`

- **Line:** 165
  - **Kind:** `jsx-text`
  - **Original:** "如果相關產業受到影響，可能影響就業市場"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.如果相關產業受到影響_可能影響就業市場`

- **Line:** 166
  - **Kind:** `jsx-text`
  - **Original:** "但這些影響通常需要時間才會顯現，不會立即改變日常生活"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.但這些影響通常需要時間才會顯現_不會立即改變日常生活`

- **Line:** 172
  - **Kind:** `jsx-text`
  - **Original:** "常見誤解 Q&A"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.常見誤解_q_a`

- **Line:** 212
  - **Kind:** `jsx-text`
  - **Original:** "如何判斷這是不是需要關注的議題？"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.如何判斷這是不是需要關注的議題`

- **Line:** 217
  - **Kind:** `jsx-text`
  - **Original:** "你是否在相關產業工作？如果是，可以適度關注產業動態"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.你是否在相關產業工作_如果是_可以適度關注產業動態`

- **Line:** 218
  - **Kind:** `jsx-text`
  - **Original:** "你近期是否有大額消費計畫（如買車、大型家電）？如果是，可以關注相關商品價格變化"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.你近期是否有大額消費計畫_如買車_大型家電_如果是_可以關注相關商品價`

- **Line:** 219
  - **Kind:** `jsx-text`
  - **Original:** "你對貿易政策或國際關係有興趣嗎？如果是，可以作為了解時事的參考"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.你對貿易政策或國際關係有興趣嗎_如果是_可以作為了解時事的參考`

- **Line:** 220
  - **Kind:** `jsx-text`
  - **Original:** "如果以上都不是，通常不需要特別關注，保持平常心即可"
  - **Suggested key:** `blog.taiwan-us-tariff-explained.如果以上都不是_通常不需要特別關注_保持平常心即可`

- **Line:** 229
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.taiwan-us-tariff-explained.提醒`

### `src/pages/blog/minimum-wage-explained.tsx`（28 筆）

- **Line:** 42
  - **Kind:** `seo-title`
  - **Original:** "什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？"
  - **Suggested key:** `blog.minimum-wage-explained.什麼是基本工資_調整後老闆與員工各自會遇到什麼影響`

- **Line:** 42
  - **Kind:** `seo-description`
  - **Original:** "基本工資完整解析：了解基本工資的定義、為什麼每年會調整，以及對月薪制、時薪制的實際差異，用一般上班族看得懂的方式說明。"
  - **Suggested key:** `blog.minimum-wage-explained.基本工資完整解析_了解基本工資的定義_為什麼每年會調整_以及對月薪制_時`

- **Line:** 42
  - **Kind:** `seo-keywords`
  - **Original:** "基本工資, 最低工資, 月薪制, 時薪制, 政策解釋"
  - **Suggested key:** `blog.minimum-wage-explained.基本工資_最低工資_月薪制_時薪制_政策解釋`

- **Line:** 43
  - **Kind:** `attr:title`
  - **Original:** "什麼是基本工資？調整後老闆與員工各自會遇到什麼影響？"
  - **Suggested key:** `blog.minimum-wage-explained.什麼是基本工資_調整後老闆與員工各自會遇到什麼影響`

- **Line:** 44
  - **Kind:** `attr:description`
  - **Original:** "基本工資完整解析：了解基本工資的定義、為什麼每年會調整，以及對月薪制、時薪制的實際差異，用一般上班族看得懂的方式說明。"
  - **Suggested key:** `blog.minimum-wage-explained.基本工資完整解析_了解基本工資的定義_為什麼每年會調整_以及對月薪制_時`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "什麼是基本工資？"
  - **Suggested key:** `blog.minimum-wage-explained.什麼是基本工資`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "月薪制基本工資"
  - **Suggested key:** `blog.minimum-wage-explained.月薪制基本工資`

- **Line:** 86
  - **Kind:** `jsx-text`
  - **Original:** "時薪制基本工資"
  - **Suggested key:** `blog.minimum-wage-explained.時薪制基本工資`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "為什麼每年會調整？"
  - **Suggested key:** `blog.minimum-wage-explained.為什麼每年會調整`

- **Line:** 97
  - **Kind:** `jsx-text`
  - **Original:** "物價上漲"
  - **Suggested key:** `blog.minimum-wage-explained.物價上漲`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "經濟成長"
  - **Suggested key:** `blog.minimum-wage-explained.經濟成長`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "就業市場狀況"
  - **Suggested key:** `blog.minimum-wage-explained.就業市場狀況`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "對月薪制、時薪制的實際差異"
  - **Suggested key:** `blog.minimum-wage-explained.對月薪制_時薪制的實際差異`

- **Line:** 109
  - **Kind:** `jsx-text`
  - **Original:** "月薪制員工："
  - **Suggested key:** `blog.minimum-wage-explained.月薪制員工`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "如果你的月薪已經高於基本工資，調整後通常不會直接影響你的薪水"
  - **Suggested key:** `blog.minimum-wage-explained.如果你的月薪已經高於基本工資_調整後通常不會直接影響你的薪水`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "但如果你的月薪剛好在基本工資邊緣，調整後雇主必須跟著調高"
  - **Suggested key:** `blog.minimum-wage-explained.但如果你的月薪剛好在基本工資邊緣_調整後雇主必須跟著調高`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "有些公司會因為基本工資調整，連帶調整其他員工的薪水，維持內部薪資結構"
  - **Suggested key:** `blog.minimum-wage-explained.有些公司會因為基本工資調整_連帶調整其他員工的薪水_維持內部薪資結構`

- **Line:** 117
  - **Kind:** `jsx-text`
  - **Original:** "時薪制員工："
  - **Suggested key:** `blog.minimum-wage-explained.時薪制員工`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "時薪制基本工資調整後，你的時薪必須至少達到新標準"
  - **Suggested key:** `blog.minimum-wage-explained.時薪制基本工資調整後_你的時薪必須至少達到新標準`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "這對兼職、工讀生、服務業等按時計薪的工作影響最直接"
  - **Suggested key:** `blog.minimum-wage-explained.這對兼職_工讀生_服務業等按時計薪的工作影響最直接`

- **Line:** 122
  - **Kind:** `jsx-text`
  - **Original:** "如果原本時薪低於新標準，雇主必須立即調高"
  - **Suggested key:** `blog.minimum-wage-explained.如果原本時薪低於新標準_雇主必須立即調高`

- **Line:** 125
  - **Kind:** `jsx-text`
  - **Original:** "一般勞工最關心的 3 個問題"
  - **Suggested key:** `blog.minimum-wage-explained.一般勞工最關心的_3_個問題`

- **Line:** 128
  - **Kind:** `jsx-text`
  - **Original:** "Q1：基本工資調整後，我的薪水會自動調高嗎？"
  - **Suggested key:** `blog.minimum-wage-explained.q1_基本工資調整後_我的薪水會自動調高嗎`

- **Line:** 135
  - **Kind:** `jsx-text`
  - **Original:** "Q2：基本工資調整會影響加班費嗎？"
  - **Suggested key:** `blog.minimum-wage-explained.q2_基本工資調整會影響加班費嗎`

- **Line:** 142
  - **Kind:** `jsx-text`
  - **Original:** "Q3：如果雇主沒有調高到基本工資標準，該怎麼辦？"
  - **Suggested key:** `blog.minimum-wage-explained.q3_如果雇主沒有調高到基本工資標準_該怎麼辦`

- **Line:** 147
  - **Kind:** `jsx-text`
  - **Original:** "向勞動部或地方勞工局申訴"
  - **Suggested key:** `blog.minimum-wage-explained.向勞動部或地方勞工局申訴`

- **Line:** 148
  - **Kind:** `jsx-text`
  - **Original:** "要求雇主補足差額"
  - **Suggested key:** `blog.minimum-wage-explained.要求雇主補足差額`

- **Line:** 149
  - **Kind:** `jsx-text`
  - **Original:** "如果雇主不配合，可以申請勞資爭議調解或提起訴訟"
  - **Suggested key:** `blog.minimum-wage-explained.如果雇主不配合_可以申請勞資爭議調解或提起訴訟`

### `src/pages/blog/minimum-wage-impact-explained.tsx`（28 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？"
  - **Suggested key:** `blog.minimum-wage-impact-explained.基本工資是什麼_為什麼調整後有人加薪_有人卻更辛苦`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "基本工資調整影響完整解析：用白話方式說明基本工資的設計目的，調整後對不同身分的實際影響，以及為什麼不是所有人都直接受惠。"
  - **Suggested key:** `blog.minimum-wage-impact-explained.基本工資調整影響完整解析_用白話方式說明基本工資的設計目的_調整後對不同`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "基本工資, 最低工資, 工資調整, 政策解釋"
  - **Suggested key:** `blog.minimum-wage-impact-explained.基本工資_最低工資_工資調整_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "基本工資是什麼？為什麼調整後有人加薪、有人卻更辛苦？"
  - **Suggested key:** `blog.minimum-wage-impact-explained.基本工資是什麼_為什麼調整後有人加薪_有人卻更辛苦`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "基本工資調整影響完整解析：用白話方式說明基本工資的設計目的，調整後對不同身分的實際影響，以及為什麼不是所有人都直接受惠。"
  - **Suggested key:** `blog.minimum-wage-impact-explained.基本工資調整影響完整解析_用白話方式說明基本工資的設計目的_調整後對不同`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "基本工資的設計目的"
  - **Suggested key:** `blog.minimum-wage-impact-explained.基本工資的設計目的`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "保障基本生活"
  - **Suggested key:** `blog.minimum-wage-impact-explained.保障基本生活`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "調整物價影響"
  - **Suggested key:** `blog.minimum-wage-impact-explained.調整物價影響`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "減少低薪問題"
  - **Suggested key:** `blog.minimum-wage-impact-explained.減少低薪問題`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "維持社會穩定"
  - **Suggested key:** `blog.minimum-wage-impact-explained.維持社會穩定`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "調整後對不同身分的實際影響"
  - **Suggested key:** `blog.minimum-wage-impact-explained.調整後對不同身分的實際影響`

- **Line:** 68
  - **Kind:** `jsx-text`
  - **Original:** "時薪制勞工："
  - **Suggested key:** `blog.minimum-wage-impact-explained.時薪制勞工`

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "月薪制勞工："
  - **Suggested key:** `blog.minimum-wage-impact-explained.月薪制勞工`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "雇主（特別是中小企業）："
  - **Suggested key:** `blog.minimum-wage-impact-explained.雇主_特別是中小企業`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "成本增加，但收入沒有增加"
  - **Suggested key:** `blog.minimum-wage-impact-explained.成本增加_但收入沒有增加`

- **Line:** 84
  - **Kind:** `jsx-text`
  - **Original:** "可能需要減少人力或調整經營模式"
  - **Suggested key:** `blog.minimum-wage-impact-explained.可能需要減少人力或調整經營模式`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "如果無法吸收成本，可能會影響公司營運"
  - **Suggested key:** `blog.minimum-wage-impact-explained.如果無法吸收成本_可能會影響公司營運`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "為什麼不是所有人都直接受惠？"
  - **Suggested key:** `blog.minimum-wage-impact-explained.為什麼不是所有人都直接受惠`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "只影響低薪勞工"
  - **Suggested key:** `blog.minimum-wage-impact-explained.只影響低薪勞工`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "成本壓力轉移"
  - **Suggested key:** `blog.minimum-wage-impact-explained.成本壓力轉移`

- **Line:** 95
  - **Kind:** `jsx-text`
  - **Original:** "產業差異"
  - **Suggested key:** `blog.minimum-wage-impact-explained.產業差異`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "地區差異"
  - **Suggested key:** `blog.minimum-wage-impact-explained.地區差異`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "常見社會誤解一次說清楚"
  - **Suggested key:** `blog.minimum-wage-impact-explained.常見社會誤解一次說清楚`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "誤解一：基本工資調整，所有人都會加薪"
  - **Suggested key:** `blog.minimum-wage-impact-explained.誤解一_基本工資調整_所有人都會加薪`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "誤解二：基本工資調整會讓物價上漲"
  - **Suggested key:** `blog.minimum-wage-impact-explained.誤解二_基本工資調整會讓物價上漲`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "誤解三：基本工資調整會讓企業倒閉"
  - **Suggested key:** `blog.minimum-wage-impact-explained.誤解三_基本工資調整會讓企業倒閉`

- **Line:** 126
  - **Kind:** `jsx-text`
  - **Original:** "誤解四：基本工資調整會減少就業機會"
  - **Suggested key:** `blog.minimum-wage-impact-explained.誤解四_基本工資調整會減少就業機會`

- **Line:** 134
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.minimum-wage-impact-explained.提醒`

### `src/pages/tools/ImageResize.tsx`（28 筆）

- **Line:** 877
  - **Kind:** `seo-title`
  - **Original:** "圖片尺寸調整｜IG、YouTube、蝦皮預設與自訂寬高｜RxV"
  - **Suggested key:** `tools.ImageResize.圖片尺寸調整_ig_youtube_蝦皮預設與自訂寬高_rxv`

- **Line:** 877
  - **Kind:** `seo-description`
  - **Original:** "線上裁切、補白與多平台預設尺寸（IG、Shorts、蝦皮等），瀏覽器即可完成。完成後可再接圖片壓縮與 QR 分享。"
  - **Suggested key:** `tools.ImageResize.線上裁切_補白與多平台預設尺寸_ig_shorts_蝦皮等_瀏覽器即可`

- **Line:** 877
  - **Kind:** `seo-keywords`
  - **Original:** "圖片尺寸調整, IG圖片尺寸, YouTube縮圖尺寸, 蝦皮圖片尺寸, TikTok尺寸, 圖片尺寸工具"
  - **Suggested key:** `tools.ImageResize.圖片尺寸調整_ig圖片尺寸_youtube縮圖尺寸_蝦皮圖片尺寸`

- **Line:** 591
  - **Kind:** `jsx-text`
  - **Original:** "輸出尺寸（寬 × 高）"
  - **Suggested key:** `tools.ImageResize.輸出尺寸_寬_高`

- **Line:** 602
  - **Kind:** `attr:aria-label`
  - **Original:** "輸出寬度"
  - **Suggested key:** `tools.ImageResize.輸出寬度`

- **Line:** 613
  - **Kind:** `attr:aria-label`
  - **Original:** "輸出高度"
  - **Suggested key:** `tools.ImageResize.輸出高度`

- **Line:** 724
  - **Kind:** `jsx-text`
  - **Original:** "已預設勾選常用平台尺寸"
  - **Suggested key:** `tools.ImageResize.已預設勾選常用平台尺寸`

- **Line:** 773
  - **Kind:** `jsx-text`
  - **Original:** "請先勾選尺寸"
  - **Suggested key:** `tools.ImageResize.請先勾選尺寸`

- **Line:** 878
  - **Kind:** `attr:title`
  - **Original:** "圖片尺寸調整｜IG、YouTube、蝦皮預設與自訂寬高｜RxV"
  - **Suggested key:** `tools.ImageResize.圖片尺寸調整_ig_youtube_蝦皮預設與自訂寬高_rxv`

- **Line:** 879
  - **Kind:** `attr:description`
  - **Original:** "線上裁切、補白與多平台預設尺寸（IG、Shorts、蝦皮等），瀏覽器即可完成。完成後可再接圖片壓縮與 QR 分享。"
  - **Suggested key:** `tools.ImageResize.線上裁切_補白與多平台預設尺寸_ig_shorts_蝦皮等_瀏覽器即可`

- **Line:** 894
  - **Kind:** `jsx-text`
  - **Original:** "圖片尺寸調整工具（免費）｜AI工具推薦"
  - **Suggested key:** `tools.ImageResize.圖片尺寸調整工具_免費_ai工具推薦`

- **Line:** 896
  - **Kind:** `jsx-text`
  - **Original:** "適合誰用："
  - **Suggested key:** `tools.ImageResize.適合誰用`

- **Line:** 997
  - **Kind:** `jsx-text`
  - **Original:** "如何使用此工具？"
  - **Suggested key:** `tools.ImageResize.如何使用此工具`

- **Line:** 1002
  - **Kind:** `jsx-text`
  - **Original:** "使用步驟"
  - **Suggested key:** `tools.ImageResize.使用步驟`

- **Line:** 1004
  - **Kind:** `jsx-text`
  - **Original:** "上傳圖片"
  - **Suggested key:** `tools.ImageResize.上傳圖片`

- **Line:** 1005
  - **Kind:** `jsx-text`
  - **Original:** "選擇平台尺寸或自訂尺寸"
  - **Suggested key:** `tools.ImageResize.選擇平台尺寸或自訂尺寸`

- **Line:** 1006
  - **Kind:** `jsx-text`
  - **Original:** "選擇裁切或補白模式"
  - **Suggested key:** `tools.ImageResize.選擇裁切或補白模式`

- **Line:** 1007
  - **Kind:** `jsx-text`
  - **Original:** "下載圖片"
  - **Suggested key:** `tools.ImageResize.下載圖片`

- **Line:** 1010
  - **Kind:** `jsx-text`
  - **Original:** "適合使用情境"
  - **Suggested key:** `tools.ImageResize.適合使用情境`

- **Line:** 1012
  - **Kind:** `jsx-text`
  - **Original:** "Instagram 貼文"
  - **Suggested key:** `tools.ImageResize.instagram_貼文`

- **Line:** 1013
  - **Kind:** `jsx-text`
  - **Original:** "YouTube 縮圖"
  - **Suggested key:** `tools.ImageResize.youtube_縮圖`

- **Line:** 1014
  - **Kind:** `jsx-text`
  - **Original:** "TikTok 影片封面"
  - **Suggested key:** `tools.ImageResize.tiktok_影片封面`

- **Line:** 1049
  - **Kind:** `jsx-text`
  - **Original:** "什麼是圖片尺寸調整工具？"
  - **Suggested key:** `tools.ImageResize.什麼是圖片尺寸調整工具`

- **Line:** 1054
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.ImageResize.為什麼使用這個工具`

- **Line:** 1056
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.ImageResize.免費使用`

- **Line:** 1057
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.ImageResize.不需安裝`

- **Line:** 1058
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.ImageResize.支援快速處理`

- **Line:** 1061
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `tools.ImageResize.相關工具`

### `src/pages/blog/long-term-care-subsidy-explained.tsx`（27 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.長照補助是什麼_家裡有人需要時_政府實際能幫到哪裡`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "長照補助完整解析：用一般家庭能理解的方式說明長照補助在補什麼，哪些人比較容易符合，以及為什麼很多家庭一開始都不知道能申請。"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.長照補助完整解析_用一般家庭能理解的方式說明長照補助在補什麼_哪些人比較`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "長照補助, 長期照顧, 長照服務, 政策解釋"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.長照補助_長期照顧_長照服務_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "長照補助是什麼？家裡有人需要時，政府實際能幫到哪裡？"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.長照補助是什麼_家裡有人需要時_政府實際能幫到哪裡`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "長照補助完整解析：用一般家庭能理解的方式說明長照補助在補什麼，哪些人比較容易符合，以及為什麼很多家庭一開始都不知道能申請。"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.長照補助完整解析_用一般家庭能理解的方式說明長照補助在補什麼_哪些人比較`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "長照補助在補什麼？"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.長照補助在補什麼`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "照顧服務"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.照顧服務`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "喘息服務"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.喘息服務`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "輔具補助"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.輔具補助`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "居家無障礙環境改善"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.居家無障礙環境改善`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "交通接送"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.交通接送`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "哪些人比較容易符合？"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.哪些人比較容易符合`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "65 歲以上失能老人"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.65_歲以上失能老人`

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "50 歲以上失智症患者"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.50_歲以上失智症患者`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "身心障礙者"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.身心障礙者`

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "55 歲以上原住民"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.55_歲以上原住民`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多家庭一開始都不知道能申請？"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.為什麼很多家庭一開始都不知道能申請`

- **Line:** 86
  - **Kind:** `jsx-text`
  - **Original:** "資訊不流通"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.資訊不流通`

- **Line:** 87
  - **Kind:** `jsx-text`
  - **Original:** "以為要很窮才能申請"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.以為要很窮才能申請`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "覺得申請很麻煩"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.覺得申請很麻煩`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "不知道去哪裡問"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.不知道去哪裡問`

- **Line:** 95
  - **Kind:** `jsx-text`
  - **Original:** "常見錯誤期待與實際差異"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.常見錯誤期待與實際差異`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "錯誤期待一：補助會全額負擔所有費用"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.錯誤期待一_補助會全額負擔所有費用`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "錯誤期待二：申請了馬上就可以用"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.錯誤期待二_申請了馬上就可以用`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "錯誤期待三：所有長照服務都可以補助"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.錯誤期待三_所有長照服務都可以補助`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "錯誤期待四：收入太高就不能申請"
  - **Suggested key:** `blog.long-term-care-subsidy-explained.錯誤期待四_收入太高就不能申請`

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.long-term-care-subsidy-explained.提醒`

### `src/pages/blog/MorningAffirmations.tsx`（27 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "☀️ 為什麼早晨肯定語如此重要？"
  - **Suggested key:** `blog.MorningAffirmations.為什麼早晨肯定語如此重要`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "💫 有效的肯定語三原則"
  - **Suggested key:** `blog.MorningAffirmations.有效的肯定語三原則`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 使用現在式："
  - **Suggested key:** `blog.MorningAffirmations.1_使用現在式`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 正面且具體："
  - **Suggested key:** `blog.MorningAffirmations.2_正面且具體`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 與個人價值連結："
  - **Suggested key:** `blog.MorningAffirmations.3_與個人價值連結`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "🌿 適合早晨的肯定語範例"
  - **Suggested key:** `blog.MorningAffirmations.適合早晨的肯定語範例`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "「我今天會以開放的心迎接所有可能性」"
  - **Suggested key:** `blog.MorningAffirmations.我今天會以開放的心迎接所有可能性`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "「我有能力處理今天遇到的任何挑戰」"
  - **Suggested key:** `blog.MorningAffirmations.我有能力處理今天遇到的任何挑戰`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "「我值得擁有平靜、快樂與成功」"
  - **Suggested key:** `blog.MorningAffirmations.我值得擁有平靜_快樂與成功`

- **Line:** 53
  - **Kind:** `jsx-text`
  - **Original:** "「我對自己和他人展現善意與耐心」"
  - **Suggested key:** `blog.MorningAffirmations.我對自己和他人展現善意與耐心`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "「我選擇專注於當下，活出最好的自己」"
  - **Suggested key:** `blog.MorningAffirmations.我選擇專注於當下_活出最好的自己`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 如何進行早晨肯定語練習？"
  - **Suggested key:** `blog.MorningAffirmations.如何進行早晨肯定語練習`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "選擇安靜的時刻："
  - **Suggested key:** `blog.MorningAffirmations.選擇安靜的時刻`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "配合呼吸："
  - **Suggested key:** `blog.MorningAffirmations.配合呼吸`

- **Line:** 68
  - **Kind:** `jsx-text`
  - **Original:** "大聲說出來："
  - **Suggested key:** `blog.MorningAffirmations.大聲說出來`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "寫下來："
  - **Suggested key:** `blog.MorningAffirmations.寫下來`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "✨ 結語：讓肯定語成為你的早晨儀式"
  - **Suggested key:** `blog.MorningAffirmations.結語_讓肯定語成為你的早晨儀式`

- **Line:** 91
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.MorningAffirmations.english_version`

- **Line:** 92
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Are Morning Affirmations So Important?"
  - **Suggested key:** `blog.MorningAffirmations.why_are_morning_affirmations_so_impo`

- **Line:** 101
  - **Kind:** `jsx-text-en`
  - **Original:** "Three Principles of Effective Affirmations"
  - **Suggested key:** `blog.MorningAffirmations.three_principles_of_effective_affirm`

- **Line:** 120
  - **Kind:** `jsx-text-en`
  - **Original:** "Morning Affirmation Examples"
  - **Suggested key:** `blog.MorningAffirmations.morning_affirmation_examples`

- **Line:** 129
  - **Kind:** `jsx-text-en`
  - **Original:** "How to Practice Morning Affirmations"
  - **Suggested key:** `blog.MorningAffirmations.how_to_practice_morning_affirmations`

- **Line:** 132
  - **Kind:** `jsx-text-en`
  - **Original:** "Choose a Quiet Time:"
  - **Suggested key:** `blog.MorningAffirmations.choose_a_quiet_time`

- **Line:** 136
  - **Kind:** `jsx-text-en`
  - **Original:** "Combine with Breathing:"
  - **Suggested key:** `blog.MorningAffirmations.combine_with_breathing`

- **Line:** 140
  - **Kind:** `jsx-text-en`
  - **Original:** "Say It Aloud:"
  - **Suggested key:** `blog.MorningAffirmations.say_it_aloud`

- **Line:** 144
  - **Kind:** `jsx-text-en`
  - **Original:** "Write It Down:"
  - **Suggested key:** `blog.MorningAffirmations.write_it_down`

- **Line:** 149
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Let Affirmations Be Your Morning Ritual"
  - **Suggested key:** `blog.MorningAffirmations.conclusion_let_affirmations_be_your`

### `src/pages/blog/nhi-premium-explained.tsx`（27 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "健保費是怎麼算的？為什麼每個人繳的不一樣？"
  - **Suggested key:** `blog.nhi-premium-explained.健保費是怎麼算的_為什麼每個人繳的不一樣`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "健保費完整解析：用白話方式說明健保費的計算基礎，薪資、眷屬與補充保費的差別，以及一般人最常誤會的地方。"
  - **Suggested key:** `blog.nhi-premium-explained.健保費完整解析_用白話方式說明健保費的計算基礎_薪資_眷屬與補充保費的差`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "健保費, 健保, 補充保費, 政策解釋"
  - **Suggested key:** `blog.nhi-premium-explained.健保費_健保_補充保費_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "健保費是怎麼算的？為什麼每個人繳的不一樣？"
  - **Suggested key:** `blog.nhi-premium-explained.健保費是怎麼算的_為什麼每個人繳的不一樣`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "健保費完整解析：用白話方式說明健保費的計算基礎，薪資、眷屬與補充保費的差別，以及一般人最常誤會的地方。"
  - **Suggested key:** `blog.nhi-premium-explained.健保費完整解析_用白話方式說明健保費的計算基礎_薪資_眷屬與補充保費的差`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "健保費的計算基礎"
  - **Suggested key:** `blog.nhi-premium-explained.健保費的計算基礎`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "投保薪資"
  - **Suggested key:** `blog.nhi-premium-explained.投保薪資`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "費率"
  - **Suggested key:** `blog.nhi-premium-explained.費率`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "薪資、眷屬與補充保費的差別"
  - **Suggested key:** `blog.nhi-premium-explained.薪資_眷屬與補充保費的差別`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "一般保費（薪資計算）："
  - **Suggested key:** `blog.nhi-premium-explained.一般保費_薪資計算`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "投保薪資 × 費率 × 負擔比例（通常是 30%）"
  - **Suggested key:** `blog.nhi-premium-explained.投保薪資_費率_負擔比例_通常是_30`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "如果有眷屬，會加計眷屬的保費（但通常有上限）"
  - **Suggested key:** `blog.nhi-premium-explained.如果有眷屬_會加計眷屬的保費_但通常有上限`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "補充保費："
  - **Suggested key:** `blog.nhi-premium-explained.補充保費`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "補充保費的費率是 2.11%"
  - **Suggested key:** `blog.nhi-premium-explained.補充保費的費率是_2_11`

- **Line:** 84
  - **Kind:** `jsx-text`
  - **Original:** "只針對「超過 2 萬元」的部分計算"
  - **Suggested key:** `blog.nhi-premium-explained.只針對_超過_2_萬元_的部分計算`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "例如，如果你領了 5 萬元的獎金，補充保費就是：(50,000 - 20,000) × 2.11% = 約 633 元"
  - **Suggested key:** `blog.nhi-premium-explained.例如_如果你領了_5_萬元的獎金_補充保費就是_50_000_20`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "一般人最常誤會的地方"
  - **Suggested key:** `blog.nhi-premium-explained.一般人最常誤會的地方`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "誤會一：健保費是固定金額"
  - **Suggested key:** `blog.nhi-premium-explained.誤會一_健保費是固定金額`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "誤會二：投保薪資就是實際薪資"
  - **Suggested key:** `blog.nhi-premium-explained.誤會二_投保薪資就是實際薪資`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "誤會三：補充保費是額外收費"
  - **Suggested key:** `blog.nhi-premium-explained.誤會三_補充保費是額外收費`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "誤會四：有眷屬會讓保費變很多"
  - **Suggested key:** `blog.nhi-premium-explained.誤會四_有眷屬會讓保費變很多`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "為什麼有人覺得繳很多、有人卻沒感覺？"
  - **Suggested key:** `blog.nhi-premium-explained.為什麼有人覺得繳很多_有人卻沒感覺`

- **Line:** 123
  - **Kind:** `jsx-text`
  - **Original:** "高薪族"
  - **Suggested key:** `blog.nhi-premium-explained.高薪族`

- **Line:** 124
  - **Kind:** `jsx-text`
  - **Original:** "低薪族"
  - **Suggested key:** `blog.nhi-premium-explained.低薪族`

- **Line:** 125
  - **Kind:** `jsx-text`
  - **Original:** "有眷屬的人"
  - **Suggested key:** `blog.nhi-premium-explained.有眷屬的人`

- **Line:** 126
  - **Kind:** `jsx-text`
  - **Original:** "單身族"
  - **Suggested key:** `blog.nhi-premium-explained.單身族`

- **Line:** 134
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.nhi-premium-explained.提醒`

### `src/pages/tools/homework-helper.tsx`（27 筆）

- **Line:** 725
  - **Kind:** `seo-title`
  - **Original:** "作業解題助手｜步驟化解題與多語說明｜RxV"
  - **Suggested key:** `tools.homework-helper.作業解題助手_步驟化解題與多語說明_rxv`

- **Line:** 725
  - **Kind:** `seo-description`
  - **Original:** "貼上題目取得步驟化說明與觀念提示；線上使用、無需下載。請依課程規範使用 AI，並自行驗算與改寫。"
  - **Suggested key:** `tools.homework-helper.貼上題目取得步驟化說明與觀念提示_線上使用_無需下載_請依課程規範使用`

- **Line:** 725
  - **Kind:** `seo-keywords`
  - **Original:** "作業解題, AI 解題, 步驟說明, 免費工具"
  - **Suggested key:** `tools.homework-helper.作業解題_ai_解題_步驟說明_免費工具`

- **Line:** 726
  - **Kind:** `attr:title`
  - **Original:** "作業解題助手｜步驟化解題與多語說明｜RxV"
  - **Suggested key:** `tools.homework-helper.作業解題助手_步驟化解題與多語說明_rxv`

- **Line:** 727
  - **Kind:** `attr:description`
  - **Original:** "貼上題目取得步驟化說明與觀念提示；線上使用、無需下載。請依課程規範使用 AI，並自行驗算與改寫。"
  - **Suggested key:** `tools.homework-helper.貼上題目取得步驟化說明與觀念提示_線上使用_無需下載_請依課程規範使用`

- **Line:** 733
  - **Kind:** `jsx-text`
  - **Original:** "適合誰用：學生段考複習、證照題檢核、需要步驟說明而非只要答案時。"
  - **Suggested key:** `tools.homework-helper.適合誰用_學生段考複習_證照題檢核_需要步驟說明而非只要答案時`

- **Line:** 824
  - **Kind:** `jsx-text`
  - **Original:** "🎙 正在聽你說話…"
  - **Suggested key:** `tools.homework-helper.正在聽你說話`

- **Line:** 1154
  - **Kind:** `jsx-text`
  - **Original:** "如何使用此工具？"
  - **Suggested key:** `tools.homework-helper.如何使用此工具`

- **Line:** 1159
  - **Kind:** `jsx-text`
  - **Original:** "使用步驟"
  - **Suggested key:** `tools.homework-helper.使用步驟`

- **Line:** 1161
  - **Kind:** `jsx-text`
  - **Original:** "貼上題目"
  - **Suggested key:** `tools.homework-helper.貼上題目`

- **Line:** 1162
  - **Kind:** `jsx-text`
  - **Original:** "生成解題說明"
  - **Suggested key:** `tools.homework-helper.生成解題說明`

- **Line:** 1163
  - **Kind:** `jsx-text`
  - **Original:** "檢查步驟"
  - **Suggested key:** `tools.homework-helper.檢查步驟`

- **Line:** 1166
  - **Kind:** `jsx-text`
  - **Original:** "適合使用情境"
  - **Suggested key:** `tools.homework-helper.適合使用情境`

- **Line:** 1168
  - **Kind:** `jsx-text`
  - **Original:** "數學作業"
  - **Suggested key:** `tools.homework-helper.數學作業`

- **Line:** 1169
  - **Kind:** `jsx-text`
  - **Original:** "理科題目"
  - **Suggested key:** `tools.homework-helper.理科題目`

- **Line:** 1170
  - **Kind:** `jsx-text`
  - **Original:** "課後複習"
  - **Suggested key:** `tools.homework-helper.課後複習`

- **Line:** 1327
  - **Kind:** `jsx-text`
  - **Original:** "什麼是作業解題工具？"
  - **Suggested key:** `tools.homework-helper.什麼是作業解題工具`

- **Line:** 1332
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.homework-helper.為什麼使用這個工具`

- **Line:** 1334
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.homework-helper.免費使用`

- **Line:** 1335
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.homework-helper.不需安裝`

- **Line:** 1336
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.homework-helper.支援快速處理`

- **Line:** 1339
  - **Kind:** `jsx-text`
  - **Original:** "常見使用情境"
  - **Suggested key:** `tools.homework-helper.常見使用情境`

- **Line:** 1341
  - **Kind:** `jsx-text`
  - **Original:** "段考與證照題：需要拆解步驟、比對自己是否算錯。"
  - **Suggested key:** `tools.homework-helper.段考與證照題_需要拆解步驟_比對自己是否算錯`

- **Line:** 1342
  - **Kind:** `jsx-text`
  - **Original:** "申論與報告：先釐清題意再自行組織論點，避免直接交 AI 全文。"
  - **Suggested key:** `tools.homework-helper.申論與報告_先釐清題意再自行組織論點_避免直接交_ai_全文`

- **Line:** 1343
  - **Kind:** `jsx-text`
  - **Original:** "語言切換：需英文／日文簡化說明時，可搭配語言按鈕理解後再重寫。"
  - **Suggested key:** `tools.homework-helper.語言切換_需英文_日文簡化說明時_可搭配語言按鈕理解後再重寫`

- **Line:** 1345
  - **Kind:** `jsx-text`
  - **Original:** "推薦搭配工具"
  - **Suggested key:** `tools.homework-helper.推薦搭配工具`

- **Line:** 1362
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `tools.homework-helper.相關工具`

### `src/pages/blog/free-ai-tools.tsx`（26 筆）

- **Line:** 41
  - **Kind:** `seo-title`
  - **Original:** "免費 AI工具教學｜免費 AI 工具推薦、AI摘要與解題指南"
  - **Suggested key:** `blog.free-ai-tools.免費_ai工具教學_免費_ai_工具推薦_ai摘要與解題指南`

- **Line:** 41
  - **Kind:** `seo-description`
  - **Original:** "本篇免費 AI工具教學整理 AI摘要、作業解題、QR 與圖片調整實戰流程，提供新手可直接套用的步驟、FAQ 與工具入口，快速建立穩定效率。"
  - **Suggested key:** `blog.free-ai-tools.本篇免費_ai工具教學整理_ai摘要_作業解題_qr_與圖片調整實戰流程`

- **Line:** 41
  - **Kind:** `seo-keywords`
  - **Original:** "AI工具, 免費AI工具, AI摘要教學, 作業解題, 效率工具"
  - **Suggested key:** `blog.free-ai-tools.ai工具_免費ai工具_ai摘要教學_作業解題_效率工具`

- **Line:** 42
  - **Kind:** `attr:title`
  - **Original:** "免費 AI工具教學｜免費 AI 工具推薦、AI摘要與解題指南"
  - **Suggested key:** `blog.free-ai-tools.免費_ai工具教學_免費_ai_工具推薦_ai摘要與解題指南`

- **Line:** 43
  - **Kind:** `attr:description`
  - **Original:** "本篇免費 AI工具教學整理 AI摘要、作業解題、QR 與圖片調整實戰流程，提供新手可直接套用的步驟、FAQ 與工具入口，快速建立穩定效率。"
  - **Suggested key:** `blog.free-ai-tools.本篇免費_ai工具教學整理_ai摘要_作業解題_qr_與圖片調整實戰流程`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "免費 AI 工具推薦：從 AI摘要到作業解題一次上手"
  - **Suggested key:** `blog.free-ai-tools.免費_ai_工具推薦_從_ai摘要到作業解題一次上手`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "目錄"
  - **Suggested key:** `blog.free-ai-tools.目錄`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "為什麼先選免費AI工具"
  - **Suggested key:** `blog.free-ai-tools.為什麼先選免費ai工具`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "常見三大 AI工具使用情境"
  - **Suggested key:** `blog.free-ai-tools.常見三大_ai工具使用情境`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "如何避免只用工具卻沒有產出"
  - **Suggested key:** `blog.free-ai-tools.如何避免只用工具卻沒有產出`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "快速開始入口與實測"
  - **Suggested key:** `blog.free-ai-tools.快速開始入口與實測`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "常見問題 FAQ"
  - **Suggested key:** `blog.free-ai-tools.常見問題_faq`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "為什麼先選免費AI工具"
  - **Suggested key:** `blog.free-ai-tools.為什麼先選免費ai工具`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "常見三大 AI工具使用情境"
  - **Suggested key:** `blog.free-ai-tools.常見三大_ai工具使用情境`

- **Line:** 86
  - **Kind:** `jsx-text`
  - **Original:** "如何避免只用工具卻沒有產出"
  - **Suggested key:** `blog.free-ai-tools.如何避免只用工具卻沒有產出`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "快速開始：先從這三個入口測試"
  - **Suggested key:** `blog.free-ai-tools.快速開始_先從這三個入口測試`

- **Line:** 95
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `blog.free-ai-tools.ai摘要工具`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "作業解題工具"
  - **Suggested key:** `blog.free-ai-tools.作業解題工具`

- **Line:** 97
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 產生器"
  - **Suggested key:** `blog.free-ai-tools.qr_code_產生器`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "FAQ：免費 AI工具入門常見問題"
  - **Suggested key:** `blog.free-ai-tools.faq_免費_ai工具入門常見問題`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "Q1：免費AI工具真的夠用嗎？"
  - **Suggested key:** `blog.free-ai-tools.q1_免費ai工具真的夠用嗎`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "A：對大多數日常任務很夠用，重點是先建立流程。當你把 AI工具用在固定場景，免費版本也能產生高價值成果。"
  - **Suggested key:** `blog.free-ai-tools.a_對大多數日常任務很夠用_重點是先建立流程_當你把_ai工具用在固定場`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "Q2：要先學哪一個工具？"
  - **Suggested key:** `blog.free-ai-tools.q2_要先學哪一個工具`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "A：建議先從 AI摘要開始，再接作業解題與 QR 分發，這條路徑最容易看到產出。"
  - **Suggested key:** `blog.free-ai-tools.a_建議先從_ai摘要開始_再接作業解題與_qr_分發_這條路徑最容易看`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "Q3：如何避免內容品質不穩？"
  - **Suggested key:** `blog.free-ai-tools.q3_如何避免內容品質不穩`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "A：先定義輸出格式，再做二次提問與結果驗證，這是免費AI工具穩定輸出的核心做法。"
  - **Suggested key:** `blog.free-ai-tools.a_先定義輸出格式_再做二次提問與結果驗證_這是免費ai工具穩定輸出的核`

### `src/pages/blog/hsr-booking-system-explained.tsx`（26 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "高鐵訂票為什麼這麼難？售票制度是怎麼設計的？"
  - **Suggested key:** `blog.hsr-booking-system-explained.高鐵訂票為什麼這麼難_售票制度是怎麼設計的`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "高鐵訂票制度完整解析：用白話方式說明為什麼一開賣就容易滿，系統怎麼分配座位，以及為什麼不是先來先得這麼簡單。"
  - **Suggested key:** `blog.hsr-booking-system-explained.高鐵訂票制度完整解析_用白話方式說明為什麼一開賣就容易滿_系統怎麼分配座`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "高鐵訂票, 高鐵售票, 高鐵系統, 政策解釋"
  - **Suggested key:** `blog.hsr-booking-system-explained.高鐵訂票_高鐵售票_高鐵系統_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "高鐵訂票為什麼這麼難？售票制度是怎麼設計的？"
  - **Suggested key:** `blog.hsr-booking-system-explained.高鐵訂票為什麼這麼難_售票制度是怎麼設計的`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "高鐵訂票制度完整解析：用白話方式說明為什麼一開賣就容易滿，系統怎麼分配座位，以及為什麼不是先來先得這麼簡單。"
  - **Suggested key:** `blog.hsr-booking-system-explained.高鐵訂票制度完整解析_用白話方式說明為什麼一開賣就容易滿_系統怎麼分配座`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "為什麼一開賣就容易滿？"
  - **Suggested key:** `blog.hsr-booking-system-explained.為什麼一開賣就容易滿`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "需求量遠超過供給量"
  - **Suggested key:** `blog.hsr-booking-system-explained.需求量遠超過供給量`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "集中時段需求"
  - **Suggested key:** `blog.hsr-booking-system-explained.集中時段需求`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "提前訂票的習慣"
  - **Suggested key:** `blog.hsr-booking-system-explained.提前訂票的習慣`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "系統負載限制"
  - **Suggested key:** `blog.hsr-booking-system-explained.系統負載限制`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "系統怎麼分配座位？"
  - **Suggested key:** `blog.hsr-booking-system-explained.系統怎麼分配座位`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "優先保留座位"
  - **Suggested key:** `blog.hsr-booking-system-explained.優先保留座位`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "座位類型分配"
  - **Suggested key:** `blog.hsr-booking-system-explained.座位類型分配`

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "連號座位優先"
  - **Suggested key:** `blog.hsr-booking-system-explained.連號座位優先`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "班次平衡"
  - **Suggested key:** `blog.hsr-booking-system-explained.班次平衡`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "為什麼不是先來先得這麼簡單？"
  - **Suggested key:** `blog.hsr-booking-system-explained.為什麼不是先來先得這麼簡單`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "不公平問題"
  - **Suggested key:** `blog.hsr-booking-system-explained.不公平問題`

- **Line:** 86
  - **Kind:** `jsx-text`
  - **Original:** "系統負載問題"
  - **Suggested key:** `blog.hsr-booking-system-explained.系統負載問題`

- **Line:** 87
  - **Kind:** `jsx-text`
  - **Original:** "座位使用效率"
  - **Suggested key:** `blog.hsr-booking-system-explained.座位使用效率`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "服務公平性"
  - **Suggested key:** `blog.hsr-booking-system-explained.服務公平性`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "一般人應有的正確期待"
  - **Suggested key:** `blog.hsr-booking-system-explained.一般人應有的正確期待`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "提前規劃很重要"
  - **Suggested key:** `blog.hsr-booking-system-explained.提前規劃很重要`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "彈性安排時間"
  - **Suggested key:** `blog.hsr-booking-system-explained.彈性安排時間`

- **Line:** 101
  - **Kind:** `jsx-text`
  - **Original:** "了解系統運作"
  - **Suggested key:** `blog.hsr-booking-system-explained.了解系統運作`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "保持耐心"
  - **Suggested key:** `blog.hsr-booking-system-explained.保持耐心`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.hsr-booking-system-explained.提醒`

### `src/pages/blog/policy-design-reality-explained.tsx`（26 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "為什麼政策看起來對你好，實際卻無感？制度設計的現實原因"
  - **Suggested key:** `blog.policy-design-reality-explained.為什麼政策看起來對你好_實際卻無感_制度設計的現實原因`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "政策設計現實解析：用白話方式說明政策設計的取捨邏輯，為什麼不可能人人都直接受惠，以及一般民眾該怎麼看政策比較不焦慮。"
  - **Suggested key:** `blog.policy-design-reality-explained.政策設計現實解析_用白話方式說明政策設計的取捨邏輯_為什麼不可能人人都直`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "政策設計, 政策影響, 政策解釋"
  - **Suggested key:** `blog.policy-design-reality-explained.政策設計_政策影響_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "為什麼政策看起來對你好，實際卻無感？制度設計的現實原因"
  - **Suggested key:** `blog.policy-design-reality-explained.為什麼政策看起來對你好_實際卻無感_制度設計的現實原因`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "政策設計現實解析：用白話方式說明政策設計的取捨邏輯，為什麼不可能人人都直接受惠，以及一般民眾該怎麼看政策比較不焦慮。"
  - **Suggested key:** `blog.policy-design-reality-explained.政策設計現實解析_用白話方式說明政策設計的取捨邏輯_為什麼不可能人人都直`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "政策設計的取捨邏輯"
  - **Suggested key:** `blog.policy-design-reality-explained.政策設計的取捨邏輯`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "資源有限"
  - **Suggested key:** `blog.policy-design-reality-explained.資源有限`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "公平性考量"
  - **Suggested key:** `blog.policy-design-reality-explained.公平性考量`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "執行可行性"
  - **Suggested key:** `blog.policy-design-reality-explained.執行可行性`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "政策目標"
  - **Suggested key:** `blog.policy-design-reality-explained.政策目標`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "為什麼不可能人人都直接受惠？"
  - **Suggested key:** `blog.policy-design-reality-explained.為什麼不可能人人都直接受惠`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "原因一：資源有限"
  - **Suggested key:** `blog.policy-design-reality-explained.原因一_資源有限`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "原因二：政策目標不同"
  - **Suggested key:** `blog.policy-design-reality-explained.原因二_政策目標不同`

- **Line:** 86
  - **Kind:** `jsx-text`
  - **Original:** "原因三：執行可行性"
  - **Suggested key:** `blog.policy-design-reality-explained.原因三_執行可行性`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "原因四：公平性考量"
  - **Suggested key:** `blog.policy-design-reality-explained.原因四_公平性考量`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "新聞與實際感受落差的原因"
  - **Suggested key:** `blog.policy-design-reality-explained.新聞與實際感受落差的原因`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "新聞標題誇大"
  - **Suggested key:** `blog.policy-design-reality-explained.新聞標題誇大`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "不了解適用對象"
  - **Suggested key:** `blog.policy-design-reality-explained.不了解適用對象`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "期待過高"
  - **Suggested key:** `blog.policy-design-reality-explained.期待過高`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "資訊不完整"
  - **Suggested key:** `blog.policy-design-reality-explained.資訊不完整`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "一般民眾該怎麼看政策比較不焦慮？"
  - **Suggested key:** `blog.policy-design-reality-explained.一般民眾該怎麼看政策比較不焦慮`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "不要只看新聞標題"
  - **Suggested key:** `blog.policy-design-reality-explained.不要只看新聞標題`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "了解政策目標"
  - **Suggested key:** `blog.policy-design-reality-explained.了解政策目標`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "不要期待過高"
  - **Suggested key:** `blog.policy-design-reality-explained.不要期待過高`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "理解取捨邏輯"
  - **Suggested key:** `blog.policy-design-reality-explained.理解取捨邏輯`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.policy-design-reality-explained.提醒`

### `src/pages/blog/subsidy-visibility-explained.tsx`（26 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "政府補助為什麼常常看不到？不是沒有，是你不在適用對象"
  - **Suggested key:** `blog.subsidy-visibility-explained.政府補助為什麼常常看不到_不是沒有_是你不在適用對象`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "政府補助可見性完整解析：用白話方式說明補助為什麼不是「全民型」，常見被排除的幾種身分情境，以及一般人該如何正確理解補助存在的方式。"
  - **Suggested key:** `blog.subsidy-visibility-explained.政府補助可見性完整解析_用白話方式說明補助為什麼不是_全民型_常見被排`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "政府補助, 補助適用對象, 補助排除, 政策解釋"
  - **Suggested key:** `blog.subsidy-visibility-explained.政府補助_補助適用對象_補助排除_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "政府補助為什麼常常看不到？不是沒有，是你不在適用對象"
  - **Suggested key:** `blog.subsidy-visibility-explained.政府補助為什麼常常看不到_不是沒有_是你不在適用對象`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "政府補助可見性完整解析：用白話方式說明補助為什麼不是「全民型」，常見被排除的幾種身分情境，以及一般人該如何正確理解補助存在的方式。"
  - **Suggested key:** `blog.subsidy-visibility-explained.政府補助可見性完整解析_用白話方式說明補助為什麼不是_全民型_常見被排`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "補助為什麼不是「全民型」？"
  - **Suggested key:** `blog.subsidy-visibility-explained.補助為什麼不是_全民型`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "資源有限"
  - **Suggested key:** `blog.subsidy-visibility-explained.資源有限`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "政策目標"
  - **Suggested key:** `blog.subsidy-visibility-explained.政策目標`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "公平性考量"
  - **Suggested key:** `blog.subsidy-visibility-explained.公平性考量`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "行政管理"
  - **Suggested key:** `blog.subsidy-visibility-explained.行政管理`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "常見被排除的幾種身分情境"
  - **Suggested key:** `blog.subsidy-visibility-explained.常見被排除的幾種身分情境`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "情境一：收入超過門檻"
  - **Suggested key:** `blog.subsidy-visibility-explained.情境一_收入超過門檻`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "情境二：財產超過限制"
  - **Suggested key:** `blog.subsidy-visibility-explained.情境二_財產超過限制`

- **Line:** 86
  - **Kind:** `jsx-text`
  - **Original:** "情境三：身分不符合"
  - **Suggested key:** `blog.subsidy-visibility-explained.情境三_身分不符合`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "情境四：戶籍不在指定地區"
  - **Suggested key:** `blog.subsidy-visibility-explained.情境四_戶籍不在指定地區`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "為什麼很多人覺得「政府都沒幫」？"
  - **Suggested key:** `blog.subsidy-visibility-explained.為什麼很多人覺得_政府都沒幫`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "補助不是「全民型」"
  - **Suggested key:** `blog.subsidy-visibility-explained.補助不是_全民型`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "資訊不流通"
  - **Suggested key:** `blog.subsidy-visibility-explained.資訊不流通`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "條件太嚴格"
  - **Suggested key:** `blog.subsidy-visibility-explained.條件太嚴格`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "期待過高"
  - **Suggested key:** `blog.subsidy-visibility-explained.期待過高`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "一般人該如何正確理解補助存在的方式"
  - **Suggested key:** `blog.subsidy-visibility-explained.一般人該如何正確理解補助存在的方式`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "補助不是「全民型」"
  - **Suggested key:** `blog.subsidy-visibility-explained.補助不是_全民型`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "要主動了解"
  - **Suggested key:** `blog.subsidy-visibility-explained.要主動了解`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "要看條件"
  - **Suggested key:** `blog.subsidy-visibility-explained.要看條件`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "要理解政策目標"
  - **Suggested key:** `blog.subsidy-visibility-explained.要理解政策目標`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.subsidy-visibility-explained.提醒`

### `src/pages/blog/ThreeMinuteMeditation.tsx`（25 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "⚡ 為什麼只需要三分鐘？"
  - **Suggested key:** `blog.ThreeMinuteMeditation.為什麼只需要三分鐘`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🧘 三分鐘冥想的三個步驟"
  - **Suggested key:** `blog.ThreeMinuteMeditation.三分鐘冥想的三個步驟`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "第一分鐘：覺察呼吸"
  - **Suggested key:** `blog.ThreeMinuteMeditation.第一分鐘_覺察呼吸`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "第二分鐘：身體掃描"
  - **Suggested key:** `blog.ThreeMinuteMeditation.第二分鐘_身體掃描`

- **Line:** 44
  - **Kind:** `jsx-text`
  - **Original:** "第三分鐘：回到當下"
  - **Suggested key:** `blog.ThreeMinuteMeditation.第三分鐘_回到當下`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "📱 何時進行三分鐘冥想？"
  - **Suggested key:** `blog.ThreeMinuteMeditation.何時進行三分鐘冥想`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "早晨醒來後："
  - **Suggested key:** `blog.ThreeMinuteMeditation.早晨醒來後`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "工作前："
  - **Suggested key:** `blog.ThreeMinuteMeditation.工作前`

- **Line:** 62
  - **Kind:** `jsx-text`
  - **Original:** "壓力來襲時："
  - **Suggested key:** `blog.ThreeMinuteMeditation.壓力來襲時`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "睡前："
  - **Suggested key:** `blog.ThreeMinuteMeditation.睡前`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "✨ 三分鐘冥想的好處"
  - **Suggested key:** `blog.ThreeMinuteMeditation.三分鐘冥想的好處`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "💫 結語：小步驟，大改變"
  - **Suggested key:** `blog.ThreeMinuteMeditation.結語_小步驟_大改變`

- **Line:** 92
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.ThreeMinuteMeditation.english_version`

- **Line:** 93
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Just Three Minutes?"
  - **Suggested key:** `blog.ThreeMinuteMeditation.why_just_three_minutes`

- **Line:** 100
  - **Kind:** `jsx-text-en`
  - **Original:** "Three Steps of Three-Minute Meditation"
  - **Suggested key:** `blog.ThreeMinuteMeditation.three_steps_of_three_minute_meditati`

- **Line:** 103
  - **Kind:** `jsx-text-en`
  - **Original:** "First Minute: Awareness of Breath"
  - **Suggested key:** `blog.ThreeMinuteMeditation.first_minute_awareness_of_breath`

- **Line:** 109
  - **Kind:** `jsx-text-en`
  - **Original:** "Second Minute: Body Scan"
  - **Suggested key:** `blog.ThreeMinuteMeditation.second_minute_body_scan`

- **Line:** 115
  - **Kind:** `jsx-text-en`
  - **Original:** "Third Minute: Return to Present"
  - **Suggested key:** `blog.ThreeMinuteMeditation.third_minute_return_to_present`

- **Line:** 122
  - **Kind:** `jsx-text-en`
  - **Original:** "When to Practice Three-Minute Meditation?"
  - **Suggested key:** `blog.ThreeMinuteMeditation.when_to_practice_three_minute_medita`

- **Line:** 125
  - **Kind:** `jsx-text-en`
  - **Original:** "After Waking:"
  - **Suggested key:** `blog.ThreeMinuteMeditation.after_waking`

- **Line:** 129
  - **Kind:** `jsx-text-en`
  - **Original:** "Before Work:"
  - **Suggested key:** `blog.ThreeMinuteMeditation.before_work`

- **Line:** 133
  - **Kind:** `jsx-text-en`
  - **Original:** "When Stress Hits:"
  - **Suggested key:** `blog.ThreeMinuteMeditation.when_stress_hits`

- **Line:** 137
  - **Kind:** `jsx-text-en`
  - **Original:** "Before Sleep:"
  - **Suggested key:** `blog.ThreeMinuteMeditation.before_sleep`

- **Line:** 142
  - **Kind:** `jsx-text-en`
  - **Original:** "Benefits of Three-Minute Meditation"
  - **Suggested key:** `blog.ThreeMinuteMeditation.benefits_of_three_minute_meditation`

- **Line:** 149
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Small Steps, Big Changes"
  - **Suggested key:** `blog.ThreeMinuteMeditation.conclusion_small_steps_big_changes`

### `src/pages/blog/AboutSpiritualGrowth.tsx`（24 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🪷 什麼是靈性成長？"
  - **Suggested key:** `blog.AboutSpiritualGrowth.什麼是靈性成長`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🌿 靈性成長的三個面向"
  - **Suggested key:** `blog.AboutSpiritualGrowth.靈性成長的三個面向`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 自我覺察："
  - **Suggested key:** `blog.AboutSpiritualGrowth.1_自我覺察`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 與當下連結："
  - **Suggested key:** `blog.AboutSpiritualGrowth.2_與當下連結`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 與更大的整體連結："
  - **Suggested key:** `blog.AboutSpiritualGrowth.3_與更大的整體連結`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 如何開始靈性成長的旅程？"
  - **Suggested key:** `blog.AboutSpiritualGrowth.如何開始靈性成長的旅程`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "從靜心開始："
  - **Suggested key:** `blog.AboutSpiritualGrowth.從靜心開始`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "培養覺察："
  - **Suggested key:** `blog.AboutSpiritualGrowth.培養覺察`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "閱讀與學習："
  - **Suggested key:** `blog.AboutSpiritualGrowth.閱讀與學習`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "實踐感恩："
  - **Suggested key:** `blog.AboutSpiritualGrowth.實踐感恩`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "與他人分享："
  - **Suggested key:** `blog.AboutSpiritualGrowth.與他人分享`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "✨ 靈性成長的誤解"
  - **Suggested key:** `blog.AboutSpiritualGrowth.靈性成長的誤解`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "💫 結語：在靜心中找到自己"
  - **Suggested key:** `blog.AboutSpiritualGrowth.結語_在靜心中找到自己`

- **Line:** 95
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.AboutSpiritualGrowth.english_version`

- **Line:** 96
  - **Kind:** `jsx-text-en`
  - **Original:** "What Is Spiritual Growth?"
  - **Suggested key:** `blog.AboutSpiritualGrowth.what_is_spiritual_growth`

- **Line:** 103
  - **Kind:** `jsx-text-en`
  - **Original:** "Three Aspects of Spiritual Growth"
  - **Suggested key:** `blog.AboutSpiritualGrowth.three_aspects_of_spiritual_growth`

- **Line:** 122
  - **Kind:** `jsx-text-en`
  - **Original:** "How to Start Your Spiritual Growth Journey?"
  - **Suggested key:** `blog.AboutSpiritualGrowth.how_to_start_your_spiritual_growth_j`

- **Line:** 125
  - **Kind:** `jsx-text-en`
  - **Original:** "Start with Stillness:"
  - **Suggested key:** `blog.AboutSpiritualGrowth.start_with_stillness`

- **Line:** 129
  - **Kind:** `jsx-text-en`
  - **Original:** "Cultivate Awareness:"
  - **Suggested key:** `blog.AboutSpiritualGrowth.cultivate_awareness`

- **Line:** 133
  - **Kind:** `jsx-text-en`
  - **Original:** "Read and Learn:"
  - **Suggested key:** `blog.AboutSpiritualGrowth.read_and_learn`

- **Line:** 137
  - **Kind:** `jsx-text-en`
  - **Original:** "Practice Gratitude:"
  - **Suggested key:** `blog.AboutSpiritualGrowth.practice_gratitude`

- **Line:** 141
  - **Kind:** `jsx-text-en`
  - **Original:** "Share with Others:"
  - **Suggested key:** `blog.AboutSpiritualGrowth.share_with_others`

- **Line:** 146
  - **Kind:** `jsx-text-en`
  - **Original:** "Misconceptions About Spiritual Growth"
  - **Suggested key:** `blog.AboutSpiritualGrowth.misconceptions_about_spiritual_growt`

- **Line:** 154
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Find Yourself in Stillness"
  - **Suggested key:** `blog.AboutSpiritualGrowth.conclusion_find_yourself_in_stillne`

### `src/pages/blog/college-entrance-exam-explained.tsx`（24 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？"
  - **Suggested key:** `blog.college-entrance-exam-explained.大學學測在考什麼_制度怎麼設計_跟以前聯考差在哪`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "大學學測完整解析：用一般家庭能理解的方式說明為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方。"
  - **Suggested key:** `blog.college-entrance-exam-explained.大學學測完整解析_用一般家庭能理解的方式說明為什麼會有學測_學測成績怎麼`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "大學學測, 學測制度, 聯考, 升學制度, 政策解釋"
  - **Suggested key:** `blog.college-entrance-exam-explained.大學學測_學測制度_聯考_升學制度_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "大學學測在考什麼？制度怎麼設計？跟以前聯考差在哪？"
  - **Suggested key:** `blog.college-entrance-exam-explained.大學學測在考什麼_制度怎麼設計_跟以前聯考差在哪`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "大學學測完整解析：用一般家庭能理解的方式說明為什麼會有學測，學測成績怎麼被使用，以及家長與學生最容易誤會的地方。"
  - **Suggested key:** `blog.college-entrance-exam-explained.大學學測完整解析_用一般家庭能理解的方式說明為什麼會有學測_學測成績怎麼`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "為什麼會有學測？"
  - **Suggested key:** `blog.college-entrance-exam-explained.為什麼會有學測`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "讓學生有更多機會選擇自己想要的科系"
  - **Suggested key:** `blog.college-entrance-exam-explained.讓學生有更多機會選擇自己想要的科系`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "減少「一次定終身」的壓力"
  - **Suggested key:** `blog.college-entrance-exam-explained.減少_一次定終身_的壓力`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "讓大學可以根據科系特色選擇適合的學生"
  - **Suggested key:** `blog.college-entrance-exam-explained.讓大學可以根據科系特色選擇適合的學生`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "降低只看分數、不看其他能力的問題"
  - **Suggested key:** `blog.college-entrance-exam-explained.降低只看分數_不看其他能力的問題`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "學測成績怎麼被使用？"
  - **Suggested key:** `blog.college-entrance-exam-explained.學測成績怎麼被使用`

- **Line:** 69
  - **Kind:** `jsx-text`
  - **Original:** "申請入學"
  - **Suggested key:** `blog.college-entrance-exam-explained.申請入學`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "繁星推薦"
  - **Suggested key:** `blog.college-entrance-exam-explained.繁星推薦`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "分發入學"
  - **Suggested key:** `blog.college-entrance-exam-explained.分發入學`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "家長與學生最容易誤會的地方"
  - **Suggested key:** `blog.college-entrance-exam-explained.家長與學生最容易誤會的地方`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "誤會一：學測成績高就一定上得了好大學"
  - **Suggested key:** `blog.college-entrance-exam-explained.誤會一_學測成績高就一定上得了好大學`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "誤會二：學測跟聯考一樣，只看分數"
  - **Suggested key:** `blog.college-entrance-exam-explained.誤會二_學測跟聯考一樣_只看分數`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "誤會三：學測沒考好就沒有機會了"
  - **Suggested key:** `blog.college-entrance-exam-explained.誤會三_學測沒考好就沒有機會了`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "誤會四：所有科系都用同一套標準"
  - **Suggested key:** `blog.college-entrance-exam-explained.誤會四_所有科系都用同一套標準`

- **Line:** 109
  - **Kind:** `jsx-text`
  - **Original:** "一般家庭該注意的重點"
  - **Suggested key:** `blog.college-entrance-exam-explained.一般家庭該注意的重點`

- **Line:** 114
  - **Kind:** `jsx-text`
  - **Original:** "學測不是唯一的升學管道"
  - **Suggested key:** `blog.college-entrance-exam-explained.學測不是唯一的升學管道`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "每個科系的要求不同"
  - **Suggested key:** `blog.college-entrance-exam-explained.每個科系的要求不同`

- **Line:** 116
  - **Kind:** `jsx-text`
  - **Original:** "書面審查和面試很重要"
  - **Suggested key:** `blog.college-entrance-exam-explained.書面審查和面試很重要`

- **Line:** 117
  - **Kind:** `jsx-text`
  - **Original:** "分科測驗也是選項"
  - **Suggested key:** `blog.college-entrance-exam-explained.分科測驗也是選項`

### `src/pages/blog/dependent-deduction-explained.tsx`（24 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "扶養父母真的可以少繳稅嗎？很多人其實報錯了"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養父母真的可以少繳稅嗎_很多人其實報錯了`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "扶養扣除額完整解析：用生活案例說明扶養在制度上的真正意思，為什麼不是有給錢就算，以及一般家庭該有的正確認知。"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養扣除額完整解析_用生活案例說明扶養在制度上的真正意思_為什麼不是有給`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "扶養, 扶養扣除額, 所得稅, 政策解釋"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養_扶養扣除額_所得稅_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "扶養父母真的可以少繳稅嗎？很多人其實報錯了"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養父母真的可以少繳稅嗎_很多人其實報錯了`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "扶養扣除額完整解析：用生活案例說明扶養在制度上的真正意思，為什麼不是有給錢就算，以及一般家庭該有的正確認知。"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養扣除額完整解析_用生活案例說明扶養在制度上的真正意思_為什麼不是有給`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "扶養在制度上的真正意思"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養在制度上的真正意思`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "扶養事實"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養事實`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "扶養條件"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養條件`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "扶養關係"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養關係`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "為什麼不是有給錢就算？"
  - **Suggested key:** `blog.dependent-deduction-explained.為什麼不是有給錢就算`

- **Line:** 71
  - **Kind:** `jsx-text`
  - **Original:** "情境一：偶爾給零用錢"
  - **Suggested key:** `blog.dependent-deduction-explained.情境一_偶爾給零用錢`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "情境二：父母有收入"
  - **Suggested key:** `blog.dependent-deduction-explained.情境二_父母有收入`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "情境三：兄弟姊妹共同負擔"
  - **Suggested key:** `blog.dependent-deduction-explained.情境三_兄弟姊妹共同負擔`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "常見錯誤申報的原因"
  - **Suggested key:** `blog.dependent-deduction-explained.常見錯誤申報的原因`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "以為「有給錢就算」"
  - **Suggested key:** `blog.dependent-deduction-explained.以為_有給錢就算`

- **Line:** 97
  - **Kind:** `jsx-text`
  - **Original:** "不了解「扶養條件」"
  - **Suggested key:** `blog.dependent-deduction-explained.不了解_扶養條件`

- **Line:** 98
  - **Kind:** `jsx-text`
  - **Original:** "以為「報越多越好」"
  - **Suggested key:** `blog.dependent-deduction-explained.以為_報越多越好`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "不了解「扶養事實」"
  - **Suggested key:** `blog.dependent-deduction-explained.不了解_扶養事實`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "一般家庭該有的正確認知"
  - **Suggested key:** `blog.dependent-deduction-explained.一般家庭該有的正確認知`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "扶養不是「有給錢就算」"
  - **Suggested key:** `blog.dependent-deduction-explained.扶養不是_有給錢就算`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "要符合「扶養條件」"
  - **Suggested key:** `blog.dependent-deduction-explained.要符合_扶養條件`

- **Line:** 112
  - **Kind:** `jsx-text`
  - **Original:** "要符合「扶養事實」"
  - **Suggested key:** `blog.dependent-deduction-explained.要符合_扶養事實`

- **Line:** 113
  - **Kind:** `jsx-text`
  - **Original:** "不能重複申報"
  - **Suggested key:** `blog.dependent-deduction-explained.不能重複申報`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.dependent-deduction-explained.提醒`

### `src/pages/tools/LineStickerTool.tsx`（24 筆）

- **Line:** 197
  - **Kind:** `seo-title`
  - **Original:** "LINE 貼圖製作工具｜免費LINE 貼圖製作工具 - RxV AI工具中心"
  - **Suggested key:** `tools.LineStickerTool.line_貼圖製作工具_免費line_貼圖製作工具_rxv_ai工具`

- **Line:** 197
  - **Kind:** `seo-description`
  - **Original:** "免費LINE 貼圖製作工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.LineStickerTool.免費line_貼圖製作工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 197
  - **Kind:** `seo-keywords`
  - **Original:** "LINE 貼圖製作工具, AI工具, 免費工具"
  - **Suggested key:** `tools.LineStickerTool.line_貼圖製作工具_ai工具_免費工具`

- **Line:** 34
  - **Kind:** `jsx-text-en`
  - **Original:** "string): Promise"
  - **Suggested key:** `tools.LineStickerTool.string_promise`

- **Line:** 61
  - **Kind:** `jsx-text-en`
  - **Original:** "string): Promise"
  - **Suggested key:** `tools.LineStickerTool.string_promise`

- **Line:** 198
  - **Kind:** `attr:title`
  - **Original:** "LINE 貼圖製作工具｜免費LINE 貼圖製作工具 - RxV AI工具中心"
  - **Suggested key:** `tools.LineStickerTool.line_貼圖製作工具_免費line_貼圖製作工具_rxv_ai工具`

- **Line:** 199
  - **Kind:** `attr:description`
  - **Original:** "免費LINE 貼圖製作工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.LineStickerTool.免費line_貼圖製作工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 210
  - **Kind:** `jsx-text`
  - **Original:** "LINE 貼圖製作工具（免費）｜AI工具推薦"
  - **Suggested key:** `tools.LineStickerTool.line_貼圖製作工具_免費_ai工具推薦`

- **Line:** 279
  - **Kind:** `jsx-text-en`
  - **Original:** "AI Creator Tools"
  - **Suggested key:** `tools.LineStickerTool.ai_creator_tools`

- **Line:** 319
  - **Kind:** `jsx-text`
  - **Original:** "如何使用此工具？"
  - **Suggested key:** `tools.LineStickerTool.如何使用此工具`

- **Line:** 324
  - **Kind:** `jsx-text`
  - **Original:** "使用步驟"
  - **Suggested key:** `tools.LineStickerTool.使用步驟`

- **Line:** 326
  - **Kind:** `jsx-text`
  - **Original:** "上傳圖片"
  - **Suggested key:** `tools.LineStickerTool.上傳圖片`

- **Line:** 327
  - **Kind:** `jsx-text`
  - **Original:** "調整貼圖尺寸"
  - **Suggested key:** `tools.LineStickerTool.調整貼圖尺寸`

- **Line:** 328
  - **Kind:** `jsx-text`
  - **Original:** "下載貼圖"
  - **Suggested key:** `tools.LineStickerTool.下載貼圖`

- **Line:** 331
  - **Kind:** `jsx-text`
  - **Original:** "適合使用情境"
  - **Suggested key:** `tools.LineStickerTool.適合使用情境`

- **Line:** 333
  - **Kind:** `jsx-text`
  - **Original:** "LINE 貼圖創作"
  - **Suggested key:** `tools.LineStickerTool.line_貼圖創作`

- **Line:** 334
  - **Kind:** `jsx-text`
  - **Original:** "社群貼圖設計"
  - **Suggested key:** `tools.LineStickerTool.社群貼圖設計`

- **Line:** 335
  - **Kind:** `jsx-text`
  - **Original:** "貼圖批次上架前整理"
  - **Suggested key:** `tools.LineStickerTool.貼圖批次上架前整理`

- **Line:** 352
  - **Kind:** `jsx-text`
  - **Original:** "什麼是LINE 貼圖製作工具？"
  - **Suggested key:** `tools.LineStickerTool.什麼是line_貼圖製作工具`

- **Line:** 357
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.LineStickerTool.為什麼使用這個工具`

- **Line:** 359
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.LineStickerTool.免費使用`

- **Line:** 360
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.LineStickerTool.不需安裝`

- **Line:** 361
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.LineStickerTool.支援快速處理`

- **Line:** 364
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `tools.LineStickerTool.相關工具`

### `src/pages/blog/CalmBreath.tsx`（23 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🕊️ 為什麼是 10 秒？"
  - **Suggested key:** `blog.CalmBreath.為什麼是_10_秒`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🌸 10 秒平靜呼吸步驟"
  - **Suggested key:** `blog.CalmBreath.10_秒平靜呼吸步驟`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "吸氣 4 秒："
  - **Suggested key:** `blog.CalmBreath.吸氣_4_秒`

- **Line:** 36
  - **Kind:** `jsx-text`
  - **Original:** "停留 2 秒："
  - **Suggested key:** `blog.CalmBreath.停留_2_秒`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "吐氣 4 秒："
  - **Suggested key:** `blog.CalmBreath.吐氣_4_秒`

- **Line:** 45
  - **Kind:** `jsx-text`
  - **Original:** "4-2-4 呼吸法："
  - **Suggested key:** `blog.CalmBreath.4_2_4_呼吸法`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "💡 何時使用這個方法？"
  - **Suggested key:** `blog.CalmBreath.何時使用這個方法`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "準備開會或面試前"
  - **Suggested key:** `blog.CalmBreath.準備開會或面試前`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "情緒緊繃或爭執後"
  - **Suggested key:** `blog.CalmBreath.情緒緊繃或爭執後`

- **Line:** 53
  - **Kind:** `jsx-text`
  - **Original:** "工作中突然感到煩躁或倦怠時"
  - **Suggested key:** `blog.CalmBreath.工作中突然感到煩躁或倦怠時`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "📱 與 App 搭配練習"
  - **Suggested key:** `blog.CalmBreath.與_app_搭配練習`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "🌼 結語：一口氣，就是力量"
  - **Suggested key:** `blog.CalmBreath.結語_一口氣_就是力量`

- **Line:** 76
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.CalmBreath.english_version`

- **Line:** 77
  - **Kind:** `jsx-text-en`
  - **Original:** "Why 10 Seconds?"
  - **Suggested key:** `blog.CalmBreath.why_10_seconds`

- **Line:** 86
  - **Kind:** `jsx-text-en`
  - **Original:** "Inhale 4 seconds:"
  - **Suggested key:** `blog.CalmBreath.inhale_4_seconds`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Hold 2 seconds:"
  - **Suggested key:** `blog.CalmBreath.hold_2_seconds`

- **Line:** 94
  - **Kind:** `jsx-text-en`
  - **Original:** "Exhale 4 seconds:"
  - **Suggested key:** `blog.CalmBreath.exhale_4_seconds`

- **Line:** 99
  - **Kind:** `jsx-text-en`
  - **Original:** "When to Use This Method?"
  - **Suggested key:** `blog.CalmBreath.when_to_use_this_method`

- **Line:** 101
  - **Kind:** `jsx-text-en`
  - **Original:** "Before meetings or interviews"
  - **Suggested key:** `blog.CalmBreath.before_meetings_or_interviews`

- **Line:** 102
  - **Kind:** `jsx-text-en`
  - **Original:** "After emotional tension or arguments"
  - **Suggested key:** `blog.CalmBreath.after_emotional_tension_or_arguments`

- **Line:** 103
  - **Kind:** `jsx-text-en`
  - **Original:** "When feeling irritable or exhausted at work"
  - **Suggested key:** `blog.CalmBreath.when_feeling_irritable_or_exhausted`

- **Line:** 106
  - **Kind:** `jsx-text-en`
  - **Original:** "Practice with App Integration"
  - **Suggested key:** `blog.CalmBreath.practice_with_app_integration`

- **Line:** 112
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: One Breath, One Force"
  - **Suggested key:** `blog.CalmBreath.closing_one_breath_one_force`

### `src/pages/blog/SleepSoundTherapy.tsx`（23 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌙 為什麼聲音能幫助睡眠？"
  - **Suggested key:** `blog.SleepSoundTherapy.為什麼聲音能幫助睡眠`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🎧 適合睡眠的聲音類型"
  - **Suggested key:** `blog.SleepSoundTherapy.適合睡眠的聲音類型`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "自然環境音："
  - **Suggested key:** `blog.SleepSoundTherapy.自然環境音`

- **Line:** 36
  - **Kind:** `jsx-text`
  - **Original:** "白噪音與粉紅噪音："
  - **Suggested key:** `blog.SleepSoundTherapy.白噪音與粉紅噪音`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "冥想音樂："
  - **Suggested key:** `blog.SleepSoundTherapy.冥想音樂`

- **Line:** 44
  - **Kind:** `jsx-text`
  - **Original:** "雙耳節拍："
  - **Suggested key:** `blog.SleepSoundTherapy.雙耳節拍`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 如何進行睡眠聲音療法？"
  - **Suggested key:** `blog.SleepSoundTherapy.如何進行睡眠聲音療法`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 選擇適合的聲音："
  - **Suggested key:** `blog.SleepSoundTherapy.1_選擇適合的聲音`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 調整音量："
  - **Suggested key:** `blog.SleepSoundTherapy.2_調整音量`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 配合呼吸練習："
  - **Suggested key:** `blog.SleepSoundTherapy.3_配合呼吸練習`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "4️⃣ 設定定時關閉："
  - **Suggested key:** `blog.SleepSoundTherapy.4_設定定時關閉`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "🌿 聲音療法的科學原理"
  - **Suggested key:** `blog.SleepSoundTherapy.聲音療法的科學原理`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "💤 結語：讓聲音成為你的睡眠夥伴"
  - **Suggested key:** `blog.SleepSoundTherapy.結語_讓聲音成為你的睡眠夥伴`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.SleepSoundTherapy.english_version`

- **Line:** 91
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Can Sound Help with Sleep?"
  - **Suggested key:** `blog.SleepSoundTherapy.why_can_sound_help_with_sleep`

- **Line:** 98
  - **Kind:** `jsx-text-en`
  - **Original:** "Types of Sounds Suitable for Sleep"
  - **Suggested key:** `blog.SleepSoundTherapy.types_of_sounds_suitable_for_sleep`

- **Line:** 101
  - **Kind:** `jsx-text-en`
  - **Original:** "Nature Sounds:"
  - **Suggested key:** `blog.SleepSoundTherapy.nature_sounds`

- **Line:** 105
  - **Kind:** `jsx-text-en`
  - **Original:** "White Noise and Pink Noise:"
  - **Suggested key:** `blog.SleepSoundTherapy.white_noise_and_pink_noise`

- **Line:** 109
  - **Kind:** `jsx-text-en`
  - **Original:** "Meditation Music:"
  - **Suggested key:** `blog.SleepSoundTherapy.meditation_music`

- **Line:** 113
  - **Kind:** `jsx-text-en`
  - **Original:** "Binaural Beats:"
  - **Suggested key:** `blog.SleepSoundTherapy.binaural_beats`

- **Line:** 118
  - **Kind:** `jsx-text-en`
  - **Original:** "How to Practice Sleep Sound Therapy"
  - **Suggested key:** `blog.SleepSoundTherapy.how_to_practice_sleep_sound_therapy`

- **Line:** 139
  - **Kind:** `jsx-text-en`
  - **Original:** "The Science Behind Sound Therapy"
  - **Suggested key:** `blog.SleepSoundTherapy.the_science_behind_sound_therapy`

- **Line:** 146
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Let Sound Be Your Sleep Companion"
  - **Suggested key:** `blog.SleepSoundTherapy.conclusion_let_sound_be_your_sleep`

### `src/pages/blog/EveningGratitudeJournal.tsx`（22 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌌 為什麼要在夜晚寫感恩日記？"
  - **Suggested key:** `blog.EveningGratitudeJournal.為什麼要在夜晚寫感恩日記`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "📔 夜間感恩日記的三個問題"
  - **Suggested key:** `blog.EveningGratitudeJournal.夜間感恩日記的三個問題`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 今天最感謝的一件事："
  - **Suggested key:** `blog.EveningGratitudeJournal.1_今天最感謝的一件事`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 今天學到的一個小啟發："
  - **Suggested key:** `blog.EveningGratitudeJournal.2_今天學到的一個小啟發`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 想對明天的自己說的話："
  - **Suggested key:** `blog.EveningGratitudeJournal.3_想對明天的自己說的話`

- **Line:** 47
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 如何建立寫日記的習慣？"
  - **Suggested key:** `blog.EveningGratitudeJournal.如何建立寫日記的習慣`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "設定固定時間："
  - **Suggested key:** `blog.EveningGratitudeJournal.設定固定時間`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "不需要完美："
  - **Suggested key:** `blog.EveningGratitudeJournal.不需要完美`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "使用紙筆或 App："
  - **Suggested key:** `blog.EveningGratitudeJournal.使用紙筆或_app`

- **Line:** 62
  - **Kind:** `jsx-text`
  - **Original:** "搭配呼吸練習："
  - **Suggested key:** `blog.EveningGratitudeJournal.搭配呼吸練習`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "✨ 感恩日記的療癒力量"
  - **Suggested key:** `blog.EveningGratitudeJournal.感恩日記的療癒力量`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "💤 結語：讓感恩成為睡前的最後一盞燈"
  - **Suggested key:** `blog.EveningGratitudeJournal.結語_讓感恩成為睡前的最後一盞燈`

- **Line:** 89
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.EveningGratitudeJournal.english_version`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Write a Gratitude Journal at Night?"
  - **Suggested key:** `blog.EveningGratitudeJournal.why_write_a_gratitude_journal_at_nig`

- **Line:** 98
  - **Kind:** `jsx-text-en`
  - **Original:** "Three Questions for Evening Gratitude Journal"
  - **Suggested key:** `blog.EveningGratitudeJournal.three_questions_for_evening_gratitud`

- **Line:** 117
  - **Kind:** `jsx-text-en`
  - **Original:** "How to Build a Journaling Habit"
  - **Suggested key:** `blog.EveningGratitudeJournal.how_to_build_a_journaling_habit`

- **Line:** 120
  - **Kind:** `jsx-text-en`
  - **Original:** "Set a Fixed Time:"
  - **Suggested key:** `blog.EveningGratitudeJournal.set_a_fixed_time`

- **Line:** 124
  - **Kind:** `jsx-text-en`
  - **Original:** "It Doesn't Have to Be Perfect:"
  - **Suggested key:** `blog.EveningGratitudeJournal.it_doesn_t_have_to_be_perfect`

- **Line:** 128
  - **Kind:** `jsx-text-en`
  - **Original:** "Use Paper or an App:"
  - **Suggested key:** `blog.EveningGratitudeJournal.use_paper_or_an_app`

- **Line:** 132
  - **Kind:** `jsx-text-en`
  - **Original:** "Combine with Breathing:"
  - **Suggested key:** `blog.EveningGratitudeJournal.combine_with_breathing`

- **Line:** 137
  - **Kind:** `jsx-text-en`
  - **Original:** "The Healing Power of Gratitude Journaling"
  - **Suggested key:** `blog.EveningGratitudeJournal.the_healing_power_of_gratitude_journ`

- **Line:** 144
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Let Gratitude Be the Last Light Before Sleep"
  - **Suggested key:** `blog.EveningGratitudeJournal.conclusion_let_gratitude_be_the_las`

### `src/pages/blog/income-tax-brackets-explained.tsx`（22 筆）

- **Line:** 50
  - **Kind:** `seo-title`
  - **Original:** "所得稅級距是什麼？為什麼加薪反而繳更多稅？一次白話說清楚"
  - **Suggested key:** `blog.income-tax-brackets-explained.所得稅級距是什麼_為什麼加薪反而繳更多稅_一次白話說清楚`

- **Line:** 50
  - **Kind:** `seo-description`
  - **Original:** "所得稅級距完整解析：用白話方式解釋什麼是所得稅級距，為什麼不是全部收入都用最高稅率，以及一般上班族最常誤解的地方。"
  - **Suggested key:** `blog.income-tax-brackets-explained.所得稅級距完整解析_用白話方式解釋什麼是所得稅級距_為什麼不是全部收入都`

- **Line:** 50
  - **Kind:** `seo-keywords`
  - **Original:** "所得稅級距, 所得稅, 加薪, 稅率, 政策解釋"
  - **Suggested key:** `blog.income-tax-brackets-explained.所得稅級距_所得稅_加薪_稅率_政策解釋`

- **Line:** 51
  - **Kind:** `attr:title`
  - **Original:** "所得稅級距是什麼？為什麼加薪反而繳更多稅？一次白話說清楚"
  - **Suggested key:** `blog.income-tax-brackets-explained.所得稅級距是什麼_為什麼加薪反而繳更多稅_一次白話說清楚`

- **Line:** 52
  - **Kind:** `attr:description`
  - **Original:** "所得稅級距完整解析：用白話方式解釋什麼是所得稅級距，為什麼不是全部收入都用最高稅率，以及一般上班族最常誤解的地方。"
  - **Suggested key:** `blog.income-tax-brackets-explained.所得稅級距完整解析_用白話方式解釋什麼是所得稅級距_為什麼不是全部收入都`

- **Line:** 88
  - **Kind:** `jsx-text`
  - **Original:** "什麼是所得稅級距？"
  - **Suggested key:** `blog.income-tax-brackets-explained.什麼是所得稅級距`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "前 56 萬用 5% 的稅率"
  - **Suggested key:** `blog.income-tax-brackets-explained.前_56_萬用_5_的稅率`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "56 萬到 126 萬的部分用 12% 的稅率"
  - **Suggested key:** `blog.income-tax-brackets-explained.56_萬到_126_萬的部分用_12_的稅率`

- **Line:** 101
  - **Kind:** `jsx-text`
  - **Original:** "以此類推"
  - **Suggested key:** `blog.income-tax-brackets-explained.以此類推`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "為什麼不是全部收入都用最高稅率？"
  - **Suggested key:** `blog.income-tax-brackets-explained.為什麼不是全部收入都用最高稅率`

- **Line:** 109
  - **Kind:** `jsx-text`
  - **Original:** "收入低的部分用低稅率"
  - **Suggested key:** `blog.income-tax-brackets-explained.收入低的部分用低稅率`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "只有「超過」某個金額的部分，才會用更高的稅率"
  - **Suggested key:** `blog.income-tax-brackets-explained.只有_超過_某個金額的部分_才會用更高的稅率`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "這樣可以讓收入較低的人負擔較輕，收入較高的人負擔較重"
  - **Suggested key:** `blog.income-tax-brackets-explained.這樣可以讓收入較低的人負擔較輕_收入較高的人負擔較重`

- **Line:** 117
  - **Kind:** `jsx-text`
  - **Original:** "一般上班族最常誤解的地方"
  - **Suggested key:** `blog.income-tax-brackets-explained.一般上班族最常誤解的地方`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "誤解一：加薪會讓整個收入都用更高稅率"
  - **Suggested key:** `blog.income-tax-brackets-explained.誤解一_加薪會讓整個收入都用更高稅率`

- **Line:** 125
  - **Kind:** `jsx-text`
  - **Original:** "誤解二：年終獎金會讓稅變很多"
  - **Suggested key:** `blog.income-tax-brackets-explained.誤解二_年終獎金會讓稅變很多`

- **Line:** 131
  - **Kind:** `jsx-text`
  - **Original:** "誤解三：兼職收入會讓稅率跳很高"
  - **Suggested key:** `blog.income-tax-brackets-explained.誤解三_兼職收入會讓稅率跳很高`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "常見 Q&A"
  - **Suggested key:** `blog.income-tax-brackets-explained.常見_q_a`

- **Line:** 140
  - **Kind:** `jsx-text`
  - **Original:** "Q1：加班費會影響稅率嗎？"
  - **Suggested key:** `blog.income-tax-brackets-explained.q1_加班費會影響稅率嗎`

- **Line:** 147
  - **Kind:** `jsx-text`
  - **Original:** "Q2：年終獎金怎麼算稅？"
  - **Suggested key:** `blog.income-tax-brackets-explained.q2_年終獎金怎麼算稅`

- **Line:** 154
  - **Kind:** `jsx-text`
  - **Original:** "Q3：兼職收入會讓稅變很多嗎？"
  - **Suggested key:** `blog.income-tax-brackets-explained.q3_兼職收入會讓稅變很多嗎`

- **Line:** 161
  - **Kind:** `jsx-text`
  - **Original:** "Q4：為什麼加薪後感覺繳的稅變多了？"
  - **Suggested key:** `blog.income-tax-brackets-explained.q4_為什麼加薪後感覺繳的稅變多了`

### `src/pages/blog/income-tax-exemption-explained.tsx`（22 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？"
  - **Suggested key:** `blog.income-tax-exemption-explained.為什麼有些人不用繳所得稅_免稅門檻到底怎麼算`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "所得稅免稅門檻完整解析：用生活情境說明為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思，以及一般家庭最容易誤會的地方。"
  - **Suggested key:** `blog.income-tax-exemption-explained.所得稅免稅門檻完整解析_用生活情境說明為什麼有些人不用繳所得稅_免稅額`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "所得稅, 免稅門檻, 免稅額, 扣除額, 政策解釋"
  - **Suggested key:** `blog.income-tax-exemption-explained.所得稅_免稅門檻_免稅額_扣除額_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "為什麼有些人不用繳所得稅？免稅門檻到底怎麼算？"
  - **Suggested key:** `blog.income-tax-exemption-explained.為什麼有些人不用繳所得稅_免稅門檻到底怎麼算`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "所得稅免稅門檻完整解析：用生活情境說明為什麼有些人不用繳所得稅，免稅額、扣除額在實際生活中的意思，以及一般家庭最容易誤會的地方。"
  - **Suggested key:** `blog.income-tax-exemption-explained.所得稅免稅門檻完整解析_用生活情境說明為什麼有些人不用繳所得稅_免稅額`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "所得稅不是人人都要繳的原因"
  - **Suggested key:** `blog.income-tax-exemption-explained.所得稅不是人人都要繳的原因`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "免稅額、扣除額在實際生活中的意思"
  - **Suggested key:** `blog.income-tax-exemption-explained.免稅額_扣除額在實際生活中的意思`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "免稅額："
  - **Suggested key:** `blog.income-tax-exemption-explained.免稅額`

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "扣除額："
  - **Suggested key:** `blog.income-tax-exemption-explained.扣除額`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "標準扣除額"
  - **Suggested key:** `blog.income-tax-exemption-explained.標準扣除額`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "列舉扣除額"
  - **Suggested key:** `blog.income-tax-exemption-explained.列舉扣除額`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "特別扣除額"
  - **Suggested key:** `blog.income-tax-exemption-explained.特別扣除額`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "為什麼薪水不高卻還是有人被扣？"
  - **Suggested key:** `blog.income-tax-exemption-explained.為什麼薪水不高卻還是有人被扣`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "薪水是月收入"
  - **Suggested key:** `blog.income-tax-exemption-explained.薪水是月收入`

- **Line:** 95
  - **Kind:** `jsx-text`
  - **Original:** "年收入是總收入"
  - **Suggested key:** `blog.income-tax-exemption-explained.年收入是總收入`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "還要加上其他收入"
  - **Suggested key:** `blog.income-tax-exemption-explained.還要加上其他收入`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "一般家庭最容易誤會的地方"
  - **Suggested key:** `blog.income-tax-exemption-explained.一般家庭最容易誤會的地方`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "誤會一：有收入就要繳稅"
  - **Suggested key:** `blog.income-tax-exemption-explained.誤會一_有收入就要繳稅`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "誤會二：免稅額和扣除額是一樣的"
  - **Suggested key:** `blog.income-tax-exemption-explained.誤會二_免稅額和扣除額是一樣的`

- **Line:** 122
  - **Kind:** `jsx-text`
  - **Original:** "誤會三：薪水不高就不用繳稅"
  - **Suggested key:** `blog.income-tax-exemption-explained.誤會三_薪水不高就不用繳稅`

- **Line:** 129
  - **Kind:** `jsx-text`
  - **Original:** "誤會四：不用繳稅就不用報稅"
  - **Suggested key:** `blog.income-tax-exemption-explained.誤會四_不用繳稅就不用報稅`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.income-tax-exemption-explained.提醒`

### `src/pages/blog/PowerOfSilence.tsx`（22 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌌 為什麼我們需要沉默？"
  - **Suggested key:** `blog.PowerOfSilence.為什麼我們需要沉默`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 沉默的三種層次"
  - **Suggested key:** `blog.PowerOfSilence.沉默的三種層次`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 外在的沉默："
  - **Suggested key:** `blog.PowerOfSilence.1_外在的沉默`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 內在的沉默："
  - **Suggested key:** `blog.PowerOfSilence.2_內在的沉默`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 存在的沉默："
  - **Suggested key:** `blog.PowerOfSilence.3_存在的沉默`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "🧘 如何練習沉默？"
  - **Suggested key:** `blog.PowerOfSilence.如何練習沉默`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "每日靜默時刻："
  - **Suggested key:** `blog.PowerOfSilence.每日靜默時刻`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "觀察呼吸："
  - **Suggested key:** `blog.PowerOfSilence.觀察呼吸`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "自然中的沉默："
  - **Suggested key:** `blog.PowerOfSilence.自然中的沉默`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "靜默冥想："
  - **Suggested key:** `blog.PowerOfSilence.靜默冥想`

- **Line:** 68
  - **Kind:** `jsx-text`
  - **Original:** "✨ 沉默帶來的好處"
  - **Suggested key:** `blog.PowerOfSilence.沉默帶來的好處`

- **Line:** 77
  - **Kind:** `jsx-text`
  - **Original:** "💫 結語：在沉默中聽見真實"
  - **Suggested key:** `blog.PowerOfSilence.結語_在沉默中聽見真實`

- **Line:** 89
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.PowerOfSilence.english_version`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Do We Need Silence?"
  - **Suggested key:** `blog.PowerOfSilence.why_do_we_need_silence`

- **Line:** 97
  - **Kind:** `jsx-text-en`
  - **Original:** "Three Levels of Silence"
  - **Suggested key:** `blog.PowerOfSilence.three_levels_of_silence`

- **Line:** 116
  - **Kind:** `jsx-text-en`
  - **Original:** "How to Practice Silence"
  - **Suggested key:** `blog.PowerOfSilence.how_to_practice_silence`

- **Line:** 119
  - **Kind:** `jsx-text-en`
  - **Original:** "Daily Silent Time:"
  - **Suggested key:** `blog.PowerOfSilence.daily_silent_time`

- **Line:** 123
  - **Kind:** `jsx-text-en`
  - **Original:** "Observe Breathing:"
  - **Suggested key:** `blog.PowerOfSilence.observe_breathing`

- **Line:** 127
  - **Kind:** `jsx-text-en`
  - **Original:** "Silence in Nature:"
  - **Suggested key:** `blog.PowerOfSilence.silence_in_nature`

- **Line:** 131
  - **Kind:** `jsx-text-en`
  - **Original:** "Silent Meditation:"
  - **Suggested key:** `blog.PowerOfSilence.silent_meditation`

- **Line:** 136
  - **Kind:** `jsx-text-en`
  - **Original:** "Benefits of Silence"
  - **Suggested key:** `blog.PowerOfSilence.benefits_of_silence`

- **Line:** 143
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Hear Truth in Silence"
  - **Suggested key:** `blog.PowerOfSilence.conclusion_hear_truth_in_silence`

### `src/pages/PrivacyPolicy.tsx`（22 筆）

- **Line:** 7
  - **Kind:** `jsx-text`
  - **Original:** "隱私權政策與 Cookie 政策"
  - **Suggested key:** `pages.PrivacyPolicy.隱私權政策與_cookie_政策`

- **Line:** 12
  - **Kind:** `jsx-text`
  - **Original:** "⚠️ Beta 測試中"
  - **Suggested key:** `pages.PrivacyPolicy.beta_測試中`

- **Line:** 22
  - **Kind:** `jsx-text`
  - **Original:** "我們如何使用您的資料"
  - **Suggested key:** `pages.PrivacyPolicy.我們如何使用您的資料`

- **Line:** 27
  - **Kind:** `jsx-text`
  - **Original:** "我們可能收集的資料類型"
  - **Suggested key:** `pages.PrivacyPolicy.我們可能收集的資料類型`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "聯絡資料（如電子郵件、暱稱）"
  - **Suggested key:** `pages.PrivacyPolicy.聯絡資料_如電子郵件_暱稱`

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "使用紀錄（例如使用時間、點擊按鈕次數）"
  - **Suggested key:** `pages.PrivacyPolicy.使用紀錄_例如使用時間_點擊按鈕次數`

- **Line:** 31
  - **Kind:** `jsx-text`
  - **Original:** "裝置資訊（如瀏覽器版本、作業系統類型）"
  - **Suggested key:** `pages.PrivacyPolicy.裝置資訊_如瀏覽器版本_作業系統類型`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "訂閱狀態與付款記錄（不包含完整付款卡號）"
  - **Suggested key:** `pages.PrivacyPolicy.訂閱狀態與付款記錄_不包含完整付款卡號`

- **Line:** 35
  - **Kind:** `jsx-text`
  - **Original:** "我們可能使用的第三方服務"
  - **Suggested key:** `pages.PrivacyPolicy.我們可能使用的第三方服務`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "Google AdMob（顯示廣告）"
  - **Suggested key:** `pages.PrivacyPolicy.google_admob_顯示廣告`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "PayPal（處理網頁訂閱付款）"
  - **Suggested key:** `pages.PrivacyPolicy.paypal_處理網頁訂閱付款`

- **Line:** 39
  - **Kind:** `jsx-text`
  - **Original:** "Google Analytics（分析使用情形）"
  - **Suggested key:** `pages.PrivacyPolicy.google_analytics_分析使用情形`

- **Line:** 45
  - **Kind:** `jsx-text`
  - **Original:** "Google Analytics（分析網站流量）"
  - **Suggested key:** `pages.PrivacyPolicy.google_analytics_分析網站流量`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "Cookie 與本地儲存"
  - **Suggested key:** `pages.PrivacyPolicy.cookie_與本地儲存`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "Analytics Cookie 使用聲明："
  - **Suggested key:** `pages.PrivacyPolicy.analytics_cookie_使用聲明`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "使用者權利"
  - **Suggested key:** `pages.PrivacyPolicy.使用者權利`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "查閱您的個人資料"
  - **Suggested key:** `pages.PrivacyPolicy.查閱您的個人資料`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "要求下載備份（例如任務資料）"
  - **Suggested key:** `pages.PrivacyPolicy.要求下載備份_例如任務資料`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "請求刪除個人資料（例如 email 或訂閱紀錄）"
  - **Suggested key:** `pages.PrivacyPolicy.請求刪除個人資料_例如_email_或訂閱紀錄`

- **Line:** 97
  - **Kind:** `jsx-text`
  - **Original:** "政策變更"
  - **Suggested key:** `pages.PrivacyPolicy.政策變更`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "聯絡方式"
  - **Suggested key:** `pages.PrivacyPolicy.聯絡方式`

- **Line:** 124
  - **Kind:** `jsx-text`
  - **Original:** "更新日期：2025/11/04"
  - **Suggested key:** `pages.PrivacyPolicy.更新日期_2025_11_04`

### `src/pages/blog/WeeklyBreathChallenge.tsx`（21 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "💚 為什麼需要「呼吸排毒」？"
  - **Suggested key:** `blog.WeeklyBreathChallenge.為什麼需要_呼吸排毒`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "📅 七日呼吸挑戰流程"
  - **Suggested key:** `blog.WeeklyBreathChallenge.七日呼吸挑戰流程`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "Day 1 – 清晨覺醒呼吸 Morning Awakening："
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_1_清晨覺醒呼吸_morning_awakening`

- **Line:** 36
  - **Kind:** `jsx-text`
  - **Original:** "Day 2 – 平靜中軸呼吸 Centering Breath："
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_2_平靜中軸呼吸_centering_breath`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "Day 3 – 情緒釋放呼吸 Release Breath："
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_3_情緒釋放呼吸_release_breath`

- **Line:** 44
  - **Kind:** `jsx-text`
  - **Original:** "Day 4 – 感恩呼吸 Gratitude Flow："
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_4_感恩呼吸_gratitude_flow`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "Day 5 – 專注呼吸 Focus Flow："
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_5_專注呼吸_focus_flow`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "Day 6 – 愛的呼吸 Heart Expansion："
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_6_愛的呼吸_heart_expansion`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "Day 7 – 沉靜夜息 Deep Calm："
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_7_沉靜夜息_deep_calm`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "🪷 App 練習建議"
  - **Suggested key:** `blog.WeeklyBreathChallenge.app_練習建議`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "🌈 結語：呼吸，是最溫柔的力量"
  - **Suggested key:** `blog.WeeklyBreathChallenge.結語_呼吸_是最溫柔的力量`

- **Line:** 82
  - **Kind:** `jsx-text-en`
  - **Original:** "Why a \"Breath Detox\"?"
  - **Suggested key:** `blog.WeeklyBreathChallenge.why_a_breath_detox`

- **Line:** 92
  - **Kind:** `jsx-text-en`
  - **Original:** "Day 1 – Morning Awakening:"
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_1_morning_awakening`

- **Line:** 95
  - **Kind:** `jsx-text-en`
  - **Original:** "Day 2 – Centering Breath:"
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_2_centering_breath`

- **Line:** 98
  - **Kind:** `jsx-text-en`
  - **Original:** "Day 3 – Release Breath:"
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_3_release_breath`

- **Line:** 101
  - **Kind:** `jsx-text-en`
  - **Original:** "Day 4 – Gratitude Flow:"
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_4_gratitude_flow`

- **Line:** 104
  - **Kind:** `jsx-text-en`
  - **Original:** "Day 5 – Focus Flow:"
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_5_focus_flow`

- **Line:** 107
  - **Kind:** `jsx-text-en`
  - **Original:** "Day 6 – Heart Expansion:"
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_6_heart_expansion`

- **Line:** 110
  - **Kind:** `jsx-text-en`
  - **Original:** "Day 7 – Deep Calm:"
  - **Suggested key:** `blog.WeeklyBreathChallenge.day_7_deep_calm`

- **Line:** 114
  - **Kind:** `jsx-text-en`
  - **Original:** "App Practice Tips"
  - **Suggested key:** `blog.WeeklyBreathChallenge.app_practice_tips`

- **Line:** 120
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: Breath is the Gentlest Force"
  - **Suggested key:** `blog.WeeklyBreathChallenge.closing_breath_is_the_gentlest_forc`

### `src/pages/blog/MoonlightMeditationBreath.tsx`（20 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌙 為什麼月光適合冥想？"
  - **Suggested key:** `blog.MoonlightMeditationBreath.為什麼月光適合冥想`

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 三步睡前冥想呼吸法"
  - **Suggested key:** `blog.MoonlightMeditationBreath.三步睡前冥想呼吸法`

- **Line:** 33
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 吸氣：收回心神"
  - **Suggested key:** `blog.MoonlightMeditationBreath.1_吸氣_收回心神`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 停留：與月光同在"
  - **Suggested key:** `blog.MoonlightMeditationBreath.2_停留_與月光同在`

- **Line:** 43
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 吐氣：放下白天"
  - **Suggested key:** `blog.MoonlightMeditationBreath.3_吐氣_放下白天`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "🎧 預留功能：睡眠音樂模組 Coming Soon"
  - **Suggested key:** `blog.MoonlightMeditationBreath.預留功能_睡眠音樂模組_coming_soon`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "🪷 睡前儀式建議"
  - **Suggested key:** `blog.MoonlightMeditationBreath.睡前儀式建議`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "關閉手機通知，調暗燈光。"
  - **Suggested key:** `blog.MoonlightMeditationBreath.關閉手機通知_調暗燈光`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "播放柔和背景音或自然環境音。"
  - **Suggested key:** `blog.MoonlightMeditationBreath.播放柔和背景音或自然環境音`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "深呼吸三次後，再開始閱讀或休息。"
  - **Suggested key:** `blog.MoonlightMeditationBreath.深呼吸三次後_再開始閱讀或休息`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "🌕 結語：讓月光帶你回家"
  - **Suggested key:** `blog.MoonlightMeditationBreath.結語_讓月光帶你回家`

- **Line:** 78
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.MoonlightMeditationBreath.english_version`

- **Line:** 79
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Is Moonlight Good for Meditation?"
  - **Suggested key:** `blog.MoonlightMeditationBreath.why_is_moonlight_good_for_meditation`

- **Line:** 86
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Step Pre-Sleep Meditation Breath"
  - **Suggested key:** `blog.MoonlightMeditationBreath.three_step_pre_sleep_meditation_brea`

- **Line:** 104
  - **Kind:** `jsx-text-en`
  - **Original:** "Coming Soon: Sleep Music Module"
  - **Suggested key:** `blog.MoonlightMeditationBreath.coming_soon_sleep_music_module`

- **Line:** 111
  - **Kind:** `jsx-text-en`
  - **Original:** "Bedtime Ritual Suggestions"
  - **Suggested key:** `blog.MoonlightMeditationBreath.bedtime_ritual_suggestions`

- **Line:** 113
  - **Kind:** `jsx-text-en`
  - **Original:** "Turn off phone notifications and dim the lights."
  - **Suggested key:** `blog.MoonlightMeditationBreath.turn_off_phone_notifications_and_dim`

- **Line:** 114
  - **Kind:** `jsx-text-en`
  - **Original:** "Play gentle background sounds or nature ambience."
  - **Suggested key:** `blog.MoonlightMeditationBreath.play_gentle_background_sounds_or_nat`

- **Line:** 115
  - **Kind:** `jsx-text-en`
  - **Original:** "Take three slow breaths before reading or resting."
  - **Suggested key:** `blog.MoonlightMeditationBreath.take_three_slow_breaths_before_readi`

- **Line:** 118
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Let Moonlight Guide You Home"
  - **Suggested key:** `blog.MoonlightMeditationBreath.conclusion_let_moonlight_guide_you`

### `src/pages/tools/index.tsx`（20 筆）

- **Line:** 231
  - **Kind:** `seo-title`
  - **Original:** "工具總覽｜免費工具總覽工具 - RxV AI工具中心"
  - **Suggested key:** `tools.index.工具總覽_免費工具總覽工具_rxv_ai工具中心`

- **Line:** 231
  - **Kind:** `seo-description`
  - **Original:** "免費工具總覽工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.index.免費工具總覽工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 231
  - **Kind:** `seo-keywords`
  - **Original:** "工具總覽, AI工具, 免費工具"
  - **Suggested key:** `tools.index.工具總覽_ai工具_免費工具`

- **Line:** 176
  - **Kind:** `jsx-text`
  - **Original:** "未開放"
  - **Suggested key:** `tools.index.未開放`

- **Line:** 232
  - **Kind:** `attr:title`
  - **Original:** "工具總覽｜免費工具總覽工具 - RxV AI工具中心"
  - **Suggested key:** `tools.index.工具總覽_免費工具總覽工具_rxv_ai工具中心`

- **Line:** 233
  - **Kind:** `attr:description`
  - **Original:** "免費工具總覽工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.index.免費工具總覽工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 246
  - **Kind:** `jsx-text`
  - **Original:** "工具總覽（免費）｜AI工具推薦"
  - **Suggested key:** `tools.index.工具總覽_免費_ai工具推薦`

- **Line:** 293
  - **Kind:** `jsx-text`
  - **Original:** "LINE 貼圖整理工具"
  - **Suggested key:** `tools.index.line_貼圖整理工具`

- **Line:** 297
  - **Kind:** `jsx-text`
  - **Original:** "圖片尺寸轉換工具"
  - **Suggested key:** `tools.index.圖片尺寸轉換工具`

- **Line:** 301
  - **Kind:** `jsx-text`
  - **Original:** "AI 摘要工具"
  - **Suggested key:** `tools.index.ai_摘要工具`

- **Line:** 305
  - **Kind:** `jsx-text`
  - **Original:** "番茄鐘"
  - **Suggested key:** `tools.index.番茄鐘`

- **Line:** 337
  - **Kind:** `jsx-text`
  - **Original:** "什麼是工具總覽？"
  - **Suggested key:** `tools.index.什麼是工具總覽`

- **Line:** 342
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.index.為什麼使用這個工具`

- **Line:** 344
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.index.免費使用`

- **Line:** 345
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.index.不需安裝`

- **Line:** 346
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.index.支援快速處理`

- **Line:** 349
  - **Kind:** `jsx-text`
  - **Original:** "更多相關工具"
  - **Suggested key:** `tools.index.更多相關工具`

- **Line:** 351
  - **Kind:** `jsx-text`
  - **Original:** "工具中心"
  - **Suggested key:** `tools.index.工具中心`

- **Line:** 352
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `tools.index.ai摘要工具`

- **Line:** 353
  - **Kind:** `jsx-text`
  - **Original:** "AI作業解題"
  - **Suggested key:** `tools.index.ai作業解題`

### `src/pages/tools/ShopeeSingleVideoPage.tsx`（20 筆）

- **Line:** 144
  - **Kind:** `seo-title`
  - **Original:** "Shopee 單支影片工具｜免費Shopee 單支影片工具 - RxV AI工具中心"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.shopee_單支影片工具_免費shopee_單支影片工具_rxv`

- **Line:** 144
  - **Kind:** `seo-description`
  - **Original:** "免費Shopee 單支影片工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.免費shopee_單支影片工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 144
  - **Kind:** `seo-keywords`
  - **Original:** "Shopee 單支影片工具, AI工具, 免費工具"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.shopee_單支影片工具_ai工具_免費工具`

- **Line:** 145
  - **Kind:** `attr:title`
  - **Original:** "Shopee 單支影片工具｜免費Shopee 單支影片工具 - RxV AI工具中心"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.shopee_單支影片工具_免費shopee_單支影片工具_rxv`

- **Line:** 146
  - **Kind:** `attr:description`
  - **Original:** "免費Shopee 單支影片工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.免費shopee_單支影片工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 152
  - **Kind:** `jsx-text`
  - **Original:** "Shopee 單支影片工具（免費）｜AI工具推薦"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.shopee_單支影片工具_免費_ai工具推薦`

- **Line:** 163
  - **Kind:** `attr:placeholder`
  - **Original:** "請貼上 Shopee 商品網址"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.請貼上_shopee_商品網址`

- **Line:** 205
  - **Kind:** `attr:alt`
  - **Original:** "商品圖片"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.商品圖片`

- **Line:** 239
  - **Kind:** `jsx-text`
  - **Original:** "🎞️ 預覽影片"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.預覽影片`

- **Line:** 261
  - **Kind:** `jsx-text`
  - **Original:** "📜 產出腳本"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.產出腳本`

- **Line:** 275
  - **Kind:** `jsx-text`
  - **Original:** "🈸 字幕內容"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.字幕內容`

- **Line:** 288
  - **Kind:** `jsx-text`
  - **Original:** "什麼是Shopee 單支影片工具？"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.什麼是shopee_單支影片工具`

- **Line:** 293
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.為什麼使用這個工具`

- **Line:** 295
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.免費使用`

- **Line:** 296
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.不需安裝`

- **Line:** 297
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.支援快速處理`

- **Line:** 300
  - **Kind:** `jsx-text`
  - **Original:** "更多相關工具"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.更多相關工具`

- **Line:** 302
  - **Kind:** `jsx-text`
  - **Original:** "工具中心"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.工具中心`

- **Line:** 303
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.ai摘要工具`

- **Line:** 304
  - **Kind:** `jsx-text`
  - **Original:** "AI作業解題"
  - **Suggested key:** `tools.ShopeeSingleVideoPage.ai作業解題`

### `src/pages/payment/bank-transfer.tsx`（19 筆）

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "無效的方案參數"
  - **Suggested key:** `payment.bank-transfer.無效的方案參數`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "返回方案選擇"
  - **Suggested key:** `payment.bank-transfer.返回方案選擇`

- **Line:** 168
  - **Kind:** `jsx-text`
  - **Original:** "流程說明："
  - **Suggested key:** `payment.bank-transfer.流程說明`

- **Line:** 169
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 選擇方案"
  - **Suggested key:** `payment.bank-transfer.1_選擇方案`

- **Line:** 170
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 完成匯款"
  - **Suggested key:** `payment.bank-transfer.2_完成匯款`

- **Line:** 171
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 填寫回報"
  - **Suggested key:** `payment.bank-transfer.3_填寫回報`

- **Line:** 172
  - **Kind:** `jsx-text`
  - **Original:** "4️⃣ 24 小時內完成加點"
  - **Suggested key:** `payment.bank-transfer.4_24_小時內完成加點`

- **Line:** 193
  - **Kind:** `jsx-text`
  - **Original:** "銀行："
  - **Suggested key:** `payment.bank-transfer.銀行`

- **Line:** 197
  - **Kind:** `attr:title`
  - **Original:** "點擊複製"
  - **Suggested key:** `payment.bank-transfer.點擊複製`

- **Line:** 203
  - **Kind:** `jsx-text`
  - **Original:** "銀行代號："
  - **Suggested key:** `payment.bank-transfer.銀行代號`

- **Line:** 207
  - **Kind:** `attr:title`
  - **Original:** "點擊複製"
  - **Suggested key:** `payment.bank-transfer.點擊複製`

- **Line:** 213
  - **Kind:** `jsx-text`
  - **Original:** "銀行分行："
  - **Suggested key:** `payment.bank-transfer.銀行分行`

- **Line:** 217
  - **Kind:** `attr:title`
  - **Original:** "點擊複製"
  - **Suggested key:** `payment.bank-transfer.點擊複製`

- **Line:** 223
  - **Kind:** `jsx-text`
  - **Original:** "帳號："
  - **Suggested key:** `payment.bank-transfer.帳號`

- **Line:** 227
  - **Kind:** `attr:title`
  - **Original:** "點擊複製"
  - **Suggested key:** `payment.bank-transfer.點擊複製`

- **Line:** 233
  - **Kind:** `jsx-text`
  - **Original:** "戶名："
  - **Suggested key:** `payment.bank-transfer.戶名`

- **Line:** 237
  - **Kind:** `attr:title`
  - **Original:** "點擊複製"
  - **Suggested key:** `payment.bank-transfer.點擊複製`

- **Line:** 251
  - **Kind:** `jsx-text`
  - **Original:** "• 請於匯款備註填寫「註冊 Email」"
  - **Suggested key:** `payment.bank-transfer.請於匯款備註填寫_註冊_email`

- **Line:** 252
  - **Kind:** `jsx-text`
  - **Original:** "• 匯款完成後 24 小時內人工加點"
  - **Suggested key:** `payment.bank-transfer.匯款完成後_24_小時內人工加點`

### `src/pages/tools/ToolLandingPage.tsx`（19 筆）

- **Line:** 73
  - **Kind:** `jsx-text`
  - **Original:** "簡介"
  - **Suggested key:** `tools.ToolLandingPage.簡介`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "重點比較"
  - **Suggested key:** `tools.ToolLandingPage.重點比較`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "比較項目"
  - **Suggested key:** `tools.ToolLandingPage.比較項目`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "優點"
  - **Suggested key:** `tools.ToolLandingPage.優點`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "限制"
  - **Suggested key:** `tools.ToolLandingPage.限制`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "優點"
  - **Suggested key:** `tools.ToolLandingPage.優點`

- **Line:** 125
  - **Kind:** `jsx-text`
  - **Original:** "限制"
  - **Suggested key:** `tools.ToolLandingPage.限制`

- **Line:** 135
  - **Kind:** `jsx-text`
  - **Original:** "使用情境"
  - **Suggested key:** `tools.ToolLandingPage.使用情境`

- **Line:** 156
  - **Kind:** `jsx-text`
  - **Original:** "前往對應工具"
  - **Suggested key:** `tools.ToolLandingPage.前往對應工具`

- **Line:** 157
  - **Kind:** `jsx-text`
  - **Original:** "依本頁主題前往 RxV 工具開始操作。"
  - **Suggested key:** `tools.ToolLandingPage.依本頁主題前往_rxv_工具開始操作`

- **Line:** 166
  - **Kind:** `attr:title`
  - **Original:** "相關工具推薦"
  - **Suggested key:** `tools.ToolLandingPage.相關工具推薦`

- **Line:** 168
  - **Kind:** `attr:title`
  - **Original:** "熱門 SEO 主題頁"
  - **Suggested key:** `tools.ToolLandingPage.熱門_seo_主題頁`

- **Line:** 258
  - **Kind:** `jsx-text`
  - **Original:** "簡介"
  - **Suggested key:** `tools.ToolLandingPage.簡介`

- **Line:** 264
  - **Kind:** `jsx-text`
  - **Original:** "使用方式步驟"
  - **Suggested key:** `tools.ToolLandingPage.使用方式步驟`

- **Line:** 274
  - **Kind:** `jsx-text`
  - **Original:** "使用情境"
  - **Suggested key:** `tools.ToolLandingPage.使用情境`

- **Line:** 295
  - **Kind:** `jsx-text`
  - **Original:** "前往主工具"
  - **Suggested key:** `tools.ToolLandingPage.前往主工具`

- **Line:** 296
  - **Kind:** `jsx-text`
  - **Original:** "準備好後可直接進入主工具頁開始操作。"
  - **Suggested key:** `tools.ToolLandingPage.準備好後可直接進入主工具頁開始操作`

- **Line:** 305
  - **Kind:** `attr:title`
  - **Original:** "相關工具推薦"
  - **Suggested key:** `tools.ToolLandingPage.相關工具推薦`

- **Line:** 307
  - **Kind:** `attr:title`
  - **Original:** "熱門 SEO 主題頁"
  - **Suggested key:** `tools.ToolLandingPage.熱門_seo_主題頁`

### `src/pages/blog/FocusAndEmotion.tsx`（17 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🧩 專注與情緒，其實是雙向的"
  - **Suggested key:** `blog.FocusAndEmotion.專注與情緒_其實是雙向的`

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "🎯 當情緒影響專注時，大腦發生了什麼？"
  - **Suggested key:** `blog.FocusAndEmotion.當情緒影響專注時_大腦發生了什麼`

- **Line:** 33
  - **Kind:** `jsx-text`
  - **Original:** "焦慮："
  - **Suggested key:** `blog.FocusAndEmotion.焦慮`

- **Line:** 39
  - **Kind:** `jsx-text`
  - **Original:** "憤怒："
  - **Suggested key:** `blog.FocusAndEmotion.憤怒`

- **Line:** 45
  - **Kind:** `jsx-text`
  - **Original:** "悲傷："
  - **Suggested key:** `blog.FocusAndEmotion.悲傷`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "🪶 讓情緒幫助你「專注」的方法"
  - **Suggested key:** `blog.FocusAndEmotion.讓情緒幫助你_專注_的方法`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "覺察當下情緒："
  - **Suggested key:** `blog.FocusAndEmotion.覺察當下情緒`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "呼吸轉換："
  - **Suggested key:** `blog.FocusAndEmotion.呼吸轉換`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "將情緒轉化為動能："
  - **Suggested key:** `blog.FocusAndEmotion.將情緒轉化為動能`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "💡 結語：平靜是專注的最佳燃料"
  - **Suggested key:** `blog.FocusAndEmotion.結語_平靜是專注的最佳燃料`

- **Line:** 87
  - **Kind:** `jsx-text-en`
  - **Original:** "Focus and Emotion Work Both Ways"
  - **Suggested key:** `blog.FocusAndEmotion.focus_and_emotion_work_both_ways`

- **Line:** 94
  - **Kind:** `jsx-text-en`
  - **Original:** "What Happens When Emotion Affects Focus?"
  - **Suggested key:** `blog.FocusAndEmotion.what_happens_when_emotion_affects_fo`

- **Line:** 107
  - **Kind:** `jsx-text-en`
  - **Original:** "Methods to Help Emotion Serve Focus"
  - **Suggested key:** `blog.FocusAndEmotion.methods_to_help_emotion_serve_focus`

- **Line:** 110
  - **Kind:** `jsx-text-en`
  - **Original:** "Acknowledge your emotion:"
  - **Suggested key:** `blog.FocusAndEmotion.acknowledge_your_emotion`

- **Line:** 113
  - **Kind:** `jsx-text-en`
  - **Original:** "Breathing reset:"
  - **Suggested key:** `blog.FocusAndEmotion.breathing_reset`

- **Line:** 116
  - **Kind:** `jsx-text-en`
  - **Original:** "Transform emotion into action:"
  - **Suggested key:** `blog.FocusAndEmotion.transform_emotion_into_action`

- **Line:** 120
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: Calm Is the Best Fuel for Focus"
  - **Suggested key:** `blog.FocusAndEmotion.closing_calm_is_the_best_fuel_for_f`

### `src/pages/blog/FocusReset.tsx`（17 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "⚡ 為什麼專注力會「用完」？"
  - **Suggested key:** `blog.FocusReset.為什麼專注力會_用完`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🧠 五分鐘重啟法"
  - **Suggested key:** `blog.FocusReset.五分鐘重啟法`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "閉眼 30 秒："
  - **Suggested key:** `blog.FocusReset.閉眼_30_秒`

- **Line:** 35
  - **Kind:** `jsx-text`
  - **Original:** "深呼吸三次："
  - **Suggested key:** `blog.FocusReset.深呼吸三次`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "伸展肩頸與背部："
  - **Suggested key:** `blog.FocusReset.伸展肩頸與背部`

- **Line:** 41
  - **Kind:** `jsx-text`
  - **Original:** "注視遠方 20 秒："
  - **Suggested key:** `blog.FocusReset.注視遠方_20_秒`

- **Line:** 44
  - **Kind:** `jsx-text`
  - **Original:** "正念提問："
  - **Suggested key:** `blog.FocusReset.正念提問`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "🕹️ 番茄鐘與重啟的完美搭配"
  - **Suggested key:** `blog.FocusReset.番茄鐘與重啟的完美搭配`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "💡 結語：專注不是壓力，而是節奏"
  - **Suggested key:** `blog.FocusReset.結語_專注不是壓力_而是節奏`

- **Line:** 68
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Does Focus Run Out?"
  - **Suggested key:** `blog.FocusReset.why_does_focus_run_out`

- **Line:** 75
  - **Kind:** `jsx-text-en`
  - **Original:** "Five-Minute Reset"
  - **Suggested key:** `blog.FocusReset.five_minute_reset`

- **Line:** 78
  - **Kind:** `jsx-text-en`
  - **Original:** "Close your eyes (30s):"
  - **Suggested key:** `blog.FocusReset.close_your_eyes_30s`

- **Line:** 81
  - **Kind:** `jsx-text-en`
  - **Original:** "Deep breathing (3x):"
  - **Suggested key:** `blog.FocusReset.deep_breathing_3x`

- **Line:** 87
  - **Kind:** `jsx-text-en`
  - **Original:** "Look far (20s):"
  - **Suggested key:** `blog.FocusReset.look_far_20s`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Mindful Check-in:"
  - **Suggested key:** `blog.FocusReset.mindful_check_in`

- **Line:** 94
  - **Kind:** `jsx-text-en`
  - **Original:** "Perfect Pairing with Pomodoro"
  - **Suggested key:** `blog.FocusReset.perfect_pairing_with_pomodoro`

- **Line:** 100
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: Focus Is About Rhythm, Not Pressure"
  - **Suggested key:** `blog.FocusReset.closing_focus_is_about_rhythm_not`

### `src/pages/blog/GratitudeBreathJournal.tsx`（17 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌸 為什麼呼吸能成為感恩練習？"
  - **Suggested key:** `blog.GratitudeBreathJournal.為什麼呼吸能成為感恩練習`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🪷 三口感恩呼吸練習"
  - **Suggested key:** `blog.GratitudeBreathJournal.三口感恩呼吸練習`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "第一口氣：感謝自己"
  - **Suggested key:** `blog.GratitudeBreathJournal.第一口氣_感謝自己`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "第二口氣：感謝他人"
  - **Suggested key:** `blog.GratitudeBreathJournal.第二口氣_感謝他人`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "第三口氣：感謝當下"
  - **Suggested key:** `blog.GratitudeBreathJournal.第三口氣_感謝當下`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "📔 在 App 中建立「感恩呼吸日記」"
  - **Suggested key:** `blog.GratitudeBreathJournal.在_app_中建立_感恩呼吸日記`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "💞 習慣的力量"
  - **Suggested key:** `blog.GratitudeBreathJournal.習慣的力量`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "✨ 結語：平靜的紀錄，會閃光"
  - **Suggested key:** `blog.GratitudeBreathJournal.結語_平靜的紀錄_會閃光`

- **Line:** 75
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.GratitudeBreathJournal.english_version`

- **Line:** 76
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Can Breathing Be Gratitude Practice?"
  - **Suggested key:** `blog.GratitudeBreathJournal.why_can_breathing_be_gratitude_pract`

- **Line:** 82
  - **Kind:** `jsx-text-en`
  - **Original:** "Three Gratitude Breaths Practice"
  - **Suggested key:** `blog.GratitudeBreathJournal.three_gratitude_breaths_practice`

- **Line:** 85
  - **Kind:** `jsx-text-en`
  - **Original:** "First Breath: Thank Yourself:"
  - **Suggested key:** `blog.GratitudeBreathJournal.first_breath_thank_yourself`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Second Breath: Thank Others:"
  - **Suggested key:** `blog.GratitudeBreathJournal.second_breath_thank_others`

- **Line:** 95
  - **Kind:** `jsx-text-en`
  - **Original:** "Third Breath: Thank the Present:"
  - **Suggested key:** `blog.GratitudeBreathJournal.third_breath_thank_the_present`

- **Line:** 101
  - **Kind:** `jsx-text-en`
  - **Original:** "Build \"Gratitude Breath Journal\" in App"
  - **Suggested key:** `blog.GratitudeBreathJournal.build_gratitude_breath_journal_in`

- **Line:** 107
  - **Kind:** `jsx-text-en`
  - **Original:** "The Power of Habit"
  - **Suggested key:** `blog.GratitudeBreathJournal.the_power_of_habit`

- **Line:** 113
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Peaceful Records Will Shine"
  - **Suggested key:** `blog.GratitudeBreathJournal.conclusion_peaceful_records_will_sh`

### `src/pages/points.tsx`（17 筆）

- **Line:** 8
  - **Kind:** `jsx-text`
  - **Original:** "使用額度說明 - Pomodoro App"
  - **Suggested key:** `pages.points.使用額度說明_pomodoro_app`

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "使用額度制度說明"
  - **Suggested key:** `pages.points.使用額度制度說明`

- **Line:** 46
  - **Kind:** `jsx-text`
  - **Original:** "使用額度使用說明"
  - **Suggested key:** `pages.points.使用額度使用說明`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "🎁 新用戶免費體驗額度"
  - **Suggested key:** `pages.points.新用戶免費體驗額度`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "💳 付費使用方案"
  - **Suggested key:** `pages.points.付費使用方案`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "📌 使用額度計算說明"
  - **Suggested key:** `pages.points.使用額度計算說明`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "使用額度計算方式"
  - **Suggested key:** `pages.points.使用額度計算方式`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "使用與限制說明"
  - **Suggested key:** `pages.points.使用與限制說明`

- **Line:** 93
  - **Kind:** `jsx-text`
  - **Original:** "使用額度資訊僅作為功能使用說明與資源分配展示用途"
  - **Suggested key:** `pages.points.使用額度資訊僅作為功能使用說明與資源分配展示用途`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "不構成即時金流交易、訂閱扣款或自動續費"
  - **Suggested key:** `pages.points.不構成即時金流交易_訂閱扣款或自動續費`

- **Line:** 95
  - **Kind:** `jsx-text`
  - **Original:** "系統會依使用狀況設定體驗上限，以維持服務品質"
  - **Suggested key:** `pages.points.系統會依使用狀況設定體驗上限_以維持服務品質`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "重要聲明（請務必閱讀）"
  - **Suggested key:** `pages.points.重要聲明_請務必閱讀`

- **Line:** 105
  - **Kind:** `jsx-text`
  - **Original:** "本服務目前不涉及任何即時付款、訂閱制或自動扣款機制"
  - **Suggested key:** `pages.points.本服務目前不涉及任何即時付款_訂閱制或自動扣款機制`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "使用額度僅作為使用量顯示與功能規劃用途，非金錢或儲值金額"
  - **Suggested key:** `pages.points.使用額度僅作為使用量顯示與功能規劃用途_非金錢或儲值金額`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "本頁為服務功能說明文件，非購買頁面"
  - **Suggested key:** `pages.points.本頁為服務功能說明文件_非購買頁面`

- **Line:** 108
  - **Kind:** `jsx-text`
  - **Original:** "付費流程與金流服務將於綠界審核完成後另行公告"
  - **Suggested key:** `pages.points.付費流程與金流服務將於綠界審核完成後另行公告`

- **Line:** 115
  - **Kind:** `jsx-text`
  - **Original:** "聯絡方式"
  - **Suggested key:** `pages.points.聯絡方式`

### `src/pages/blog/232-clause-explained.tsx`（16 筆）

- **Line:** 9
  - **Kind:** `seo-title`
  - **Original:** "232 條款是什麼？為什麼台灣一直被提到？一次白話解釋"
  - **Suggested key:** `blog.232-clause-explained.232_條款是什麼_為什麼台灣一直被提到_一次白話解釋`

- **Line:** 9
  - **Kind:** `seo-description`
  - **Original:** "232 條款完整解析：了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及。用一般人能懂的方式說明對生活的影響。"
  - **Suggested key:** `blog.232-clause-explained.232_條款完整解析_了解什麼是_232_條款_為何與國家安全_進口關稅`

- **Line:** 9
  - **Kind:** `seo-keywords`
  - **Original:** "232 條款, 國家安全, 進口關稅, 台灣, 政策解釋"
  - **Suggested key:** `blog.232-clause-explained.232_條款_國家安全_進口關稅_台灣_政策解釋`

- **Line:** 10
  - **Kind:** `attr:title`
  - **Original:** "232 條款是什麼？為什麼台灣一直被提到？一次白話解釋"
  - **Suggested key:** `blog.232-clause-explained.232_條款是什麼_為什麼台灣一直被提到_一次白話解釋`

- **Line:** 11
  - **Kind:** `attr:description`
  - **Original:** "232 條款完整解析：了解什麼是 232 條款，為何與國家安全、進口關稅有關，以及為什麼台灣會被頻繁提及。用一般人能懂的方式說明對生活的影響。"
  - **Suggested key:** `blog.232-clause-explained.232_條款完整解析_了解什麼是_232_條款_為何與國家安全_進口關稅`

- **Line:** 47
  - **Kind:** `jsx-text`
  - **Original:** "什麼是 232 條款？"
  - **Suggested key:** `blog.232-clause-explained.什麼是_232_條款`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "為什麼與台灣有關？"
  - **Suggested key:** `blog.232-clause-explained.為什麼與台灣有關`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "台灣是重要的半導體和電子產品製造基地，許多產品出口到美國"
  - **Suggested key:** `blog.232-clause-explained.台灣是重要的半導體和電子產品製造基地_許多產品出口到美國`

- **Line:** 62
  - **Kind:** `jsx-text`
  - **Original:** "在美中貿易關係緊張的背景下，台灣的戰略地位更加突出"
  - **Suggested key:** `blog.232-clause-explained.在美中貿易關係緊張的背景下_台灣的戰略地位更加突出`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "如果美國對特定商品實施 232 條款關稅，可能影響台灣相關產業的出口"
  - **Suggested key:** `blog.232-clause-explained.如果美國對特定商品實施_232_條款關稅_可能影響台灣相關產業的出口`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "台灣的產業結構與全球供應鏈緊密相連，任何貿易政策調整都可能產生連鎖反應"
  - **Suggested key:** `blog.232-clause-explained.台灣的產業結構與全球供應鏈緊密相連_任何貿易政策調整都可能產生連鎖反應`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "這跟你有沒有直接關係？"
  - **Suggested key:** `blog.232-clause-explained.這跟你有沒有直接關係`

- **Line:** 97
  - **Kind:** `jsx-text`
  - **Original:** "物價層面"
  - **Suggested key:** `blog.232-clause-explained.物價層面`

- **Line:** 102
  - **Kind:** `jsx-text`
  - **Original:** "產業層面"
  - **Suggested key:** `blog.232-clause-explained.產業層面`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "工作層面"
  - **Suggested key:** `blog.232-clause-explained.工作層面`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "提醒："
  - **Suggested key:** `blog.232-clause-explained.提醒`

### `src/pages/tools/shopee-csv/index.tsx`（15 筆）

- **Line:** 167
  - **Kind:** `seo-title`
  - **Original:** "Shopee CSV 腳本工具｜免費Shopee CSV 腳本工具 - RxV AI工具中心"
  - **Suggested key:** `shopee-csv.index.shopee_csv_腳本工具_免費shopee_csv_腳本工具`

- **Line:** 167
  - **Kind:** `seo-description`
  - **Original:** "免費Shopee CSV 腳本工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `shopee-csv.index.免費shopee_csv_腳本工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 167
  - **Kind:** `seo-keywords`
  - **Original:** "Shopee CSV 腳本工具, AI工具, 免費工具"
  - **Suggested key:** `shopee-csv.index.shopee_csv_腳本工具_ai工具_免費工具`

- **Line:** 168
  - **Kind:** `attr:title`
  - **Original:** "Shopee CSV 腳本工具｜免費Shopee CSV 腳本工具 - RxV AI工具中心"
  - **Suggested key:** `shopee-csv.index.shopee_csv_腳本工具_免費shopee_csv_腳本工具`

- **Line:** 169
  - **Kind:** `attr:description`
  - **Original:** "免費Shopee CSV 腳本工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `shopee-csv.index.免費shopee_csv_腳本工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 174
  - **Kind:** `jsx-text`
  - **Original:** "Shopee CSV 腳本工具（免費）｜AI工具推薦"
  - **Suggested key:** `shopee-csv.index.shopee_csv_腳本工具_免費_ai工具推薦`

- **Line:** 275
  - **Kind:** `jsx-text`
  - **Original:** "什麼是Shopee CSV 腳本工具？"
  - **Suggested key:** `shopee-csv.index.什麼是shopee_csv_腳本工具`

- **Line:** 280
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `shopee-csv.index.為什麼使用這個工具`

- **Line:** 282
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `shopee-csv.index.免費使用`

- **Line:** 283
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `shopee-csv.index.不需安裝`

- **Line:** 284
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `shopee-csv.index.支援快速處理`

- **Line:** 287
  - **Kind:** `jsx-text`
  - **Original:** "更多相關工具"
  - **Suggested key:** `shopee-csv.index.更多相關工具`

- **Line:** 289
  - **Kind:** `jsx-text`
  - **Original:** "工具中心"
  - **Suggested key:** `shopee-csv.index.工具中心`

- **Line:** 290
  - **Kind:** `jsx-text`
  - **Original:** "AI摘要工具"
  - **Suggested key:** `shopee-csv.index.ai摘要工具`

- **Line:** 291
  - **Kind:** `jsx-text`
  - **Original:** "AI作業解題"
  - **Suggested key:** `shopee-csv.index.ai作業解題`

### `src/pages/blog/BreathPrayer.tsx`（14 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🙏 為什麼呼吸能連結祈願？"
  - **Suggested key:** `blog.BreathPrayer.為什麼呼吸能連結祈願`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🕊️ 三步祈願呼吸法"
  - **Suggested key:** `blog.BreathPrayer.三步祈願呼吸法`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 吸氣：感受祝福流入"
  - **Suggested key:** `blog.BreathPrayer.1_吸氣_感受祝福流入`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 停留：許下心願"
  - **Suggested key:** `blog.BreathPrayer.2_停留_許下心願`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 吐氣：將祝福傳遞出去"
  - **Suggested key:** `blog.BreathPrayer.3_吐氣_將祝福傳遞出去`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "🌸 與 App「願望牆」搭配練習"
  - **Suggested key:** `blog.BreathPrayer.與_app_願望牆_搭配練習`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "💖 將呼吸化為祝福習慣"
  - **Suggested key:** `blog.BreathPrayer.將呼吸化為祝福習慣`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "✨ 結語：一呼一吸，皆是修行"
  - **Suggested key:** `blog.BreathPrayer.結語_一呼一吸_皆是修行`

- **Line:** 74
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.BreathPrayer.english_version`

- **Line:** 75
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Can Breathing Connect with Prayer?"
  - **Suggested key:** `blog.BreathPrayer.why_can_breathing_connect_with_praye`

- **Line:** 82
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Step Prayer Breathing"
  - **Suggested key:** `blog.BreathPrayer.three_step_prayer_breathing`

- **Line:** 101
  - **Kind:** `jsx-text-en`
  - **Original:** "Practice with App \"Wish Wall\""
  - **Suggested key:** `blog.BreathPrayer.practice_with_app_wish_wall`

- **Line:** 108
  - **Kind:** `jsx-text-en`
  - **Original:** "Transform Breath into a Blessing Habit"
  - **Suggested key:** `blog.BreathPrayer.transform_breath_into_a_blessing_hab`

- **Line:** 115
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Every Breath Is Practice"
  - **Suggested key:** `blog.BreathPrayer.conclusion_every_breath_is_practice`

### `src/pages/blog/ChantEnergyBreath.tsx`（14 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌟 呼吸 × 願望：讓氣息帶著祈願飛翔"
  - **Suggested key:** `blog.ChantEnergyBreath.呼吸_願望_讓氣息帶著祈願飛翔`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "💫 三步驟集氣呼吸法"
  - **Suggested key:** `blog.ChantEnergyBreath.三步驟集氣呼吸法`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 吸氣：聚集願力"
  - **Suggested key:** `blog.ChantEnergyBreath.1_吸氣_聚集願力`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 停留：能量凝聚"
  - **Suggested key:** `blog.ChantEnergyBreath.2_停留_能量凝聚`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 吐氣：傳遞祝福"
  - **Suggested key:** `blog.ChantEnergyBreath.3_吐氣_傳遞祝福`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "🌈 與「集氣牆」模組整合"
  - **Suggested key:** `blog.ChantEnergyBreath.與_集氣牆_模組整合`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 心理學觀點：呼吸能強化意念實現力"
  - **Suggested key:** `blog.ChantEnergyBreath.心理學觀點_呼吸能強化意念實現力`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "💖 結語：願氣成光，光即祝福"
  - **Suggested key:** `blog.ChantEnergyBreath.結語_願氣成光_光即祝福`

- **Line:** 76
  - **Kind:** `jsx-text-en`
  - **Original:** "English Version"
  - **Suggested key:** `blog.ChantEnergyBreath.english_version`

- **Line:** 77
  - **Kind:** `jsx-text-en`
  - **Original:** "Breath × Wish: Let Air Carry Prayers"
  - **Suggested key:** `blog.ChantEnergyBreath.breath_wish_let_air_carry_prayers`

- **Line:** 83
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Step Energy Chant Breathing"
  - **Suggested key:** `blog.ChantEnergyBreath.three_step_energy_chant_breathing`

- **Line:** 99
  - **Kind:** `jsx-text-en`
  - **Original:** "Integrate with \"Chant Wall\" Module"
  - **Suggested key:** `blog.ChantEnergyBreath.integrate_with_chant_wall_module`

- **Line:** 106
  - **Kind:** `jsx-text-en`
  - **Original:** "Psychological Insight: Breathing Enhances Manifestation"
  - **Suggested key:** `blog.ChantEnergyBreath.psychological_insight_breathing_enh`

- **Line:** 112
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Wish Becomes Light, Light Becomes Blessing"
  - **Suggested key:** `blog.ChantEnergyBreath.conclusion_wish_becomes_light_ligh`

### `src/pages/blog/EmotionalDetox.tsx`（14 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌬️ 為什麼情緒也需要「排毒」？"
  - **Suggested key:** `blog.EmotionalDetox.為什麼情緒也需要_排毒`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🖋️ 書寫淨化三步驟"
  - **Suggested key:** `blog.EmotionalDetox.書寫淨化三步驟`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "寫下你今天的情緒："
  - **Suggested key:** `blog.EmotionalDetox.寫下你今天的情緒`

- **Line:** 35
  - **Kind:** `jsx-text`
  - **Original:** "辨識情緒來源："
  - **Suggested key:** `blog.EmotionalDetox.辨識情緒來源`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "轉化能量："
  - **Suggested key:** `blog.EmotionalDetox.轉化能量`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "🕊️ 書寫時的小建議"
  - **Suggested key:** `blog.EmotionalDetox.書寫時的小建議`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "🌈 結語：讓心回到清澈狀態"
  - **Suggested key:** `blog.EmotionalDetox.結語_讓心回到清澈狀態`

- **Line:** 62
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Emotions Need Detox"
  - **Suggested key:** `blog.EmotionalDetox.why_emotions_need_detox`

- **Line:** 69
  - **Kind:** `jsx-text-en`
  - **Original:** "Writing Cleanse in Three Steps"
  - **Suggested key:** `blog.EmotionalDetox.writing_cleanse_in_three_steps`

- **Line:** 72
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 1 – Write your feelings:"
  - **Suggested key:** `blog.EmotionalDetox.step_1_write_your_feelings`

- **Line:** 75
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 2 – Identify the source:"
  - **Suggested key:** `blog.EmotionalDetox.step_2_identify_the_source`

- **Line:** 78
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 3 – Transform the energy:"
  - **Suggested key:** `blog.EmotionalDetox.step_3_transform_the_energy`

- **Line:** 82
  - **Kind:** `jsx-text-en`
  - **Original:** "Writing Tips"
  - **Suggested key:** `blog.EmotionalDetox.writing_tips`

- **Line:** 88
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: Return Your Heart to Clarity"
  - **Suggested key:** `blog.EmotionalDetox.closing_return_your_heart_to_clarit`

### `src/pages/blog/EveningBreath.tsx`（14 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌙 為什麼夜晚呼吸特別重要？"
  - **Suggested key:** `blog.EveningBreath.為什麼夜晚呼吸特別重要`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🌬️ 三步驟夜間放鬆呼吸法"
  - **Suggested key:** `blog.EveningBreath.三步驟夜間放鬆呼吸法`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "第一步：放慢呼吸節奏"
  - **Suggested key:** `blog.EveningBreath.第一步_放慢呼吸節奏`

- **Line:** 39
  - **Kind:** `jsx-text`
  - **Original:** "第二步：放鬆身體重心"
  - **Suggested key:** `blog.EveningBreath.第二步_放鬆身體重心`

- **Line:** 46
  - **Kind:** `jsx-text`
  - **Original:** "第三步：心靜呼吸法"
  - **Suggested key:** `blog.EveningBreath.第三步_心靜呼吸法`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "🪷 與冥想或睡前音樂結合"
  - **Suggested key:** `blog.EveningBreath.與冥想或睡前音樂結合`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "💤 結語：一口氣，卸下整天的世界"
  - **Suggested key:** `blog.EveningBreath.結語_一口氣_卸下整天的世界`

- **Line:** 75
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Evening Breathing Matters"
  - **Suggested key:** `blog.EveningBreath.why_evening_breathing_matters`

- **Line:** 81
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Step Evening Relaxation Breath"
  - **Suggested key:** `blog.EveningBreath.three_step_evening_relaxation_breath`

- **Line:** 84
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 1 – Slow the Rhythm:"
  - **Suggested key:** `blog.EveningBreath.step_1_slow_the_rhythm`

- **Line:** 87
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 2 – Ground the Body:"
  - **Suggested key:** `blog.EveningBreath.step_2_ground_the_body`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 3 – Peaceful Breathing:"
  - **Suggested key:** `blog.EveningBreath.step_3_peaceful_breathing`

- **Line:** 94
  - **Kind:** `jsx-text-en`
  - **Original:** "Combine with Meditation or Sleep Music"
  - **Suggested key:** `blog.EveningBreath.combine_with_meditation_or_sleep_mus`

- **Line:** 100
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: One Breath, Release the Whole Day"
  - **Suggested key:** `blog.EveningBreath.closing_one_breath_release_the_who`

### `src/pages/blog/FocusMeditation.tsx`（14 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌿 為什麼冥想能提升專注力？"
  - **Suggested key:** `blog.FocusMeditation.為什麼冥想能提升專注力`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "⏳ 三分鐘專注冥想步驟"
  - **Suggested key:** `blog.FocusMeditation.三分鐘專注冥想步驟`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "第一分鐘：呼吸定位"
  - **Suggested key:** `blog.FocusMeditation.第一分鐘_呼吸定位`

- **Line:** 39
  - **Kind:** `jsx-text`
  - **Original:** "第二分鐘：感官覺察"
  - **Suggested key:** `blog.FocusMeditation.第二分鐘_感官覺察`

- **Line:** 46
  - **Kind:** `jsx-text`
  - **Original:** "第三分鐘：放下思緒"
  - **Suggested key:** `blog.FocusMeditation.第三分鐘_放下思緒`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "💭 專注冥想 × 番茄鐘"
  - **Suggested key:** `blog.FocusMeditation.專注冥想_番茄鐘`

- **Line:** 62
  - **Kind:** `jsx-text`
  - **Original:** "✨ 結語：專注，是一種溫柔的力量"
  - **Suggested key:** `blog.FocusMeditation.結語_專注_是一種溫柔的力量`

- **Line:** 73
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Meditation Improves Focus"
  - **Suggested key:** `blog.FocusMeditation.why_meditation_improves_focus`

- **Line:** 80
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Minute Focus Meditation Steps"
  - **Suggested key:** `blog.FocusMeditation.three_minute_focus_meditation_steps`

- **Line:** 83
  - **Kind:** `jsx-text-en`
  - **Original:** "Minute 1 – Breathing Awareness:"
  - **Suggested key:** `blog.FocusMeditation.minute_1_breathing_awareness`

- **Line:** 86
  - **Kind:** `jsx-text-en`
  - **Original:** "Minute 2 – Sensory Awareness:"
  - **Suggested key:** `blog.FocusMeditation.minute_2_sensory_awareness`

- **Line:** 89
  - **Kind:** `jsx-text-en`
  - **Original:** "Minute 3 – Letting Go:"
  - **Suggested key:** `blog.FocusMeditation.minute_3_letting_go`

- **Line:** 93
  - **Kind:** `jsx-text-en`
  - **Original:** "Focus Meditation × Pomodoro"
  - **Suggested key:** `blog.FocusMeditation.focus_meditation_pomodoro`

- **Line:** 99
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: Focus Is a Gentle Strength"
  - **Suggested key:** `blog.FocusMeditation.closing_focus_is_a_gentle_strength`

### `src/pages/blog/MorningBreath.tsx`（14 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌤️ 為什麼要練習晨間呼吸？"
  - **Suggested key:** `blog.MorningBreath.為什麼要練習晨間呼吸`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🌺 三分鐘晨間呼吸法"
  - **Suggested key:** `blog.MorningBreath.三分鐘晨間呼吸法`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "第一分鐘：喚醒呼吸"
  - **Suggested key:** `blog.MorningBreath.第一分鐘_喚醒呼吸`

- **Line:** 39
  - **Kind:** `jsx-text`
  - **Original:** "第二分鐘：身體覺察"
  - **Suggested key:** `blog.MorningBreath.第二分鐘_身體覺察`

- **Line:** 46
  - **Kind:** `jsx-text`
  - **Original:** "第三分鐘：正能量呼吸"
  - **Suggested key:** `blog.MorningBreath.第三分鐘_正能量呼吸`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "🌞 結合晨間儀式的力量"
  - **Suggested key:** `blog.MorningBreath.結合晨間儀式的力量`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "✨ 結語：用一口氣，開啟光亮的一天"
  - **Suggested key:** `blog.MorningBreath.結語_用一口氣_開啟光亮的一天`

- **Line:** 74
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Practice Morning Breathing?"
  - **Suggested key:** `blog.MorningBreath.why_practice_morning_breathing`

- **Line:** 81
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Minute Morning Breathing Method"
  - **Suggested key:** `blog.MorningBreath.three_minute_morning_breathing_metho`

- **Line:** 84
  - **Kind:** `jsx-text-en`
  - **Original:** "Minute 1 – Awakening Breath:"
  - **Suggested key:** `blog.MorningBreath.minute_1_awakening_breath`

- **Line:** 87
  - **Kind:** `jsx-text-en`
  - **Original:** "Minute 2 – Body Awareness:"
  - **Suggested key:** `blog.MorningBreath.minute_2_body_awareness`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Minute 3 – Positive Flow:"
  - **Suggested key:** `blog.MorningBreath.minute_3_positive_flow`

- **Line:** 94
  - **Kind:** `jsx-text-en`
  - **Original:** "The Power of Morning Rituals"
  - **Suggested key:** `blog.MorningBreath.the_power_of_morning_rituals`

- **Line:** 101
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: One Breath, One Bright Day"
  - **Suggested key:** `blog.MorningBreath.closing_one_breath_one_bright_day`

### `src/pages/blog/NightReset.tsx`（14 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌌 為什麼需要夜間重啟？"
  - **Suggested key:** `blog.NightReset.為什麼需要夜間重啟`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 三步驟放鬆儀式"
  - **Suggested key:** `blog.NightReset.三步驟放鬆儀式`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "調整光線："
  - **Suggested key:** `blog.NightReset.調整光線`

- **Line:** 35
  - **Kind:** `jsx-text`
  - **Original:** "呼吸釋放："
  - **Suggested key:** `blog.NightReset.呼吸釋放`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "感恩書寫："
  - **Suggested key:** `blog.NightReset.感恩書寫`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "🌙 聽覺與香氣的療癒力量"
  - **Suggested key:** `blog.NightReset.聽覺與香氣的療癒力量`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "💤 結語：為夢境留下一盞溫柔的燈"
  - **Suggested key:** `blog.NightReset.結語_為夢境留下一盞溫柔的燈`

- **Line:** 62
  - **Kind:** `jsx-text-en`
  - **Original:** "Why You Need a Night Reset"
  - **Suggested key:** `blog.NightReset.why_you_need_a_night_reset`

- **Line:** 68
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Step Relaxation Ritual"
  - **Suggested key:** `blog.NightReset.three_step_relaxation_ritual`

- **Line:** 71
  - **Kind:** `jsx-text-en`
  - **Original:** "Soften the Light:"
  - **Suggested key:** `blog.NightReset.soften_the_light`

- **Line:** 74
  - **Kind:** `jsx-text-en`
  - **Original:** "Breathing Reset:"
  - **Suggested key:** `blog.NightReset.breathing_reset`

- **Line:** 77
  - **Kind:** `jsx-text-en`
  - **Original:** "Gratitude Writing:"
  - **Suggested key:** `blog.NightReset.gratitude_writing`

- **Line:** 81
  - **Kind:** `jsx-text-en`
  - **Original:** "The Healing Power of Sound and Scent"
  - **Suggested key:** `blog.NightReset.the_healing_power_of_sound_and_scent`

- **Line:** 87
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: Leave a Gentle Light for Your Dreams"
  - **Suggested key:** `blog.NightReset.closing_leave_a_gentle_light_for_yo`

### `src/pages/admin/images.tsx`（13 筆）

- **Line:** 307
  - **Kind:** `jsx-text`
  - **Original:** "載入分類中..."
  - **Suggested key:** `admin.images.載入分類中`

- **Line:** 309
  - **Kind:** `jsx-text`
  - **Original:** "目前沒有可用的分類"
  - **Suggested key:** `admin.images.目前沒有可用的分類`

- **Line:** 322
  - **Kind:** `jsx-text`
  - **Original:** "請選擇分類"
  - **Suggested key:** `admin.images.請選擇分類`

- **Line:** 331
  - **Kind:** `jsx-text`
  - **Original:** "請先選擇圖片分類"
  - **Suggested key:** `admin.images.請先選擇圖片分類`

- **Line:** 351
  - **Kind:** `jsx-text`
  - **Original:** "請選擇方案"
  - **Suggested key:** `admin.images.請選擇方案`

- **Line:** 352
  - **Kind:** `jsx-text`
  - **Original:** "免費圖片"
  - **Suggested key:** `admin.images.免費圖片`

- **Line:** 353
  - **Kind:** `jsx-text`
  - **Original:** "會員圖片（NT$99）"
  - **Suggested key:** `admin.images.會員圖片_nt_99`

- **Line:** 354
  - **Kind:** `jsx-text`
  - **Original:** "高級圖片（NT$199）"
  - **Suggested key:** `admin.images.高級圖片_nt_199`

- **Line:** 357
  - **Kind:** `jsx-text`
  - **Original:** "請先選擇圖片方案"
  - **Suggested key:** `admin.images.請先選擇圖片方案`

- **Line:** 448
  - **Kind:** `jsx-text`
  - **Original:** "• 上傳的圖片會儲存到 Supabase Storage 的"
  - **Suggested key:** `admin.images.上傳的圖片會儲存到_supabase_storage_的`

- **Line:** 449
  - **Kind:** `jsx-text`
  - **Original:** "• 檔名格式："
  - **Suggested key:** `admin.images.檔名格式`

- **Line:** 450
  - **Kind:** `jsx-text`
  - **Original:** "• 上傳成功後會自動將圖片資訊寫入 images 資料表"
  - **Suggested key:** `admin.images.上傳成功後會自動將圖片資訊寫入_images_資料表`

- **Line:** 451
  - **Kind:** `jsx-text`
  - **Original:** "• 上傳成功後可在 console 查看回傳結果"
  - **Suggested key:** `admin.images.上傳成功後可在_console_查看回傳結果`

### `src/pages/blog/FocusBreath.tsx`（13 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🎯 為什麼呼吸能提升專注力？"
  - **Suggested key:** `blog.FocusBreath.為什麼呼吸能提升專注力`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🔥 三階段專注呼吸訓練"
  - **Suggested key:** `blog.FocusBreath.三階段專注呼吸訓練`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "1️⃣ 調息（Preparation）："
  - **Suggested key:** `blog.FocusBreath.1_調息_preparation`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "2️⃣ 集中（Alignment）："
  - **Suggested key:** `blog.FocusBreath.2_集中_alignment`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "3️⃣ 啟動（Activation）："
  - **Suggested key:** `blog.FocusBreath.3_啟動_activation`

- **Line:** 48
  - **Kind:** `jsx-text`
  - **Original:** "🧘‍♀️ 與番茄鐘結合的練習方式"
  - **Suggested key:** `blog.FocusBreath.與番茄鐘結合的練習方式`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "💡 專業心理學觀點"
  - **Suggested key:** `blog.FocusBreath.專業心理學觀點`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "🚀 結語：讓呼吸成為專注的開關"
  - **Suggested key:** `blog.FocusBreath.結語_讓呼吸成為專注的開關`

- **Line:** 76
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Can Breathing Enhance Focus?"
  - **Suggested key:** `blog.FocusBreath.why_can_breathing_enhance_focus`

- **Line:** 82
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Stage Focus Breathing Practice"
  - **Suggested key:** `blog.FocusBreath.three_stage_focus_breathing_practice`

- **Line:** 99
  - **Kind:** `jsx-text-en`
  - **Original:** "Integrating with Pomodoro Practice"
  - **Suggested key:** `blog.FocusBreath.integrating_with_pomodoro_practice`

- **Line:** 105
  - **Kind:** `jsx-text-en`
  - **Original:** "Psychological Insight"
  - **Suggested key:** `blog.FocusBreath.psychological_insight`

- **Line:** 111
  - **Kind:** `jsx-text-en`
  - **Original:** "Conclusion: Let Breath Be Your Focus Switch"
  - **Suggested key:** `blog.FocusBreath.conclusion_let_breath_be_your_focus`

### `src/pages/blog/MorningRitual.tsx`（13 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌅 為什麼需要早晨儀式？"
  - **Suggested key:** `blog.MorningRitual.為什麼需要早晨儀式`

- **Line:** 28
  - **Kind:** `jsx-text`
  - **Original:** "🌞 建立你的早晨三步驟"
  - **Suggested key:** `blog.MorningRitual.建立你的早晨三步驟`

- **Line:** 31
  - **Kind:** `jsx-text`
  - **Original:** "靜坐 1 分鐘："
  - **Suggested key:** `blog.MorningRitual.靜坐_1_分鐘`

- **Line:** 34
  - **Kind:** `jsx-text`
  - **Original:** "感恩練習："
  - **Suggested key:** `blog.MorningRitual.感恩練習`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "設定意圖："
  - **Suggested key:** `blog.MorningRitual.設定意圖`

- **Line:** 41
  - **Kind:** `jsx-text`
  - **Original:** "🕯️ 一杯水、一個笑容"
  - **Suggested key:** `blog.MorningRitual.一杯水_一個笑容`

- **Line:** 49
  - **Kind:** `jsx-text`
  - **Original:** "🌸 結語：給自己溫柔的開始"
  - **Suggested key:** `blog.MorningRitual.結語_給自己溫柔的開始`

- **Line:** 60
  - **Kind:** `jsx-text-en`
  - **Original:** "Why You Need a Morning Ritual"
  - **Suggested key:** `blog.MorningRitual.why_you_need_a_morning_ritual`

- **Line:** 66
  - **Kind:** `jsx-text-en`
  - **Original:** "Your Morning Ritual in Three Steps"
  - **Suggested key:** `blog.MorningRitual.your_morning_ritual_in_three_steps`

- **Line:** 72
  - **Kind:** `jsx-text-en`
  - **Original:** "Gratitude Practice:"
  - **Suggested key:** `blog.MorningRitual.gratitude_practice`

- **Line:** 75
  - **Kind:** `jsx-text-en`
  - **Original:** "Set an Intention:"
  - **Suggested key:** `blog.MorningRitual.set_an_intention`

- **Line:** 79
  - **Kind:** `jsx-text-en`
  - **Original:** "A Glass of Water, a Smile"
  - **Suggested key:** `blog.MorningRitual.a_glass_of_water_a_smile`

- **Line:** 85
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: A Gentle Start"
  - **Suggested key:** `blog.MorningRitual.closing_a_gentle_start`

### `src/pages/blog/SelfDialogueMeditation.tsx`（13 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🫧 為什麼要練習「與自己對話」？"
  - **Suggested key:** `blog.SelfDialogueMeditation.為什麼要練習_與自己對話`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "💬 三步驟內在對話練習"
  - **Suggested key:** `blog.SelfDialogueMeditation.三步驟內在對話練習`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "靜心觀察："
  - **Suggested key:** `blog.SelfDialogueMeditation.靜心觀察`

- **Line:** 35
  - **Kind:** `jsx-text`
  - **Original:** "誠實傾聽："
  - **Suggested key:** `blog.SelfDialogueMeditation.誠實傾聽`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "溫柔回應："
  - **Suggested key:** `blog.SelfDialogueMeditation.溫柔回應`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "🪞 鏡子前的練習"
  - **Suggested key:** `blog.SelfDialogueMeditation.鏡子前的練習`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "🌿 結語：與自己成為朋友"
  - **Suggested key:** `blog.SelfDialogueMeditation.結語_與自己成為朋友`

- **Line:** 63
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Practice Self-Dialogue?"
  - **Suggested key:** `blog.SelfDialogueMeditation.why_practice_self_dialogue`

- **Line:** 70
  - **Kind:** `jsx-text-en`
  - **Original:** "Inner Dialogue Practice in Three Steps"
  - **Suggested key:** `blog.SelfDialogueMeditation.inner_dialogue_practice_in_three_ste`

- **Line:** 76
  - **Kind:** `jsx-text-en`
  - **Original:** "Listen Honestly:"
  - **Suggested key:** `blog.SelfDialogueMeditation.listen_honestly`

- **Line:** 79
  - **Kind:** `jsx-text-en`
  - **Original:** "Respond Kindly:"
  - **Suggested key:** `blog.SelfDialogueMeditation.respond_kindly`

- **Line:** 83
  - **Kind:** `jsx-text-en`
  - **Original:** "Mirror Practice"
  - **Suggested key:** `blog.SelfDialogueMeditation.mirror_practice`

- **Line:** 90
  - **Kind:** `jsx-text-en`
  - **Original:** "Closing: Become Friends with Yourself"
  - **Suggested key:** `blog.SelfDialogueMeditation.closing_become_friends_with_yoursel`

### `src/pages/admin/dashboard.tsx`（12 筆）

- **Line:** 188
  - **Kind:** `jsx-text`
  - **Original:** "管理員 Dashboard - 載入中"
  - **Suggested key:** `admin.dashboard.管理員_dashboard_載入中`

- **Line:** 192
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `admin.dashboard.載入中`

- **Line:** 204
  - **Kind:** `jsx-text`
  - **Original:** "無權限存取"
  - **Suggested key:** `admin.dashboard.無權限存取`

- **Line:** 208
  - **Kind:** `jsx-text`
  - **Original:** "無權限存取"
  - **Suggested key:** `admin.dashboard.無權限存取`

- **Line:** 209
  - **Kind:** `jsx-text`
  - **Original:** "你沒有權限存取此頁面"
  - **Suggested key:** `admin.dashboard.你沒有權限存取此頁面`

- **Line:** 211
  - **Kind:** `jsx-text`
  - **Original:** "前往方案頁"
  - **Suggested key:** `admin.dashboard.前往方案頁`

- **Line:** 223
  - **Kind:** `jsx-text`
  - **Original:** "管理員 Dashboard"
  - **Suggested key:** `admin.dashboard.管理員_dashboard`

- **Line:** 293
  - **Kind:** `jsx-text`
  - **Original:** "✅ 目前沒有待處理的匯款"
  - **Suggested key:** `admin.dashboard.目前沒有待處理的匯款`

- **Line:** 363
  - **Kind:** `jsx-text`
  - **Original:** "今天是否有新的匯款？"
  - **Suggested key:** `admin.dashboard.今天是否有新的匯款`

- **Line:** 367
  - **Kind:** `jsx-text`
  - **Original:** "是否所有 pending 都已補點？"
  - **Suggested key:** `admin.dashboard.是否所有_pending_都已補點`

- **Line:** 371
  - **Kind:** `jsx-text`
  - **Original:** "user_credits 是否正常增加？"
  - **Suggested key:** `admin.dashboard.user_credits_是否正常增加`

- **Line:** 375
  - **Kind:** `jsx-text`
  - **Original:** "是否有使用者回報問題？"
  - **Suggested key:** `admin.dashboard.是否有使用者回報問題`

### `src/pages/blog/AfternoonStretch.tsx`（12 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "☀️ 為什麼中午特別需要活動？"
  - **Suggested key:** `blog.AfternoonStretch.為什麼中午特別需要活動`

- **Line:** 28
  - **Kind:** `jsx-text`
  - **Original:** "🪶 三步驟快速伸展法"
  - **Suggested key:** `blog.AfternoonStretch.三步驟快速伸展法`

- **Line:** 31
  - **Kind:** `jsx-text`
  - **Original:** "肩頸舒展："
  - **Suggested key:** `blog.AfternoonStretch.肩頸舒展`

- **Line:** 34
  - **Kind:** `jsx-text`
  - **Original:** "脊椎伸展："
  - **Suggested key:** `blog.AfternoonStretch.脊椎伸展`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "側身扭轉："
  - **Suggested key:** `blog.AfternoonStretch.側身扭轉`

- **Line:** 43
  - **Kind:** `jsx-text`
  - **Original:** "🌿 心靈重啟的 3 分鐘"
  - **Suggested key:** `blog.AfternoonStretch.心靈重啟的_3_分鐘`

- **Line:** 54
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Midday Movement Matters"
  - **Suggested key:** `blog.AfternoonStretch.why_midday_movement_matters`

- **Line:** 60
  - **Kind:** `jsx-text-en`
  - **Original:** "Three-Step Quick Stretch"
  - **Suggested key:** `blog.AfternoonStretch.three_step_quick_stretch`

- **Line:** 63
  - **Kind:** `jsx-text-en`
  - **Original:** "Neck & Shoulder Stretch:"
  - **Suggested key:** `blog.AfternoonStretch.neck_shoulder_stretch`

- **Line:** 66
  - **Kind:** `jsx-text-en`
  - **Original:** "Spine Extension:"
  - **Suggested key:** `blog.AfternoonStretch.spine_extension`

- **Line:** 69
  - **Kind:** `jsx-text-en`
  - **Original:** "Side Twist:"
  - **Suggested key:** `blog.AfternoonStretch.side_twist`

- **Line:** 73
  - **Kind:** `jsx-text-en`
  - **Original:** "A Three-Minute Mind Reset"
  - **Suggested key:** `blog.AfternoonStretch.a_three_minute_mind_reset`

### `src/pages/blog/HealthyLunch.tsx`（12 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌤️ 午餐的重要性"
  - **Suggested key:** `blog.HealthyLunch.午餐的重要性`

- **Line:** 28
  - **Kind:** `jsx-text`
  - **Original:** "🥗 三個維持穩定能量的小祕訣"
  - **Suggested key:** `blog.HealthyLunch.三個維持穩定能量的小祕訣`

- **Line:** 31
  - **Kind:** `jsx-text`
  - **Original:** "搭配高纖蔬菜："
  - **Suggested key:** `blog.HealthyLunch.搭配高纖蔬菜`

- **Line:** 34
  - **Kind:** `jsx-text`
  - **Original:** "選擇良好蛋白質："
  - **Suggested key:** `blog.HealthyLunch.選擇良好蛋白質`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "減少過量澱粉與糖："
  - **Suggested key:** `blog.HealthyLunch.減少過量澱粉與糖`

- **Line:** 43
  - **Kind:** `jsx-text`
  - **Original:** "🍵 心靈補給的小儀式"
  - **Suggested key:** `blog.HealthyLunch.心靈補給的小儀式`

- **Line:** 54
  - **Kind:** `jsx-text-en`
  - **Original:** "The Importance of Lunch"
  - **Suggested key:** `blog.HealthyLunch.the_importance_of_lunch`

- **Line:** 60
  - **Kind:** `jsx-text-en`
  - **Original:** "Three Tips for Stable Energy"
  - **Suggested key:** `blog.HealthyLunch.three_tips_for_stable_energy`

- **Line:** 63
  - **Kind:** `jsx-text-en`
  - **Original:** "Eat more fiber:"
  - **Suggested key:** `blog.HealthyLunch.eat_more_fiber`

- **Line:** 66
  - **Kind:** `jsx-text-en`
  - **Original:** "Choose lean proteins:"
  - **Suggested key:** `blog.HealthyLunch.choose_lean_proteins`

- **Line:** 69
  - **Kind:** `jsx-text-en`
  - **Original:** "Limit refined carbs:"
  - **Suggested key:** `blog.HealthyLunch.limit_refined_carbs`

- **Line:** 73
  - **Kind:** `jsx-text-en`
  - **Original:** "A Mindful Eating Practice"
  - **Suggested key:** `blog.HealthyLunch.a_mindful_eating_practice`

### `src/pages/pricing/index.tsx`（12 筆）

- **Line:** 273
  - **Kind:** `jsx-text`
  - **Original:** "繁體中文"
  - **Suggested key:** `pricing.index.繁體中文`

- **Line:** 477
  - **Kind:** `jsx-text`
  - **Original:** "測試用方案"
  - **Suggested key:** `pricing.index.測試用方案`

- **Line:** 478
  - **Kind:** `jsx-text`
  - **Original:** "僅供測試使用"
  - **Suggested key:** `pricing.index.僅供測試使用`

- **Line:** 479
  - **Kind:** `jsx-text`
  - **Original:** "不建議正式使用"
  - **Suggested key:** `pricing.index.不建議正式使用`

- **Line:** 491
  - **Kind:** `attr:title`
  - **Original:** "測試用點數 1 元方案（NT$10 / 10 點）"
  - **Suggested key:** `pricing.index.測試用點數_1_元方案_nt_10_10_點`

- **Line:** 502
  - **Kind:** `jsx-text`
  - **Original:** "萬字"
  - **Suggested key:** `pricing.index.萬字`

- **Line:** 522
  - **Kind:** `jsx-text`
  - **Original:** "範例說明："
  - **Suggested key:** `pricing.index.範例說明`

- **Line:** 524
  - **Kind:** `jsx-text`
  - **Original:** "輸入 2,500 字文章摘要 → 扣 2,500 字"
  - **Suggested key:** `pricing.index.輸入_2_500_字文章摘要_扣_2_500_字`

- **Line:** 525
  - **Kind:** `jsx-text`
  - **Original:** "解題輸入 300 字題目 → 扣 300 字"
  - **Suggested key:** `pricing.index.解題輸入_300_字題目_扣_300_字`

- **Line:** 546
  - **Kind:** `jsx-text-en`
  - **Original:** "Character Usage:"
  - **Suggested key:** `pricing.index.character_usage`

- **Line:** 548
  - **Kind:** `jsx-text-en`
  - **Original:** "Characters are deducted based on actual input text length"
  - **Suggested key:** `pricing.index.characters_are_deducted_based_on_act`

- **Line:** 549
  - **Kind:** `jsx-text-en`
  - **Original:** "Example: Summarizing a 2,500-character article → Deducts 2,500 characters"
  - **Suggested key:** `pricing.index.example_summarizing_a_2_500_charact`

### `src/pages/SearchSeoSlugPage.tsx`（12 筆）

- **Line:** 25
  - **Kind:** `seo-title`
  - **Original:** "站內搜尋主題｜RxV"
  - **Suggested key:** `pages.SearchSeoSlugPage.站內搜尋主題_rxv`

- **Line:** 25
  - **Kind:** `seo-description`
  - **Original:** "此關鍵字尚未建立可索引的搜尋主題頁；請改由工具中心或下方推薦連結前往。"
  - **Suggested key:** `pages.SearchSeoSlugPage.此關鍵字尚未建立可索引的搜尋主題頁_請改由工具中心或下方推薦連結前往`

- **Line:** 26
  - **Kind:** `attr:title`
  - **Original:** "站內搜尋主題｜RxV"
  - **Suggested key:** `pages.SearchSeoSlugPage.站內搜尋主題_rxv`

- **Line:** 27
  - **Kind:** `attr:description`
  - **Original:** "此關鍵字尚未建立可索引的搜尋主題頁；請改由工具中心或下方推薦連結前往。"
  - **Suggested key:** `pages.SearchSeoSlugPage.此關鍵字尚未建立可索引的搜尋主題頁_請改由工具中心或下方推薦連結前往`

- **Line:** 38
  - **Kind:** `jsx-text`
  - **Original:** "搜尋主題"
  - **Suggested key:** `pages.SearchSeoSlugPage.搜尋主題`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "簡介"
  - **Suggested key:** `pages.SearchSeoSlugPage.簡介`

- **Line:** 115
  - **Kind:** `attr:title`
  - **Original:** "對應工具推薦"
  - **Suggested key:** `pages.SearchSeoSlugPage.對應工具推薦`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "相關 SEO 落地頁"
  - **Suggested key:** `pages.SearchSeoSlugPage.相關_seo_落地頁`

- **Line:** 133
  - **Kind:** `attr:title`
  - **Original:** "對應教學文章"
  - **Suggested key:** `pages.SearchSeoSlugPage.對應教學文章`

- **Line:** 148
  - **Kind:** `jsx-text`
  - **Original:** "前往主工具"
  - **Suggested key:** `pages.SearchSeoSlugPage.前往主工具`

- **Line:** 149
  - **Kind:** `jsx-text`
  - **Original:** "由此進入主工具頁開始操作。"
  - **Suggested key:** `pages.SearchSeoSlugPage.由此進入主工具頁開始操作`

- **Line:** 158
  - **Kind:** `attr:title`
  - **Original:** "熱門 SEO 主題頁"
  - **Suggested key:** `pages.SearchSeoSlugPage.熱門_seo_主題頁`

### `src/pages/tools/ScamCheckPage.tsx`（12 筆）

- **Line:** 67
  - **Kind:** `seo-title`
  - **Original:** "詐騙訊息檢測工具｜免費詐騙訊息檢測工具 - RxV AI工具中心"
  - **Suggested key:** `tools.ScamCheckPage.詐騙訊息檢測工具_免費詐騙訊息檢測工具_rxv_ai工具中心`

- **Line:** 67
  - **Kind:** `seo-description`
  - **Original:** "免費詐騙訊息檢測工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.ScamCheckPage.免費詐騙訊息檢測工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 67
  - **Kind:** `seo-keywords`
  - **Original:** "詐騙訊息檢測工具, AI工具, 免費工具"
  - **Suggested key:** `tools.ScamCheckPage.詐騙訊息檢測工具_ai工具_免費工具`

- **Line:** 68
  - **Kind:** `attr:title`
  - **Original:** "詐騙訊息檢測工具｜免費詐騙訊息檢測工具 - RxV AI工具中心"
  - **Suggested key:** `tools.ScamCheckPage.詐騙訊息檢測工具_免費詐騙訊息檢測工具_rxv_ai工具中心`

- **Line:** 69
  - **Kind:** `attr:description`
  - **Original:** "免費詐騙訊息檢測工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `tools.ScamCheckPage.免費詐騙訊息檢測工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "詐騙訊息檢測工具（免費）｜AI工具推薦"
  - **Suggested key:** `tools.ScamCheckPage.詐騙訊息檢測工具_免費_ai工具推薦`

- **Line:** 197
  - **Kind:** `jsx-text`
  - **Original:** "什麼是詐騙訊息檢測工具？"
  - **Suggested key:** `tools.ScamCheckPage.什麼是詐騙訊息檢測工具`

- **Line:** 202
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `tools.ScamCheckPage.為什麼使用這個工具`

- **Line:** 204
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `tools.ScamCheckPage.免費使用`

- **Line:** 205
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `tools.ScamCheckPage.不需安裝`

- **Line:** 206
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `tools.ScamCheckPage.支援快速處理`

- **Line:** 209
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `tools.ScamCheckPage.相關工具`

### `src/pages/tools/shopee-video/index.tsx`（12 筆）

- **Line:** 366
  - **Kind:** `seo-title`
  - **Original:** "Shopee 批次短影音工具｜免費Shopee 批次短影音工具 - RxV AI工具中心"
  - **Suggested key:** `shopee-video.index.shopee_批次短影音工具_免費shopee_批次短影音工具_rx`

- **Line:** 366
  - **Kind:** `seo-description`
  - **Original:** "免費Shopee 批次短影音工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `shopee-video.index.免費shopee_批次短影音工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 366
  - **Kind:** `seo-keywords`
  - **Original:** "Shopee 批次短影音工具, AI工具, 免費工具"
  - **Suggested key:** `shopee-video.index.shopee_批次短影音工具_ai工具_免費工具`

- **Line:** 367
  - **Kind:** `attr:title`
  - **Original:** "Shopee 批次短影音工具｜免費Shopee 批次短影音工具 - RxV AI工具中心"
  - **Suggested key:** `shopee-video.index.shopee_批次短影音工具_免費shopee_批次短影音工具_rx`

- **Line:** 368
  - **Kind:** `attr:description`
  - **Original:** "免費Shopee 批次短影音工具，支援線上使用，快速完成任務，無需下載。"
  - **Suggested key:** `shopee-video.index.免費shopee_批次短影音工具_支援線上使用_快速完成任務_無需下載`

- **Line:** 375
  - **Kind:** `jsx-text`
  - **Original:** "Shopee 批次短影音工具（免費）｜AI工具推薦"
  - **Suggested key:** `shopee-video.index.shopee_批次短影音工具_免費_ai工具推薦`

- **Line:** 509
  - **Kind:** `jsx-text`
  - **Original:** "什麼是Shopee 批次短影音工具？"
  - **Suggested key:** `shopee-video.index.什麼是shopee_批次短影音工具`

- **Line:** 514
  - **Kind:** `jsx-text`
  - **Original:** "為什麼使用這個工具？"
  - **Suggested key:** `shopee-video.index.為什麼使用這個工具`

- **Line:** 516
  - **Kind:** `jsx-text`
  - **Original:** "免費使用"
  - **Suggested key:** `shopee-video.index.免費使用`

- **Line:** 517
  - **Kind:** `jsx-text`
  - **Original:** "不需安裝"
  - **Suggested key:** `shopee-video.index.不需安裝`

- **Line:** 518
  - **Kind:** `jsx-text`
  - **Original:** "支援快速處理"
  - **Suggested key:** `shopee-video.index.支援快速處理`

- **Line:** 521
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `shopee-video.index.相關工具`

### `src/pages/blog/car-import-tariff-explained.tsx`（11 筆）

- **Line:** 9
  - **Kind:** `seo-title`
  - **Original:** "汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）"
  - **Suggested key:** `blog.car-import-tariff-explained.汽車關稅是什麼_會影響車價嗎_一般人一定要懂的重點整理_2026_最新`

- **Line:** 9
  - **Kind:** `seo-description`
  - **Original:** "汽車關稅完整解析：了解進口車關稅如何計算、對車價的影響，以及一般消費者需要知道的重點。"
  - **Suggested key:** `blog.car-import-tariff-explained.汽車關稅完整解析_了解進口車關稅如何計算_對車價的影響_以及一般消費者需`

- **Line:** 9
  - **Kind:** `seo-keywords`
  - **Original:** "汽車關稅, 進口車關稅, 車價, 關稅計算, 政策解釋"
  - **Suggested key:** `blog.car-import-tariff-explained.汽車關稅_進口車關稅_車價_關稅計算_政策解釋`

- **Line:** 10
  - **Kind:** `attr:title`
  - **Original:** "汽車關稅是什麼？會影響車價嗎？一般人一定要懂的重點整理（2026 最新）"
  - **Suggested key:** `blog.car-import-tariff-explained.汽車關稅是什麼_會影響車價嗎_一般人一定要懂的重點整理_2026_最新`

- **Line:** 11
  - **Kind:** `attr:description`
  - **Original:** "汽車關稅完整解析：了解進口車關稅如何計算、對車價的影響，以及一般消費者需要知道的重點。"
  - **Suggested key:** `blog.car-import-tariff-explained.汽車關稅完整解析_了解進口車關稅如何計算_對車價的影響_以及一般消費者需`

- **Line:** 47
  - **Kind:** `jsx-text`
  - **Original:** "什麼是汽車關稅？"
  - **Suggested key:** `blog.car-import-tariff-explained.什麼是汽車關稅`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "關稅如何影響車價？"
  - **Suggested key:** `blog.car-import-tariff-explained.關稅如何影響車價`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "一般消費者需要知道的重點"
  - **Suggested key:** `blog.car-import-tariff-explained.一般消費者需要知道的重點`

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "關稅會影響進口車的價格"
  - **Suggested key:** `blog.car-import-tariff-explained.關稅會影響進口車的價格`

- **Line:** 62
  - **Kind:** `jsx-text`
  - **Original:** "不同排氣量的車輛關稅率可能不同"
  - **Suggested key:** `blog.car-import-tariff-explained.不同排氣量的車輛關稅率可能不同`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "除了關稅，還有其他稅費會影響最終車價"
  - **Suggested key:** `blog.car-import-tariff-explained.除了關稅_還有其他稅費會影響最終車價`

### `src/pages/blog/EveningDetox.tsx`（11 筆）

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "1. 關掉螢幕，關掉世界"
  - **Suggested key:** `blog.EveningDetox.1_關掉螢幕_關掉世界`

- **Line:** 35
  - **Kind:** `jsx-text`
  - **Original:** "2. 進行 5 次深呼吸"
  - **Suggested key:** `blog.EveningDetox.2_進行_5_次深呼吸`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "3. 寫下一件「我感謝的事」"
  - **Suggested key:** `blog.EveningDetox.3_寫下一件_我感謝的事`

- **Line:** 45
  - **Kind:** `jsx-text`
  - **Original:** "4. 觀想「心靈淨空」"
  - **Suggested key:** `blog.EveningDetox.4_觀想_心靈淨空`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "5. 對自己說「你已經做得夠好了」"
  - **Suggested key:** `blog.EveningDetox.5_對自己說_你已經做得夠好了`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "✨ 結語"
  - **Suggested key:** `blog.EveningDetox.結語`

- **Line:** 72
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 1: Turn Off Screens"
  - **Suggested key:** `blog.EveningDetox.step_1_turn_off_screens`

- **Line:** 77
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 2: Take 5 Deep Breaths"
  - **Suggested key:** `blog.EveningDetox.step_2_take_5_deep_breaths`

- **Line:** 82
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 3: Write Down One Thing You're Grateful For"
  - **Suggested key:** `blog.EveningDetox.step_3_write_down_one_thing_you_re`

- **Line:** 87
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 4: Visualize \"Mind Detox\""
  - **Suggested key:** `blog.EveningDetox.step_4_visualize_mind_detox`

- **Line:** 92
  - **Kind:** `jsx-text-en`
  - **Original:** "Step 5: Tell Yourself \"You've Done Enough\""
  - **Suggested key:** `blog.EveningDetox.step_5_tell_yourself_you_ve_done_e`

### `src/components/ChantSummary.tsx`（11 筆）

- **Line:** 77
  - **Kind:** `jsx-text`
  - **Original:** "📈 集氣統計"
  - **Suggested key:** `components.ChantSummary.集氣統計`

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "載入統計中..."
  - **Suggested key:** `components.ChantSummary.載入統計中`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "📈 集氣統計"
  - **Suggested key:** `components.ChantSummary.集氣統計`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "📈 集氣統計"
  - **Suggested key:** `components.ChantSummary.集氣統計`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "🙌 累計念誦次數"
  - **Suggested key:** `components.ChantSummary.累計念誦次數`

- **Line:** 118
  - **Kind:** `jsx-text`
  - **Original:** "🏆 集氣排行榜"
  - **Suggested key:** `components.ChantSummary.集氣排行榜`

- **Line:** 147
  - **Kind:** `jsx-text`
  - **Original:** "還沒有念誦記錄"
  - **Suggested key:** `components.ChantSummary.還沒有念誦記錄`

- **Line:** 148
  - **Kind:** `jsx-text`
  - **Original:** "開始念誦後，排行榜會顯示在這裡"
  - **Suggested key:** `components.ChantSummary.開始念誦後_排行榜會顯示在這裡`

- **Line:** 155
  - **Kind:** `jsx-text`
  - **Original:** "• 排行榜按個人累計念誦次數排序"
  - **Suggested key:** `components.ChantSummary.排行榜按個人累計念誦次數排序`

- **Line:** 156
  - **Kind:** `jsx-text`
  - **Original:** "• 每次念誦記錄都會自動累加到個人總數"
  - **Suggested key:** `components.ChantSummary.每次念誦記錄都會自動累加到個人總數`

- **Line:** 157
  - **Kind:** `jsx-text`
  - **Original:** "• 大家一起為願望集氣，讓能量更強大！"
  - **Suggested key:** `components.ChantSummary.大家一起為願望集氣_讓能量更強大`

### `src/pages/blog/house-tax-explained.tsx`（10 筆）

- **Line:** 9
  - **Kind:** `seo-title`
  - **Original:** "房屋稅是什麼？自住、出租、空屋差在哪？一般人一定要懂的重點整理"
  - **Suggested key:** `blog.house-tax-explained.房屋稅是什麼_自住_出租_空屋差在哪_一般人一定要懂的重點整理`

- **Line:** 9
  - **Kind:** `seo-description`
  - **Original:** "房屋稅完整解析：了解自住、出租、空屋在房屋稅認定與稅率上的差異，以及一般房屋持有者需要知道的重點。"
  - **Suggested key:** `blog.house-tax-explained.房屋稅完整解析_了解自住_出租_空屋在房屋稅認定與稅率上的差異_以及一般`

- **Line:** 9
  - **Kind:** `seo-keywords`
  - **Original:** "房屋稅, 自住房屋, 出租房屋, 空屋, 房屋稅率, 政策解釋"
  - **Suggested key:** `blog.house-tax-explained.房屋稅_自住房屋_出租房屋_空屋_房屋稅率_政策解釋`

- **Line:** 10
  - **Kind:** `attr:title`
  - **Original:** "房屋稅是什麼？自住、出租、空屋差在哪？一般人一定要懂的重點整理"
  - **Suggested key:** `blog.house-tax-explained.房屋稅是什麼_自住_出租_空屋差在哪_一般人一定要懂的重點整理`

- **Line:** 11
  - **Kind:** `attr:description`
  - **Original:** "房屋稅完整解析：了解自住、出租、空屋在房屋稅認定與稅率上的差異，以及一般房屋持有者需要知道的重點。"
  - **Suggested key:** `blog.house-tax-explained.房屋稅完整解析_了解自住_出租_空屋在房屋稅認定與稅率上的差異_以及一般`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "為什麼房屋稅成為搜尋熱點？"
  - **Suggested key:** `blog.house-tax-explained.為什麼房屋稅成為搜尋熱點`

- **Line:** 57
  - **Kind:** `jsx-text`
  - **Original:** "自住房屋認定條件調整"
  - **Suggested key:** `blog.house-tax-explained.自住房屋認定條件調整`

- **Line:** 58
  - **Kind:** `jsx-text`
  - **Original:** "多屋族稅率提高"
  - **Suggested key:** `blog.house-tax-explained.多屋族稅率提高`

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "各縣市地方政府加嚴用途認定"
  - **Suggested key:** `blog.house-tax-explained.各縣市地方政府加嚴用途認定`

- **Line:** 87
  - **Kind:** `jsx-text`
  - **Original:** "一般人最大的困難"
  - **Suggested key:** `blog.house-tax-explained.一般人最大的困難`

### `src/pages/blog/subsidy-eligibility-explained.tsx`（10 筆）

- **Line:** 9
  - **Kind:** `seo-title`
  - **Original:** "政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件"
  - **Suggested key:** `blog.subsidy-eligibility-explained.政府補助怎麼判斷_為什麼別人領得到_你卻不行_一次搞懂常見關鍵條件`

- **Line:** 9
  - **Kind:** `seo-description`
  - **Original:** "政府補助完整解析：了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件，快速判斷自己是否符合補助資格。"
  - **Suggested key:** `blog.subsidy-eligibility-explained.政府補助完整解析_了解補助申請的關鍵判斷條件_包括身分_收入_居住地_用`

- **Line:** 9
  - **Kind:** `seo-keywords`
  - **Original:** "政府補助, 補助申請, 補助條件, 補助資格, 政策解釋"
  - **Suggested key:** `blog.subsidy-eligibility-explained.政府補助_補助申請_補助條件_補助資格_政策解釋`

- **Line:** 10
  - **Kind:** `attr:title`
  - **Original:** "政府補助怎麼判斷？為什麼別人領得到，你卻不行？一次搞懂常見關鍵條件"
  - **Suggested key:** `blog.subsidy-eligibility-explained.政府補助怎麼判斷_為什麼別人領得到_你卻不行_一次搞懂常見關鍵條件`

- **Line:** 11
  - **Kind:** `attr:description`
  - **Original:** "政府補助完整解析：了解補助申請的關鍵判斷條件，包括身分、收入、居住地、用途等條件，快速判斷自己是否符合補助資格。"
  - **Suggested key:** `blog.subsidy-eligibility-explained.政府補助完整解析_了解補助申請的關鍵判斷條件_包括身分_收入_居住地_用`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "第一，身分條件"
  - **Suggested key:** `blog.subsidy-eligibility-explained.第一_身分條件`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "第二，收入或財產條件"
  - **Suggested key:** `blog.subsidy-eligibility-explained.第二_收入或財產條件`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "第三，居住地與戶籍"
  - **Suggested key:** `blog.subsidy-eligibility-explained.第三_居住地與戶籍`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "第四，用途與行為條件"
  - **Suggested key:** `blog.subsidy-eligibility-explained.第四_用途與行為條件`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "很多人不是「不能領」，而是「不知道自己卡在哪一個條件」"
  - **Suggested key:** `blog.subsidy-eligibility-explained.很多人不是_不能領_而是_不知道自己卡在哪一個條件`

### `src/pages/ChantCounter.tsx`（10 筆）

- **Line:** 151
  - **Kind:** `jsx-text`
  - **Original:** "🙏 念誦計數器"
  - **Suggested key:** `pages.ChantCounter.念誦計數器`

- **Line:** 157
  - **Kind:** `attr:alt`
  - **Original:** "念誦圖片"
  - **Suggested key:** `pages.ChantCounter.念誦圖片`

- **Line:** 171
  - **Kind:** `jsx-text`
  - **Original:** "念誦次數"
  - **Suggested key:** `pages.ChantCounter.念誦次數`

- **Line:** 203
  - **Kind:** `jsx-text`
  - **Original:** "📿 念誦內容"
  - **Suggested key:** `pages.ChantCounter.念誦內容`

- **Line:** 236
  - **Kind:** `jsx-text`
  - **Original:** "📊 統計資料"
  - **Suggested key:** `pages.ChantCounter.統計資料`

- **Line:** 240
  - **Kind:** `jsx-text`
  - **Original:** "總念誦次數"
  - **Suggested key:** `pages.ChantCounter.總念誦次數`

- **Line:** 246
  - **Kind:** `jsx-text`
  - **Original:** "最常念誦"
  - **Suggested key:** `pages.ChantCounter.最常念誦`

- **Line:** 253
  - **Kind:** `jsx-text`
  - **Original:** "當前念誦次數"
  - **Suggested key:** `pages.ChantCounter.當前念誦次數`

- **Line:** 261
  - **Kind:** `jsx-text`
  - **Original:** "🖼️ 背景圖片"
  - **Suggested key:** `pages.ChantCounter.背景圖片`

- **Line:** 281
  - **Kind:** `jsx-text`
  - **Original:** "🔗 相關功能"
  - **Suggested key:** `pages.ChantCounter.相關功能`

### `src/pages/RxVAutoShortsPage.tsx`（10 筆）

- **Line:** 249
  - **Kind:** `jsx-text`
  - **Original:** "RxV AI 自動短影音工廠"
  - **Suggested key:** `pages.RxVAutoShortsPage.rxv_ai_自動短影音工廠`

- **Line:** 253
  - **Kind:** `jsx-text`
  - **Original:** "選擇內容來源"
  - **Suggested key:** `pages.RxVAutoShortsPage.選擇內容來源`

- **Line:** 337
  - **Kind:** `jsx-text`
  - **Original:** "請先選擇來源 A（蝦皮）。"
  - **Suggested key:** `pages.RxVAutoShortsPage.請先選擇來源_a_蝦皮`

- **Line:** 342
  - **Kind:** `jsx-text`
  - **Original:** "來源 A：蝦皮商品"
  - **Suggested key:** `pages.RxVAutoShortsPage.來源_a_蝦皮商品`

- **Line:** 343
  - **Kind:** `jsx-text`
  - **Original:** "輸入商品關鍵字："
  - **Suggested key:** `pages.RxVAutoShortsPage.輸入商品關鍵字`

- **Line:** 348
  - **Kind:** `attr:placeholder`
  - **Original:** "例如：保養、奶茶杯、氣炸鍋"
  - **Suggested key:** `pages.RxVAutoShortsPage.例如_保養_奶茶杯_氣炸鍋`

- **Line:** 376
  - **Kind:** `jsx-text`
  - **Original:** "抓取中…"
  - **Suggested key:** `pages.RxVAutoShortsPage.抓取中`

- **Line:** 431
  - **Kind:** `jsx-text`
  - **Original:** "查看商品"
  - **Suggested key:** `pages.RxVAutoShortsPage.查看商品`

- **Line:** 473
  - **Kind:** `jsx-text`
  - **Original:** "正在產生腳本，請稍候…"
  - **Suggested key:** `pages.RxVAutoShortsPage.正在產生腳本_請稍候`

- **Line:** 496
  - **Kind:** `jsx-text`
  - **Original:** "（僅顯示第 1 筆預覽，實際已產生全部）"
  - **Suggested key:** `pages.RxVAutoShortsPage.僅顯示第_1_筆預覽_實際已產生全部`

### `src/components/PurchaseHistory.tsx`（10 筆）

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "📜 購點紀錄"
  - **Suggested key:** `components.PurchaseHistory.購點紀錄`

- **Line:** 56
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `components.PurchaseHistory.載入中`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "📜 購點紀錄"
  - **Suggested key:** `components.PurchaseHistory.購點紀錄`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "尚無購點紀錄"
  - **Suggested key:** `components.PurchaseHistory.尚無購點紀錄`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "📜 購點紀錄"
  - **Suggested key:** `components.PurchaseHistory.購點紀錄`

- **Line:** 77
  - **Kind:** `jsx-text`
  - **Original:** "訂單編號"
  - **Suggested key:** `components.PurchaseHistory.訂單編號`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "金額"
  - **Suggested key:** `components.PurchaseHistory.金額`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "點數"
  - **Suggested key:** `components.PurchaseHistory.點數`

- **Line:** 80
  - **Kind:** `jsx-text`
  - **Original:** "狀態"
  - **Suggested key:** `components.PurchaseHistory.狀態`

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "時間"
  - **Suggested key:** `components.PurchaseHistory.時間`

### `src/pages/TimeTestPage2.tsx`（9 筆）

- **Line:** 8
  - **Kind:** `jsx-text`
  - **Original:** "⏰ 時間測試頁面"
  - **Suggested key:** `pages.TimeTestPage2.時間測試頁面`

- **Line:** 12
  - **Kind:** `jsx-text`
  - **Original:** "當前時間"
  - **Suggested key:** `pages.TimeTestPage2.當前時間`

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "時間格式測試"
  - **Suggested key:** `pages.TimeTestPage2.時間格式測試`

- **Line:** 22
  - **Kind:** `jsx-text`
  - **Original:** "ISO 格式："
  - **Suggested key:** `pages.TimeTestPage2.iso_格式`

- **Line:** 25
  - **Kind:** `jsx-text`
  - **Original:** "本地格式："
  - **Suggested key:** `pages.TimeTestPage2.本地格式`

- **Line:** 28
  - **Kind:** `jsx-text`
  - **Original:** "時間格式："
  - **Suggested key:** `pages.TimeTestPage2.時間格式`

- **Line:** 34
  - **Kind:** `jsx-text`
  - **Original:** "時區資訊"
  - **Suggested key:** `pages.TimeTestPage2.時區資訊`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "時區偏移："
  - **Suggested key:** `pages.TimeTestPage2.時區偏移`

- **Line:** 40
  - **Kind:** `jsx-text`
  - **Original:** "UTC 時間："
  - **Suggested key:** `pages.TimeTestPage2.utc_時間`

### `src/pages/admin/payments.tsx`（8 筆）

- **Line:** 163
  - **Kind:** `jsx-text`
  - **Original:** "付款回報管理 - 載入中"
  - **Suggested key:** `admin.payments.付款回報管理_載入中`

- **Line:** 167
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `admin.payments.載入中`

- **Line:** 179
  - **Kind:** `jsx-text`
  - **Original:** "無權限存取"
  - **Suggested key:** `admin.payments.無權限存取`

- **Line:** 183
  - **Kind:** `jsx-text`
  - **Original:** "無權限存取"
  - **Suggested key:** `admin.payments.無權限存取`

- **Line:** 184
  - **Kind:** `jsx-text`
  - **Original:** "你沒有權限存取此頁面"
  - **Suggested key:** `admin.payments.你沒有權限存取此頁面`

- **Line:** 186
  - **Kind:** `jsx-text`
  - **Original:** "前往方案頁"
  - **Suggested key:** `admin.payments.前往方案頁`

- **Line:** 198
  - **Kind:** `jsx-text`
  - **Original:** "付款回報管理"
  - **Suggested key:** `admin.payments.付款回報管理`

- **Line:** 234
  - **Kind:** `jsx-text`
  - **Original:** "尚無待處理的付款回報"
  - **Suggested key:** `admin.payments.尚無待處理的付款回報`

### `src/pages/CategoryManagerPage.tsx`（8 筆）

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "📂 分類管理"
  - **Suggested key:** `pages.CategoryManagerPage.分類管理`

- **Line:** 131
  - **Kind:** `jsx-text`
  - **Original:** "新增分類"
  - **Suggested key:** `pages.CategoryManagerPage.新增分類`

- **Line:** 137
  - **Kind:** `attr:placeholder`
  - **Original:** "分類名稱"
  - **Suggested key:** `pages.CategoryManagerPage.分類名稱`

- **Line:** 147
  - **Kind:** `jsx-text`
  - **Original:** "選擇顏色"
  - **Suggested key:** `pages.CategoryManagerPage.選擇顏色`

- **Line:** 160
  - **Kind:** `jsx-text`
  - **Original:** "現有分類"
  - **Suggested key:** `pages.CategoryManagerPage.現有分類`

- **Line:** 182
  - **Kind:** `jsx-text`
  - **Original:** "顏色"
  - **Suggested key:** `pages.CategoryManagerPage.顏色`

- **Line:** 219
  - **Kind:** `attr:title`
  - **Original:** "編輯"
  - **Suggested key:** `pages.CategoryManagerPage.編輯`

- **Line:** 226
  - **Kind:** `attr:title`
  - **Original:** "刪除"
  - **Suggested key:** `pages.CategoryManagerPage.刪除`

### `src/pages/qr-top.tsx`（8 筆）

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `pages.qr-top.載入中`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "目前尚無排行資料"
  - **Suggested key:** `pages.qr-top.目前尚無排行資料`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "排名"
  - **Suggested key:** `pages.qr-top.排名`

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "點擊數"
  - **Suggested key:** `pages.qr-top.點擊數`

- **Line:** 96
  - **Kind:** `jsx-text`
  - **Original:** "熱門 QR Code 排行榜"
  - **Suggested key:** `pages.qr-top.熱門_qr_code_排行榜`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "熱門 QR Code 排行榜"
  - **Suggested key:** `pages.qr-top.熱門_qr_code_排行榜`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "🔥 今日熱門"
  - **Suggested key:** `pages.qr-top.今日熱門`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "🏆 本週熱門"
  - **Suggested key:** `pages.qr-top.本週熱門`

### `src/pages/shopping/search.tsx`（8 筆）

- **Line:** 42
  - **Kind:** `seo-title`
  - **Original:** "AI Price Comparison Tool — Find Best Deals Instantly"
  - **Suggested key:** `shopping.search.ai_price_comparison_tool_find_best`

- **Line:** 42
  - **Kind:** `seo-description`
  - **Original:** "Search and compare product prices instantly. Powered by AI parsing and structured data. Supports Shopee and multi-platform price extraction."
  - **Suggested key:** `shopping.search.search_and_compare_product_prices_in`

- **Line:** 42
  - **Kind:** `seo-keywords`
  - **Original:** "price comparison, product search, Shopee tools, best deals, AI shopping assistant"
  - **Suggested key:** `shopping.search.price_comparison_product_search_sh`

- **Line:** 43
  - **Kind:** `attr:title`
  - **Original:** "AI Price Comparison Tool — Find Best Deals Instantly"
  - **Suggested key:** `shopping.search.ai_price_comparison_tool_find_best`

- **Line:** 44
  - **Kind:** `attr:description`
  - **Original:** "Search and compare product prices instantly. Powered by AI parsing and structured data. Supports Shopee and multi-platform price extraction."
  - **Suggested key:** `shopping.search.search_and_compare_product_prices_in`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "輸入商品關鍵字："
  - **Suggested key:** `shopping.search.輸入商品關鍵字`

- **Line:** 60
  - **Kind:** `attr:placeholder`
  - **Original:** "例如：除濕機、尿布、小熊家電…"
  - **Suggested key:** `shopping.search.例如_除濕機_尿布_小熊家電`

- **Line:** 79
  - **Kind:** `jsx-text`
  - **Original:** "🔍 熱門搜尋："
  - **Suggested key:** `shopping.search.熱門搜尋`

### `src/pages/topup/admin.tsx`（8 筆）

- **Line:** 156
  - **Kind:** `jsx-text`
  - **Original:** "您沒有權限存取此頁面"
  - **Suggested key:** `topup.admin.您沒有權限存取此頁面`

- **Line:** 192
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `topup.admin.載入中`

- **Line:** 196
  - **Kind:** `jsx-text`
  - **Original:** "尚無加點紀錄"
  - **Suggested key:** `topup.admin.尚無加點紀錄`

- **Line:** 215
  - **Kind:** `jsx-text`
  - **Original:** "金額："
  - **Suggested key:** `topup.admin.金額`

- **Line:** 219
  - **Kind:** `jsx-text`
  - **Original:** "字數："
  - **Suggested key:** `topup.admin.字數`

- **Line:** 223
  - **Kind:** `jsx-text`
  - **Original:** "帳號後五碼："
  - **Suggested key:** `topup.admin.帳號後五碼`

- **Line:** 227
  - **Kind:** `jsx-text`
  - **Original:** "提交時間："
  - **Suggested key:** `topup.admin.提交時間`

- **Line:** 246
  - **Kind:** `attr:placeholder`
  - **Original:** "備註（選填）"
  - **Suggested key:** `topup.admin.備註_選填`

### `src/pages/blog/ArticleTemplate.tsx`（7 筆）

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "🕒 專注與靜心的結合"
  - **Suggested key:** `blog.ArticleTemplate.專注與靜心的結合`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "🌿 英文版說明"
  - **Suggested key:** `blog.ArticleTemplate.英文版說明`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "💡 延伸建議 / Further Tips"
  - **Suggested key:** `blog.ArticleTemplate.延伸建議_further_tips`

- **Line:** 53
  - **Kind:** `jsx-text`
  - **Original:** "每天固定時間使用番茄鐘，養成穩定習慣。"
  - **Suggested key:** `blog.ArticleTemplate.每天固定時間使用番茄鐘_養成穩定習慣`

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "嘗試將唸經或呼吸練習放入休息時段。"
  - **Suggested key:** `blog.ArticleTemplate.嘗試將唸經或呼吸練習放入休息時段`

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "記錄完成的循環，並追蹤專注時數。"
  - **Suggested key:** `blog.ArticleTemplate.記錄完成的循環_並追蹤專注時數`

- **Line:** 56
  - **Kind:** `jsx-text-en`
  - **Original:** "Combine Pomodoro with meditation music for a soothing rhythm."
  - **Suggested key:** `blog.ArticleTemplate.combine_pomodoro_with_meditation_mus`

### `src/pages/blog/evening-meditation.tsx`（7 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌾 為什麼睡前需要冥想？"
  - **Suggested key:** `blog.evening-meditation.為什麼睡前需要冥想`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🪷 冥想練習步驟"
  - **Suggested key:** `blog.evening-meditation.冥想練習步驟`

- **Line:** 36
  - **Kind:** `jsx-text`
  - **Original:** "「我現在安全，我值得休息。」"
  - **Suggested key:** `blog.evening-meditation.我現在安全_我值得休息`

- **Line:** 45
  - **Kind:** `jsx-text`
  - **Original:** "🌸 每晚 10 分鐘的小禮物"
  - **Suggested key:** `blog.evening-meditation.每晚_10_分鐘的小禮物`

- **Line:** 56
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Evening Meditation?"
  - **Suggested key:** `blog.evening-meditation.why_evening_meditation`

- **Line:** 63
  - **Kind:** `jsx-text-en`
  - **Original:** "Meditation Steps"
  - **Suggested key:** `blog.evening-meditation.meditation_steps`

- **Line:** 77
  - **Kind:** `jsx-text-en`
  - **Original:** "A Ten-Minute Gift Each Night"
  - **Suggested key:** `blog.evening-meditation.a_ten_minute_gift_each_night`

### `src/pages/blog/policy-explained.tsx`（7 筆）

- **Line:** 190
  - **Kind:** `seo-title`
  - **Original:** "政策白話解釋｜看不懂政策新聞？幫你整理「跟你有沒有關係」"
  - **Suggested key:** `blog.policy-explained.政策白話解釋_看不懂政策新聞_幫你整理_跟你有沒有關係`

- **Line:** 190
  - **Kind:** `seo-description`
  - **Original:** "政策新聞、稅制、補助常常寫得很複雜，其實多數人只想知道一件事：這跟我有沒有關係？本區將常見政策與制度整理成白話版本，協助快速理解生活影響。"
  - **Suggested key:** `blog.policy-explained.政策新聞_稅制_補助常常寫得很複雜_其實多數人只想知道一件事_這跟我有沒`

- **Line:** 190
  - **Kind:** `seo-keywords`
  - **Original:** "政策解釋, 政策白話, 政策新聞, 政策分析, 稅制解釋, 補助說明"
  - **Suggested key:** `blog.policy-explained.政策解釋_政策白話_政策新聞_政策分析_稅制解釋_補助說明`

- **Line:** 191
  - **Kind:** `attr:title`
  - **Original:** "政策白話解釋｜看不懂政策新聞？幫你整理「跟你有沒有關係」"
  - **Suggested key:** `blog.policy-explained.政策白話解釋_看不懂政策新聞_幫你整理_跟你有沒有關係`

- **Line:** 192
  - **Kind:** `attr:description`
  - **Original:** "政策新聞、稅制、補助常常寫得很複雜，其實多數人只想知道一件事：這跟我有沒有關係？本區將常見政策與制度整理成白話版本，協助快速理解生活影響。"
  - **Suggested key:** `blog.policy-explained.政策新聞_稅制_補助常常寫得很複雜_其實多數人只想知道一件事_這跟我有沒`

- **Line:** 219
  - **Kind:** `jsx-text`
  - **Original:** "這跟我有沒有關係？"
  - **Suggested key:** `blog.policy-explained.這跟我有沒有關係`

- **Line:** 254
  - **Kind:** `jsx-text`
  - **Original:** "目前尚無文章"
  - **Suggested key:** `blog.policy-explained.目前尚無文章`

### `src/pages/blog/[slug].tsx`（7 筆）

- **Line:** 163
  - **Kind:** `jsx-text`
  - **Original:** "文章不存在"
  - **Suggested key:** `blog.[slug].文章不存在`

- **Line:** 166
  - **Kind:** `jsx-text`
  - **Original:** "找不到文章"
  - **Suggested key:** `blog.[slug].找不到文章`

- **Line:** 167
  - **Kind:** `jsx-text`
  - **Original:** "此篇文章可能已移除，請回到文章列表查看最新內容。"
  - **Suggested key:** `blog.[slug].此篇文章可能已移除_請回到文章列表查看最新內容`

- **Line:** 215
  - **Kind:** `jsx-text`
  - **Original:** "教學：從需求到可用 QR Code 的完整流程"
  - **Suggested key:** `blog.[slug].教學_從需求到可用_qr_code_的完整流程`

- **Line:** 226
  - **Kind:** `jsx-text`
  - **Original:** "用途：把 QR Code 變成可長期使用的入口"
  - **Suggested key:** `blog.[slug].用途_把_qr_code_變成可長期使用的入口`

- **Line:** 235
  - **Kind:** `jsx-text`
  - **Original:** "常見問題：上線前一定要先排除的風險"
  - **Suggested key:** `blog.[slug].常見問題_上線前一定要先排除的風險`

- **Line:** 246
  - **Kind:** `jsx-text`
  - **Original:** "立即開始使用"
  - **Suggested key:** `blog.[slug].立即開始使用`

### `src/pages/ChantWishDetailPage.tsx`（7 筆）

- **Line:** 397
  - **Kind:** `jsx-text`
  - **Original:** "載入活動詳情中..."
  - **Suggested key:** `pages.ChantWishDetailPage.載入活動詳情中`

- **Line:** 548
  - **Kind:** `jsx-text`
  - **Original:** "🔗 分享給朋友"
  - **Suggested key:** `pages.ChantWishDetailPage.分享給朋友`

- **Line:** 549
  - **Kind:** `jsx-text`
  - **Original:** "邀請朋友一起為這個願望集氣助念"
  - **Suggested key:** `pages.ChantWishDetailPage.邀請朋友一起為這個願望集氣助念`

- **Line:** 577
  - **Kind:** `jsx-text`
  - **Original:** "🙏 參與集氣"
  - **Suggested key:** `pages.ChantWishDetailPage.參與集氣`

- **Line:** 578
  - **Kind:** `jsx-text`
  - **Original:** "一起念誦為願望集氣"
  - **Suggested key:** `pages.ChantWishDetailPage.一起念誦為願望集氣`

- **Line:** 646
  - **Kind:** `jsx-text`
  - **Original:** "💬 留言區"
  - **Suggested key:** `pages.ChantWishDetailPage.留言區`

- **Line:** 652
  - **Kind:** `jsx-text`
  - **Original:** "還沒有留言，來當第一個留言的人吧！"
  - **Suggested key:** `pages.ChantWishDetailPage.還沒有留言_來當第一個留言的人吧`

### `src/pages/guide/[slug].tsx`（7 筆）

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "教學重點"
  - **Suggested key:** `guide.[slug].教學重點`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "步驟"
  - **Suggested key:** `guide.[slug].步驟`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "導回工具 CTA"
  - **Suggested key:** `guide.[slug].導回工具_cta`

- **Line:** 121
  - **Kind:** `jsx-text`
  - **Original:** "看完教學後可直接進入工具實作。"
  - **Suggested key:** `guide.[slug].看完教學後可直接進入工具實作`

- **Line:** 132
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `guide.[slug].相關工具`

- **Line:** 133
  - **Kind:** `attr:title`
  - **Original:** "相關教學"
  - **Suggested key:** `guide.[slug].相關教學`

- **Line:** 134
  - **Kind:** `attr:title`
  - **Original:** "熱門主題頁"
  - **Suggested key:** `guide.[slug].熱門主題頁`

### `src/pages/Home.tsx`（7 筆）

- **Line:** 9
  - **Kind:** `jsx-text`
  - **Original:** "💰 補助懶人包"
  - **Suggested key:** `pages.Home.補助懶人包`

- **Line:** 10
  - **Kind:** `jsx-text`
  - **Original:** "查詢租屋補助、節能補貼與銀髮族補助方案。"
  - **Suggested key:** `pages.Home.查詢租屋補助_節能補貼與銀髮族補助方案`

- **Line:** 14
  - **Kind:** `jsx-text`
  - **Original:** "🩺 健康與理財"
  - **Suggested key:** `pages.Home.健康與理財`

- **Line:** 15
  - **Kind:** `jsx-text`
  - **Original:** "健康理財理念與生活平衡建議。"
  - **Suggested key:** `pages.Home.健康理財理念與生活平衡建議`

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🏛️ 退休金專欄"
  - **Suggested key:** `pages.Home.退休金專欄`

- **Line:** 20
  - **Kind:** `jsx-text`
  - **Original:** "掌握退休金新制與安心理財資訊。"
  - **Suggested key:** `pages.Home.掌握退休金新制與安心理財資訊`

- **Line:** 26
  - **Kind:** `jsx-text`
  - **Original:** "📢 最新官方公告"
  - **Suggested key:** `pages.Home.最新官方公告`

### `src/pages/Terms.tsx`（7 筆）

- **Line:** 15
  - **Kind:** `jsx-text`
  - **Original:** "⚠️ Beta 測試中"
  - **Suggested key:** `pages.Terms.beta_測試中`

- **Line:** 26
  - **Kind:** `jsx-text`
  - **Original:** "使用方案購買服務條款"
  - **Suggested key:** `pages.Terms.使用方案購買服務條款`

- **Line:** 28
  - **Kind:** `jsx-text`
  - **Original:** "📌 重要說明："
  - **Suggested key:** `pages.Terms.重要說明`

- **Line:** 30
  - **Kind:** `jsx-text`
  - **Original:** "使用方案為一次性購買"
  - **Suggested key:** `pages.Terms.使用方案為一次性購買`

- **Line:** 31
  - **Kind:** `jsx-text`
  - **Original:** "不限使用期限"
  - **Suggested key:** `pages.Terms.不限使用期限`

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "用完為止"
  - **Suggested key:** `pages.Terms.用完為止`

- **Line:** 33
  - **Kind:** `jsx-text`
  - **Original:** "不提供退費"
  - **Suggested key:** `pages.Terms.不提供退費`

### `src/pages/admin/images-list.tsx`（6 筆）

- **Line:** 219
  - **Kind:** `jsx-text`
  - **Original:** "載入中…"
  - **Suggested key:** `admin.images-list.載入中`

- **Line:** 226
  - **Kind:** `jsx-text`
  - **Original:** "目前尚無圖片"
  - **Suggested key:** `admin.images-list.目前尚無圖片`

- **Line:** 263
  - **Kind:** `jsx-text`
  - **Original:** "方案"
  - **Suggested key:** `admin.images-list.方案`

- **Line:** 269
  - **Kind:** `jsx-text`
  - **Original:** "免費圖片"
  - **Suggested key:** `admin.images-list.免費圖片`

- **Line:** 270
  - **Kind:** `jsx-text`
  - **Original:** "會員圖片 (NT$99)"
  - **Suggested key:** `admin.images-list.會員圖片_nt_99`

- **Line:** 271
  - **Kind:** `jsx-text`
  - **Original:** "高級圖片 (NT$199)"
  - **Suggested key:** `admin.images-list.高級圖片_nt_199`

### `src/pages/AIHome.tsx`（6 筆）

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "未開放"
  - **Suggested key:** `pages.AIHome.未開放`

- **Line:** 159
  - **Kind:** `jsx-text`
  - **Original:** "免費 AI 工具與創作者工具"
  - **Suggested key:** `pages.AIHome.免費_ai_工具與創作者工具`

- **Line:** 169
  - **Kind:** `jsx-text`
  - **Original:** "免費 AI 工具與創作者工具"
  - **Suggested key:** `pages.AIHome.免費_ai_工具與創作者工具`

- **Line:** 181
  - **Kind:** `jsx-text`
  - **Original:** "開始專注"
  - **Suggested key:** `pages.AIHome.開始專注`

- **Line:** 182
  - **Kind:** `jsx-text`
  - **Original:** "快速進入番茄鐘"
  - **Suggested key:** `pages.AIHome.快速進入番茄鐘`

- **Line:** 196
  - **Kind:** `attr:placeholder`
  - **Original:** "搜尋工具（例如：番茄鐘、貼圖、摘要）"
  - **Suggested key:** `pages.AIHome.搜尋工具_例如_番茄鐘_貼圖_摘要`

### `src/pages/blog/ChantFocusArticle.tsx`（6 筆）

- **Line:** 34
  - **Kind:** `jsx-text`
  - **Original:** "🪷 專注的修行過程"
  - **Suggested key:** `blog.ChantFocusArticle.專注的修行過程`

- **Line:** 60
  - **Kind:** `jsx-text`
  - **Original:** "💡 延伸練習 / Further Practice"
  - **Suggested key:** `blog.ChantFocusArticle.延伸練習_further_practice`

- **Line:** 62
  - **Kind:** `jsx-text`
  - **Original:** "每天固定時間唸經，例如早晨或睡前。"
  - **Suggested key:** `blog.ChantFocusArticle.每天固定時間唸經_例如早晨或睡前`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "將番茄鐘結合唸經，建立節奏感。"
  - **Suggested key:** `blog.ChantFocusArticle.將番茄鐘結合唸經_建立節奏感`

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "可搭配柔和背景音樂或頌缽聲。"
  - **Suggested key:** `blog.ChantFocusArticle.可搭配柔和背景音樂或頌缽聲`

- **Line:** 65
  - **Kind:** `jsx-text-en`
  - **Original:** "Use a journal to note your feelings after each session."
  - **Suggested key:** `blog.ChantFocusArticle.use_a_journal_to_note_your_feelings`

### `src/pages/blog/HydrationMeditation.tsx`（6 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌊 為什麼「喝水」也能冥想？"
  - **Suggested key:** `blog.HydrationMeditation.為什麼_喝水_也能冥想`

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "🪷 五感覺察練習"
  - **Suggested key:** `blog.HydrationMeditation.五感覺察練習`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "💧 每次喝水，都是一次重啟"
  - **Suggested key:** `blog.HydrationMeditation.每次喝水_都是一次重啟`

- **Line:** 61
  - **Kind:** `jsx-text-en`
  - **Original:** "Why Can Drinking Water Be Meditation?"
  - **Suggested key:** `blog.HydrationMeditation.why_can_drinking_water_be_meditation`

- **Line:** 67
  - **Kind:** `jsx-text-en`
  - **Original:** "Five-Senses Awareness Practice"
  - **Suggested key:** `blog.HydrationMeditation.five_senses_awareness_practice`

- **Line:** 86
  - **Kind:** `jsx-text-en`
  - **Original:** "Each Sip Is a Reset"
  - **Suggested key:** `blog.HydrationMeditation.each_sip_is_a_reset`

### `src/pages/blog/index.tsx`（6 筆）

- **Line:** 449
  - **Kind:** `seo-keywords`
  - **Original:** "blog, articles, AI tools, health, finance, lifestyle, SEO"
  - **Suggested key:** `blog.index.blog_articles_ai_tools_health_fi`

- **Line:** 522
  - **Kind:** `jsx-text`
  - **Original:** "🛒 好物推薦專區"
  - **Suggested key:** `blog.index.好物推薦專區`

- **Line:** 523
  - **Kind:** `jsx-text`
  - **Original:** "每篇都有導購影片＋懶人介紹文＋Shopee 分潤連結"
  - **Suggested key:** `blog.index.每篇都有導購影片_懶人介紹文_shopee_分潤連結`

- **Line:** 532
  - **Kind:** `attr:alt`
  - **Original:** "氣炸鍋封面"
  - **Suggested key:** `blog.index.氣炸鍋封面`

- **Line:** 535
  - **Kind:** `jsx-text`
  - **Original:** "科帥氣炸鍋推薦"
  - **Suggested key:** `blog.index.科帥氣炸鍋推薦`

- **Line:** 536
  - **Kind:** `jsx-text`
  - **Original:** "附影片｜限時送清潔泡泡＋12 件烘焙組"
  - **Suggested key:** `blog.index.附影片_限時送清潔泡泡_12_件烘焙組`

### `src/pages/blog/MorningMeditationArticle.tsx`（6 筆）

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "🧘‍♂️ 建立晨間靜心習慣"
  - **Suggested key:** `blog.MorningMeditationArticle.建立晨間靜心習慣`

- **Line:** 63
  - **Kind:** `jsx-text`
  - **Original:** "💡 延伸練習 / Extended Practice"
  - **Suggested key:** `blog.MorningMeditationArticle.延伸練習_extended_practice`

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "可搭配柔和音樂或自然鳥鳴聲。"
  - **Suggested key:** `blog.MorningMeditationArticle.可搭配柔和音樂或自然鳥鳴聲`

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "搭配番茄鐘設定 10 分鐘靜坐循環。"
  - **Suggested key:** `blog.MorningMeditationArticle.搭配番茄鐘設定_10_分鐘靜坐循環`

- **Line:** 67
  - **Kind:** `jsx-text`
  - **Original:** "記錄每天靜坐後的心情或靈感。"
  - **Suggested key:** `blog.MorningMeditationArticle.記錄每天靜坐後的心情或靈感`

- **Line:** 68
  - **Kind:** `jsx-text-en`
  - **Original:** "End each session with gratitude for the new day."
  - **Suggested key:** `blog.MorningMeditationArticle.end_each_session_with_gratitude_for`

### `src/pages/blog/PerfectBreakfastTime.tsx`（6 筆）

- **Line:** 19
  - **Kind:** `jsx-text`
  - **Original:** "🌅 什麼是天元時間？"
  - **Suggested key:** `blog.PerfectBreakfastTime.什麼是天元時間`

- **Line:** 28
  - **Kind:** `jsx-text`
  - **Original:** "🥛 最佳早餐選擇"
  - **Suggested key:** `blog.PerfectBreakfastTime.最佳早餐選擇`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "💫 讓早餐成為調頻鑰匙"
  - **Suggested key:** `blog.PerfectBreakfastTime.讓早餐成為調頻鑰匙`

- **Line:** 47
  - **Kind:** `jsx-text-en`
  - **Original:** "What is the Heavenly Origin Hour?"
  - **Suggested key:** `blog.PerfectBreakfastTime.what_is_the_heavenly_origin_hour`

- **Line:** 53
  - **Kind:** `jsx-text-en`
  - **Original:** "Perfect Breakfast Choices"
  - **Suggested key:** `blog.PerfectBreakfastTime.perfect_breakfast_choices`

- **Line:** 60
  - **Kind:** `jsx-text-en`
  - **Original:** "Let Breakfast Be Your Tuning Key"
  - **Suggested key:** `blog.PerfectBreakfastTime.let_breakfast_be_your_tuning_key`

### `src/pages/guide/index.tsx`（6 筆）

- **Line:** 26
  - **Kind:** `seo-title`
  - **Original:** "Guide 教學中心｜AI工具與圖片工具完整教學"
  - **Suggested key:** `guide.index.guide_教學中心_ai工具與圖片工具完整教學`

- **Line:** 26
  - **Kind:** `seo-description`
  - **Original:** "收錄 20 篇工具教學，從圖片尺寸、壓縮、QR Code 到 AI 摘要與作業解題。"
  - **Suggested key:** `guide.index.收錄_20_篇工具教學_從圖片尺寸_壓縮_qr_code_到_ai_摘要`

- **Line:** 27
  - **Kind:** `attr:title`
  - **Original:** "Guide 教學中心｜AI工具與圖片工具完整教學"
  - **Suggested key:** `guide.index.guide_教學中心_ai工具與圖片工具完整教學`

- **Line:** 28
  - **Kind:** `attr:description`
  - **Original:** "收錄 20 篇工具教學，從圖片尺寸、壓縮、QR Code 到 AI 摘要與作業解題。"
  - **Suggested key:** `guide.index.收錄_20_篇工具教學_從圖片尺寸_壓縮_qr_code_到_ai_摘要`

- **Line:** 34
  - **Kind:** `jsx-text`
  - **Original:** "首頁"
  - **Suggested key:** `guide.index.首頁`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "Guide 教學中心"
  - **Suggested key:** `guide.index.guide_教學中心`

### `src/pages/pricing/success.tsx`（6 筆）

- **Line:** 133
  - **Kind:** `jsx-text`
  - **Original:** "正在處理付款資料..."
  - **Suggested key:** `pricing.success.正在處理付款資料`

- **Line:** 134
  - **Kind:** `jsx-text`
  - **Original:** "請稍候"
  - **Suggested key:** `pricing.success.請稍候`

- **Line:** 161
  - **Kind:** `jsx-text`
  - **Original:** "交易摘要"
  - **Suggested key:** `pricing.success.交易摘要`

- **Line:** 166
  - **Kind:** `jsx-text`
  - **Original:** "訂單編號："
  - **Suggested key:** `pricing.success.訂單編號`

- **Line:** 175
  - **Kind:** `jsx-text`
  - **Original:** "購買點數："
  - **Suggested key:** `pricing.success.購買點數`

- **Line:** 183
  - **Kind:** `jsx-text`
  - **Original:** "付款金額："
  - **Suggested key:** `pricing.success.付款金額`

### `src/pages/tools/ToolCategoryPage.tsx`（6 筆）

- **Line:** 81
  - **Kind:** `jsx-text`
  - **Original:** "分類介紹"
  - **Suggested key:** `tools.ToolCategoryPage.分類介紹`

- **Line:** 90
  - **Kind:** `jsx-text`
  - **Original:** "工具卡片列表"
  - **Suggested key:** `tools.ToolCategoryPage.工具卡片列表`

- **Line:** 106
  - **Kind:** `jsx-text`
  - **Original:** "工具用途說明"
  - **Suggested key:** `tools.ToolCategoryPage.工具用途說明`

- **Line:** 124
  - **Kind:** `attr:title`
  - **Original:** "本分類熱門頁面"
  - **Suggested key:** `tools.ToolCategoryPage.本分類熱門頁面`

- **Line:** 125
  - **Kind:** `attr:title`
  - **Original:** "本分類推薦教學"
  - **Suggested key:** `tools.ToolCategoryPage.本分類推薦教學`

- **Line:** 126
  - **Kind:** `attr:title`
  - **Original:** "搭配工具推薦"
  - **Suggested key:** `tools.ToolCategoryPage.搭配工具推薦`

### `src/pages/blog/aids.tsx`（5 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "Government Subsidy Guide 2025 — Financial Help & Application Tips"
  - **Suggested key:** `blog.aids.government_subsidy_guide_2025_fina`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "Updated reminders and guides for Taiwan government subsidies. Easy-to-read financial planning content and useful public benefit updates."
  - **Suggested key:** `blog.aids.updated_reminders_and_guides_for_tai`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "government subsidy, Taiwan subsidy 2025, financial guide, anti-fraud, tax tips, government benefits"
  - **Suggested key:** `blog.aids.government_subsidy_taiwan_subsidy_2`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "Government Subsidy Guide 2025 — Financial Help & Application Tips"
  - **Suggested key:** `blog.aids.government_subsidy_guide_2025_fina`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "Updated reminders and guides for Taiwan government subsidies. Easy-to-read financial planning content and useful public benefit updates."
  - **Suggested key:** `blog.aids.updated_reminders_and_guides_for_tai`

### `src/pages/blog/cheng-li-chun-policy-role-explained.tsx`（5 筆）

- **Line:** 12
  - **Kind:** `seo-title`
  - **Original:** "為什麼新聞一直提到鄭麗君？她在政策裡扮演什麼角色？跟一般人有關嗎？"
  - **Suggested key:** `blog.cheng-li-chun-policy-role-explained.為什麼新聞一直提到鄭麗君_她在政策裡扮演什麼角色_跟一般人有關嗎`

- **Line:** 12
  - **Kind:** `seo-description`
  - **Original:** "鄭麗君政策角色完整解析：了解鄭麗君在政策制定與執行中的角色定位，以及這些政策對一般民眾的實際影響。"
  - **Suggested key:** `blog.cheng-li-chun-policy-role-explained.鄭麗君政策角色完整解析_了解鄭麗君在政策制定與執行中的角色定位_以及這些`

- **Line:** 12
  - **Kind:** `seo-keywords`
  - **Original:** "鄭麗君, 政策角色, 政策制定, 政策解釋"
  - **Suggested key:** `blog.cheng-li-chun-policy-role-explained.鄭麗君_政策角色_政策制定_政策解釋`

- **Line:** 13
  - **Kind:** `attr:title`
  - **Original:** "為什麼新聞一直提到鄭麗君？她在政策裡扮演什麼角色？跟一般人有關嗎？"
  - **Suggested key:** `blog.cheng-li-chun-policy-role-explained.為什麼新聞一直提到鄭麗君_她在政策裡扮演什麼角色_跟一般人有關嗎`

- **Line:** 14
  - **Kind:** `attr:description`
  - **Original:** "鄭麗君政策角色完整解析：了解鄭麗君在政策制定與執行中的角色定位，以及這些政策對一般民眾的實際影響。"
  - **Suggested key:** `blog.cheng-li-chun-policy-role-explained.鄭麗君政策角色完整解析_了解鄭麗君在政策制定與執行中的角色定位_以及這些`

### `src/pages/finance/index.tsx`（5 筆）

- **Line:** 21
  - **Kind:** `seo-title`
  - **Original:** "Health & Financial Tips 2025 — Retirement, Tax, Insurance"
  - **Suggested key:** `finance.index.health_financial_tips_2025_retir`

- **Line:** 21
  - **Kind:** `seo-description`
  - **Original:** "Practical guides for personal finance, retirement planning, tax optimization, and health-related advice. Updated weekly."
  - **Suggested key:** `finance.index.practical_guides_for_personal_financ`

- **Line:** 21
  - **Kind:** `seo-keywords`
  - **Original:** "retirement planning, tax strategy, personal finance, health tips, financial planning, investment advice"
  - **Suggested key:** `finance.index.retirement_planning_tax_strategy_p`

- **Line:** 22
  - **Kind:** `attr:title`
  - **Original:** "Health & Financial Tips 2025 — Retirement, Tax, Insurance"
  - **Suggested key:** `finance.index.health_financial_tips_2025_retir`

- **Line:** 23
  - **Kind:** `attr:description`
  - **Original:** "Practical guides for personal finance, retirement planning, tax optimization, and health-related advice. Updated weekly."
  - **Suggested key:** `finance.index.practical_guides_for_personal_financ`

### `src/pages/health/index.tsx`（5 筆）

- **Line:** 34
  - **Kind:** `seo-title`
  - **Original:** "Health & Financial Tips 2025 — Retirement, Tax, Insurance"
  - **Suggested key:** `health.index.health_financial_tips_2025_retir`

- **Line:** 34
  - **Kind:** `seo-description`
  - **Original:** "Practical guides for personal finance, retirement planning, tax optimization, and health-related advice. Updated weekly."
  - **Suggested key:** `health.index.practical_guides_for_personal_financ`

- **Line:** 34
  - **Kind:** `seo-keywords`
  - **Original:** "retirement planning, tax strategy, personal finance, health tips, financial planning, investment advice"
  - **Suggested key:** `health.index.retirement_planning_tax_strategy_p`

- **Line:** 35
  - **Kind:** `attr:title`
  - **Original:** "Health & Financial Tips 2025 — Retirement, Tax, Insurance"
  - **Suggested key:** `health.index.health_financial_tips_2025_retir`

- **Line:** 36
  - **Kind:** `attr:description`
  - **Original:** "Practical guides for personal finance, retirement planning, tax optimization, and health-related advice. Updated weekly."
  - **Suggested key:** `health.index.practical_guides_for_personal_financ`

### `src/pages/index.tsx`（5 筆）

- **Line:** 311
  - **Kind:** `seo-title`
  - **Original:** "RxV AI 工具與生活服務中心｜AI工具與效率工具"
  - **Suggested key:** `pages.index.rxv_ai_工具與生活服務中心_ai工具與效率工具`

- **Line:** 311
  - **Kind:** `seo-description`
  - **Original:** "整合 AI 工具、效率工具與生活服務，包含 AI 摘要、作業解題、QR Code 產生、圖片壓縮與尺寸調整等免費工具。"
  - **Suggested key:** `pages.index.整合_ai_工具_效率工具與生活服務_包含_ai_摘要_作業解題_qr`

- **Line:** 311
  - **Kind:** `seo-keywords`
  - **Original:** "AI工具, 免費AI工具, AI摘要, 作業解題, 效率工具, 番茄鐘, 待辦清單"
  - **Suggested key:** `pages.index.ai工具_免費ai工具_ai摘要_作業解題_效率工具_番茄鐘`

- **Line:** 312
  - **Kind:** `attr:title`
  - **Original:** "RxV AI 工具與生活服務中心｜AI工具與效率工具"
  - **Suggested key:** `pages.index.rxv_ai_工具與生活服務中心_ai工具與效率工具`

- **Line:** 313
  - **Kind:** `attr:description`
  - **Original:** "整合 AI 工具、效率工具與生活服務，包含 AI 摘要、作業解題、QR Code 產生、圖片壓縮與尺寸調整等免費工具。"
  - **Suggested key:** `pages.index.整合_ai_工具_效率工具與生活服務_包含_ai_摘要_作業解題_qr`

### `src/pages/summary-landing.tsx`（5 筆）

- **Line:** 6
  - **Kind:** `seo-title`
  - **Original:** "AI Summary Tool — Fast, Accurate, and Schema-Safe"
  - **Suggested key:** `pages.summary-landing.ai_summary_tool_fast_accurate_an`

- **Line:** 6
  - **Kind:** `seo-description`
  - **Original:** "A modern AI summary tool powered by Supabase Edge Functions + Gemini Flash. Get clean, validated JSON summaries instantly. Perfect for developers, content creators, and automation workflows."
  - **Suggested key:** `pages.summary-landing.a_modern_ai_summary_tool_powered_by`

- **Line:** 6
  - **Kind:** `seo-keywords`
  - **Original:** "AI summary tool, JSON schema, Supabase Edge Function, Gemini, article summarizer, developer tools"
  - **Suggested key:** `pages.summary-landing.ai_summary_tool_json_schema_supaba`

- **Line:** 7
  - **Kind:** `attr:title`
  - **Original:** "AI Summary Tool — Fast, Accurate, and Schema-Safe"
  - **Suggested key:** `pages.summary-landing.ai_summary_tool_fast_accurate_an`

- **Line:** 8
  - **Kind:** `attr:description`
  - **Original:** "A modern AI summary tool powered by Supabase Edge Functions + Gemini Flash. Get clean, validated JSON summaries instantly. Perfect for developers, content creators, and automation workflows."
  - **Suggested key:** `pages.summary-landing.a_modern_ai_summary_tool_powered_by`

### `src/pages/WishesWallPage.tsx`（5 筆）

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "願望牆"
  - **Suggested key:** `pages.WishesWallPage.願望牆`

- **Line:** 107
  - **Kind:** `jsx-text`
  - **Original:** "願望牆"
  - **Suggested key:** `pages.WishesWallPage.願望牆`

- **Line:** 119
  - **Kind:** `jsx-text`
  - **Original:** "願望牆"
  - **Suggested key:** `pages.WishesWallPage.願望牆`

- **Line:** 120
  - **Kind:** `jsx-text`
  - **Original:** "點燈祈福，願望成真"
  - **Suggested key:** `pages.WishesWallPage.點燈祈福_願望成真`

- **Line:** 133
  - **Kind:** `jsx-text`
  - **Original:** "目前還沒有公開的願望"
  - **Suggested key:** `pages.WishesWallPage.目前還沒有公開的願望`

### `src/components/ShareModal.tsx`（5 筆）

- **Line:** 75
  - **Kind:** `jsx-text`
  - **Original:** "🎉 願望已送出！要分享嗎？"
  - **Suggested key:** `components.ShareModal.願望已送出_要分享嗎`

- **Line:** 91
  - **Kind:** `jsx-text`
  - **Original:** "分享至 LINE"
  - **Suggested key:** `components.ShareModal.分享至_line`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "開啟 LINE 分享"
  - **Suggested key:** `components.ShareModal.開啟_line_分享`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "分享到 TikTok"
  - **Suggested key:** `components.ShareModal.分享到_tiktok`

- **Line:** 111
  - **Kind:** `jsx-text`
  - **Original:** "複製文字到剪貼簿"
  - **Suggested key:** `components.ShareModal.複製文字到剪貼簿`

### `src/components/ui/TimeRangePicker.tsx`（5 筆）

- **Line:** 16
  - **Kind:** `attr:label`
  - **Original:** "時間範圍"
  - **Suggested key:** `ui.TimeRangePicker.時間範圍`

- **Line:** 89
  - **Kind:** `jsx-text`
  - **Original:** "日期"
  - **Suggested key:** `ui.TimeRangePicker.日期`

- **Line:** 104
  - **Kind:** `jsx-text`
  - **Original:** "時間"
  - **Suggested key:** `ui.TimeRangePicker.時間`

- **Line:** 128
  - **Kind:** `jsx-text`
  - **Original:** "日期"
  - **Suggested key:** `ui.TimeRangePicker.日期`

- **Line:** 143
  - **Kind:** `jsx-text`
  - **Original:** "時間"
  - **Suggested key:** `ui.TimeRangePicker.時間`

### `src/components/WishLightButton.tsx`（5 筆）

- **Line:** 145
  - **Kind:** `attr:aria-label`
  - **Original:** "點燈"
  - **Suggested key:** `components.WishLightButton.點燈`

- **Line:** 176
  - **Kind:** `attr:alt`
  - **Original:** "蓮花點燈圖"
  - **Suggested key:** `components.WishLightButton.蓮花點燈圖`

- **Line:** 216
  - **Kind:** `attr:placeholder`
  - **Original:** "請輸入您的名字（可留空）"
  - **Suggested key:** `components.WishLightButton.請輸入您的名字_可留空`

- **Line:** 242
  - **Kind:** `jsx-text`
  - **Original:** "🪔 點燈明細"
  - **Suggested key:** `components.WishLightButton.點燈明細`

- **Line:** 260
  - **Kind:** `jsx-text`
  - **Original:** "已點燈"
  - **Suggested key:** `components.WishLightButton.已點燈`

### `src/components/WishWall.tsx`（5 筆）

- **Line:** 72
  - **Kind:** `jsx-text`
  - **Original:** "載入願望中..."
  - **Suggested key:** `components.WishWall.載入願望中`

- **Line:** 100
  - **Kind:** `jsx-text`
  - **Original:** "願望牆"
  - **Suggested key:** `components.WishWall.願望牆`

- **Line:** 101
  - **Kind:** `jsx-text`
  - **Original:** "目前還沒有願望，快來許一個吧！"
  - **Suggested key:** `components.WishWall.目前還沒有願望_快來許一個吧`

- **Line:** 110
  - **Kind:** `jsx-text`
  - **Original:** "🌟 願望牆"
  - **Suggested key:** `components.WishWall.願望牆`

- **Line:** 138
  - **Kind:** `jsx-text`
  - **Original:** "🙏 為此願望點燈祈福"
  - **Suggested key:** `components.WishWall.為此願望點燈祈福`

### `src/pages/blog/qr-code.tsx`（4 筆）

- **Line:** 10
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 文章專區｜完整教學與行銷實戰"
  - **Suggested key:** `blog.qr-code.qr_code_文章專區_完整教學與行銷實戰`

- **Line:** 25
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 主題文章"
  - **Suggested key:** `blog.qr-code.qr_code_主題文章`

- **Line:** 43
  - **Kind:** `jsx-text`
  - **Original:** "閱讀完整內容 →"
  - **Suggested key:** `blog.qr-code.閱讀完整內容`

- **Line:** 50
  - **Kind:** `jsx-text`
  - **Original:** "從內容直接行動"
  - **Suggested key:** `blog.qr-code.從內容直接行動`

### `src/pages/payment/success.tsx`（4 筆）

- **Line:** 65
  - **Kind:** `jsx-text`
  - **Original:** "補點成功 - 載入中"
  - **Suggested key:** `payment.success.補點成功_載入中`

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `payment.success.載入中`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "點數已補充完成"
  - **Suggested key:** `payment.success.點數已補充完成`

- **Line:** 147
  - **Kind:** `jsx-text`
  - **Original:** "歡迎使用"
  - **Suggested key:** `payment.success.歡迎使用`

### `src/pages/ResetPasswordPage.tsx`（4 筆）

- **Line:** 54
  - **Kind:** `jsx-text`
  - **Original:** "重設密碼"
  - **Suggested key:** `pages.ResetPasswordPage.重設密碼`

- **Line:** 71
  - **Kind:** `attr:placeholder`
  - **Original:** "新密碼"
  - **Suggested key:** `pages.ResetPasswordPage.新密碼`

- **Line:** 80
  - **Kind:** `attr:placeholder`
  - **Original:** "再次輸入新密碼"
  - **Suggested key:** `pages.ResetPasswordPage.再次輸入新密碼`

- **Line:** 84
  - **Kind:** `jsx-text`
  - **Original:** "密碼已更新，請重新登入"
  - **Suggested key:** `pages.ResetPasswordPage.密碼已更新_請重新登入`

### `src/pages/s/[code].tsx`（4 筆）

- **Line:** 81
  - **Kind:** `attr:title`
  - **Original:** "QR Code 分享｜快速跳轉"
  - **Suggested key:** `s.[code].qr_code_分享_快速跳轉`

- **Line:** 82
  - **Kind:** `attr:description`
  - **Original:** "掃描 QR Code 或點擊立即前往"
  - **Suggested key:** `s.[code].掃描_qr_code_或點擊立即前往`

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "正在跳轉..."
  - **Suggested key:** `s.[code].正在跳轉`

- **Line:** 103
  - **Kind:** `jsx-text`
  - **Original:** "原網址"
  - **Suggested key:** `s.[code].原網址`

### `src/pages/SearchPage.tsx`（4 筆）

- **Line:** 44
  - **Kind:** `jsx-text`
  - **Original:** "搜尋商品｜AI 工具與生活服務中心"
  - **Suggested key:** `pages.SearchPage.搜尋商品_ai_工具與生活服務中心`

- **Line:** 52
  - **Kind:** `jsx-text`
  - **Original:** "搜尋商品"
  - **Suggested key:** `pages.SearchPage.搜尋商品`

- **Line:** 58
  - **Kind:** `attr:placeholder`
  - **Original:** "輸入商品名稱，例如：除濕機"
  - **Suggested key:** `pages.SearchPage.輸入商品名稱_例如_除濕機`

- **Line:** 76
  - **Kind:** `jsx-text`
  - **Original:** "搜尋中..."
  - **Suggested key:** `pages.SearchPage.搜尋中`

### `src/pages/SettingsPage.tsx`（4 筆）

- **Line:** 138
  - **Kind:** `jsx-text`
  - **Original:** "訂閱方案說明"
  - **Suggested key:** `pages.SettingsPage.訂閱方案說明`

- **Line:** 174
  - **Kind:** `jsx-text`
  - **Original:** "📱 App 訂閱"
  - **Suggested key:** `pages.SettingsPage.app_訂閱`

- **Line:** 183
  - **Kind:** `jsx-text`
  - **Original:** "勾選後將移除廣告"
  - **Suggested key:** `pages.SettingsPage.勾選後將移除廣告`

- **Line:** 230
  - **Kind:** `jsx-text`
  - **Original:** "🌐 網頁訂閱"
  - **Suggested key:** `pages.SettingsPage.網頁訂閱`

### `src/pages/topup/report.tsx`（4 筆）

- **Line:** 134
  - **Kind:** `jsx-text`
  - **Original:** "匯款資訊："
  - **Suggested key:** `topup.report.匯款資訊`

- **Line:** 158
  - **Kind:** `jsx-text`
  - **Original:** "請選擇金額"
  - **Suggested key:** `topup.report.請選擇金額`

- **Line:** 159
  - **Kind:** `jsx-text`
  - **Original:** "NT$99（100,000 字）"
  - **Suggested key:** `topup.report.nt_99_100_000_字`

- **Line:** 160
  - **Kind:** `jsx-text`
  - **Original:** "NT$199（300,000 字）"
  - **Suggested key:** `topup.report.nt_199_300_000_字`

### `src/components/TimeSettingCard.tsx`（4 筆）

- **Line:** 23
  - **Kind:** `jsx-text`
  - **Original:** "⏰ 時間設定"
  - **Suggested key:** `components.TimeSettingCard.時間設定`

- **Line:** 27
  - **Kind:** `jsx-text`
  - **Original:** "工作時間"
  - **Suggested key:** `components.TimeSettingCard.工作時間`

- **Line:** 51
  - **Kind:** `jsx-text`
  - **Original:** "休息時間"
  - **Suggested key:** `components.TimeSettingCard.休息時間`

- **Line:** 73
  - **Kind:** `attr:label`
  - **Original:** "開始"
  - **Suggested key:** `components.TimeSettingCard.開始`

### `src/components/UpgradePopup.tsx`（4 筆）

- **Line:** 10
  - **Kind:** `jsx-text`
  - **Original:** "升級 VIP 方案"
  - **Suggested key:** `components.UpgradePopup.升級_vip_方案`

- **Line:** 16
  - **Kind:** `jsx-text`
  - **Original:** "✓ 摘要無限次"
  - **Suggested key:** `components.UpgradePopup.摘要無限次`

- **Line:** 17
  - **Kind:** `jsx-text`
  - **Original:** "✓ 作業助手無限次"
  - **Suggested key:** `components.UpgradePopup.作業助手無限次`

- **Line:** 18
  - **Kind:** `jsx-text`
  - **Original:** "✓ 更快速度"
  - **Suggested key:** `components.UpgradePopup.更快速度`

### `src/components/WishDetail.tsx`（4 筆）

- **Line:** 212
  - **Kind:** `jsx-text`
  - **Original:** "點燈祈福"
  - **Suggested key:** `components.WishDetail.點燈祈福`

- **Line:** 224
  - **Kind:** `jsx-text`
  - **Original:** "祈福紀錄"
  - **Suggested key:** `components.WishDetail.祈福紀錄`

- **Line:** 239
  - **Kind:** `attr:placeholder`
  - **Original:** "匿名善信"
  - **Suggested key:** `components.WishDetail.匿名善信`

- **Line:** 250
  - **Kind:** `attr:placeholder`
  - **Original:** "願一切眾生平安喜樂"
  - **Suggested key:** `components.WishDetail.願一切眾生平安喜樂`

### `src/pages/LoginPage.tsx`（3 筆）

- **Line:** 124
  - **Kind:** `jsx-text`
  - **Original:** "登入 RxV AI 工具中心"
  - **Suggested key:** `pages.LoginPage.登入_rxv_ai_工具中心`

- **Line:** 127
  - **Kind:** `jsx-text`
  - **Original:** "使用 Email 和密碼登入或註冊"
  - **Suggested key:** `pages.LoginPage.使用_email_和密碼登入或註冊`

- **Line:** 166
  - **Kind:** `attr:placeholder`
  - **Original:** "至少 6 個字元"
  - **Suggested key:** `pages.LoginPage.至少_6_個字元`

### `src/pages/payment/report.tsx`（3 筆）

- **Line:** 45
  - **Kind:** `jsx-text`
  - **Original:** "無效的方案參數"
  - **Suggested key:** `payment.report.無效的方案參數`

- **Line:** 47
  - **Kind:** `jsx-text`
  - **Original:** "返回方案選擇"
  - **Suggested key:** `payment.report.返回方案選擇`

- **Line:** 234
  - **Kind:** `attr:placeholder`
  - **Original:** "如有其他需要說明的事項，請在此填寫"
  - **Suggested key:** `payment.report.如有其他需要說明的事項_請在此填寫`

### `src/components/ChantLogInput.tsx`（3 筆）

- **Line:** 64
  - **Kind:** `jsx-text`
  - **Original:** "你的名字"
  - **Suggested key:** `components.ChantLogInput.你的名字`

- **Line:** 67
  - **Kind:** `attr:placeholder`
  - **Original:** "輸入你的名字"
  - **Suggested key:** `components.ChantLogInput.輸入你的名字`

- **Line:** 74
  - **Kind:** `jsx-text`
  - **Original:** "念誦次數"
  - **Suggested key:** `components.ChantLogInput.念誦次數`

### `src/components/LightRecordsModule.tsx`（3 筆）

- **Line:** 69
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `components.LightRecordsModule.載入中`

- **Line:** 85
  - **Kind:** `jsx-text`
  - **Original:** "目前尚無點燈紀錄"
  - **Suggested key:** `components.LightRecordsModule.目前尚無點燈紀錄`

- **Line:** 92
  - **Kind:** `jsx-text`
  - **Original:** "點燈紀錄"
  - **Suggested key:** `components.LightRecordsModule.點燈紀錄`

### `src/components/LightUpButton.tsx`（3 筆）

- **Line:** 38
  - **Kind:** `attr:aria-label`
  - **Original:** "點燈"
  - **Suggested key:** `components.LightUpButton.點燈`

- **Line:** 90
  - **Kind:** `attr:alt`
  - **Original:** "蓮花點燈圖"
  - **Suggested key:** `components.LightUpButton.蓮花點燈圖`

- **Line:** 137
  - **Kind:** `jsx-text`
  - **Original:** "已點燈"
  - **Suggested key:** `components.LightUpButton.已點燈`

### `src/components/LightWishForm.tsx`（3 筆）

- **Line:** 124
  - **Kind:** `jsx-text`
  - **Original:** "點燈祈福"
  - **Suggested key:** `components.LightWishForm.點燈祈福`

- **Line:** 135
  - **Kind:** `attr:placeholder`
  - **Original:** "匿名善信"
  - **Suggested key:** `components.LightWishForm.匿名善信`

- **Line:** 148
  - **Kind:** `attr:placeholder`
  - **Original:** "願一切眾生平安喜樂"
  - **Suggested key:** `components.LightWishForm.願一切眾生平安喜樂`

### `src/components/TimeInput.tsx`（3 筆）

- **Line:** 21
  - **Kind:** `attr:placeholder`
  - **Original:** "選擇日期和時間"
  - **Suggested key:** `components.TimeInput.選擇日期和時間`

- **Line:** 82
  - **Kind:** `jsx-text`
  - **Original:** "日期"
  - **Suggested key:** `components.TimeInput.日期`

- **Line:** 94
  - **Kind:** `jsx-text`
  - **Original:** "時間"
  - **Suggested key:** `components.TimeInput.時間`

### `src/pages/About.tsx`（2 筆）

- **Line:** 7
  - **Kind:** `jsx-text`
  - **Original:** "關於我們"
  - **Suggested key:** `pages.About.關於我們`

- **Line:** 11
  - **Kind:** `jsx-text`
  - **Original:** "RxV 夢想創作工作室"
  - **Suggested key:** `pages.About.rxv_夢想創作工作室`

### `src/pages/blog/BlogHome.tsx`（2 筆）

- **Line:** 32
  - **Kind:** `jsx-text`
  - **Original:** "文章"
  - **Suggested key:** `blog.BlogHome.文章`

- **Line:** 154
  - **Kind:** `jsx-text`
  - **Original:** "所有文章由 RxV 夢想創作工作室撰寫 · 保留所有權利"
  - **Suggested key:** `blog.BlogHome.所有文章由_rxv_夢想創作工作室撰寫_保留所有權利`

### `src/pages/blog/finance.tsx`（2 筆）

- **Line:** 9
  - **Kind:** `jsx-text`
  - **Original:** "📖 健康與理財專欄｜RxV 夢想創作工作室"
  - **Suggested key:** `blog.finance.健康與理財專欄_rxv_夢想創作工作室`

- **Line:** 46
  - **Kind:** `jsx-text`
  - **Original:** "📖 健康與理財專欄"
  - **Suggested key:** `blog.finance.健康與理財專欄`

### `src/pages/blog/LazyHome.tsx`（2 筆）

- **Line:** 214
  - **Kind:** `jsx-text`
  - **Original:** "📰 最新補助懶人包文章"
  - **Suggested key:** `blog.LazyHome.最新補助懶人包文章`

- **Line:** 221
  - **Kind:** `jsx-text`
  - **Original:** "閱讀更多 →"
  - **Suggested key:** `blog.LazyHome.閱讀更多`

### `src/pages/blog/retirement.tsx`（2 筆）

- **Line:** 9
  - **Kind:** `jsx-text`
  - **Original:** "📊 勞保退休金試算｜RxV 夢想創作工作室"
  - **Suggested key:** `blog.retirement.勞保退休金試算_rxv_夢想創作工作室`

- **Line:** 46
  - **Kind:** `jsx-text`
  - **Original:** "📊 勞保退休金試算"
  - **Suggested key:** `blog.retirement.勞保退休金試算`

### `src/pages/Contact.tsx`（2 筆）

- **Line:** 7
  - **Kind:** `jsx-text`
  - **Original:** "聯絡我們"
  - **Suggested key:** `pages.Contact.聯絡我們`

- **Line:** 15
  - **Kind:** `jsx-text`
  - **Original:** "📩 聯絡 Email"
  - **Suggested key:** `pages.Contact.聯絡_email`

### `src/pages/CreateWishPage.tsx`（2 筆）

- **Line:** 99
  - **Kind:** `jsx-text`
  - **Original:** "許下新願望"
  - **Suggested key:** `pages.CreateWishPage.許下新願望`

- **Line:** 116
  - **Kind:** `attr:placeholder`
  - **Original:** "寫下你的願望..."
  - **Suggested key:** `pages.CreateWishPage.寫下你的願望`

### `src/pages/health/diet-mind-2025.tsx`（2 筆）

- **Line:** 15
  - **Kind:** `jsx-text`
  - **Original:** "飲食覺察｜從三餐開始打造心理健康｜RxV 健康專欄"
  - **Suggested key:** `health.diet-mind-2025.飲食覺察_從三餐開始打造心理健康_rxv_健康專欄`

- **Line:** 32
  - **Kind:** `jsx-text-en`
  - **Original:** "Mindful Eating｜Build Mental Wellness from Every Meal｜RxV Health"
  - **Suggested key:** `health.diet-mind-2025.mindful_eating_build_mental_wellness`

### `src/pages/health/sleep-balance-2025.tsx`（2 筆）

- **Line:** 15
  - **Kind:** `jsx-text`
  - **Original:** "睡眠力回春｜每天多睡一小時，健康財富都變好｜RxV 健康專欄"
  - **Suggested key:** `health.sleep-balance-2025.睡眠力回春_每天多睡一小時_健康財富都變好_rxv_健康專欄`

- **Line:** 32
  - **Kind:** `jsx-text-en`
  - **Original:** "Power of Sleep｜One More Hour for Health & Wealth｜RxV Health Insight"
  - **Suggested key:** `health.sleep-balance-2025.power_of_sleep_one_more_hour_for_hea`

### `src/pages/PaymentInfo.tsx`（2 筆）

- **Line:** 63
  - **Kind:** `jsx-text-en`
  - **Original:** "NT$99 for 100,000 characters"
  - **Suggested key:** `pages.PaymentInfo.nt_99_for_100_000_characters`

- **Line:** 64
  - **Kind:** `jsx-text-en`
  - **Original:** "NT$199 for 300,000 characters"
  - **Suggested key:** `pages.PaymentInfo.nt_199_for_300_000_characters`

### `src/pages/PomodoroPage-202601250627.tsx`（2 筆）

- **Line:** 586
  - **Kind:** `jsx-text`
  - **Original:** "專注中也可以搭配使用："
  - **Suggested key:** `pages.PomodoroPage-202601250627.專注中也可以搭配使用`

- **Line:** 646
  - **Kind:** `attr:aria-label`
  - **Original:** "關閉提示"
  - **Suggested key:** `pages.PomodoroPage-202601250627.關閉提示`

### `src/pages/qr/[id].tsx`（2 筆）

- **Line:** 25
  - **Kind:** `jsx-text`
  - **Original:** "QR Code 分享"
  - **Suggested key:** `qr.[id].qr_code_分享`

- **Line:** 33
  - **Kind:** `jsx-text-en`
  - **Original:** "QR Code"
  - **Suggested key:** `qr.[id].qr_code`

### `src/pages/reset.tsx`（2 筆）

- **Line:** 36
  - **Kind:** `jsx-text`
  - **Original:** "忘記密碼"
  - **Suggested key:** `pages.reset.忘記密碼`

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "請輸入 Email 以重設密碼"
  - **Suggested key:** `pages.reset.請輸入_email_以重設密碼`

### `src/pages/shopping/results.tsx`（2 筆）

- **Line:** 163
  - **Kind:** `jsx-text`
  - **Original:** "載入中…"
  - **Suggested key:** `shopping.results.載入中`

- **Line:** 208
  - **Kind:** `jsx-text`
  - **Original:** "🔎 相關搜尋"
  - **Suggested key:** `shopping.results.相關搜尋`

### `src/pages/tools/shopee-video/components/ImagesUploader.tsx`（2 筆）

- **Line:** 19
  - **Kind:** `attr:title`
  - **Original:** "(B) 圖片上傳區"
  - **Suggested key:** `components.ImagesUploader.b_圖片上傳區`

- **Line:** 26
  - **Kind:** `jsx-text`
  - **Original:** "圖片 URL"
  - **Suggested key:** `components.ImagesUploader.圖片_url`

### `src/pages/WishDetailPage.tsx`（2 筆）

- **Line:** 37
  - **Kind:** `jsx-text`
  - **Original:** "找不到此願望"
  - **Suggested key:** `pages.WishDetailPage.找不到此願望`

- **Line:** 42
  - **Kind:** `jsx-text`
  - **Original:** "點燈祈福，願望成真 🪔"
  - **Suggested key:** `pages.WishDetailPage.點燈祈福_願望成真`

### `src/components/CommentForm.tsx`（2 筆）

- **Line:** 48
  - **Kind:** `attr:placeholder`
  - **Original:** "你的名字（可空白）"
  - **Suggested key:** `components.CommentForm.你的名字_可空白`

- **Line:** 54
  - **Kind:** `attr:placeholder`
  - **Original:** "留言..."
  - **Suggested key:** `components.CommentForm.留言`

### `src/components/SubscriptionSettings.tsx`（2 筆）

- **Line:** 66
  - **Kind:** `jsx-text`
  - **Original:** "📬 訂閱設定"
  - **Suggested key:** `components.SubscriptionSettings.訂閱設定`

- **Line:** 69
  - **Kind:** `jsx-text`
  - **Original:** "是否訂閱"
  - **Suggested key:** `components.SubscriptionSettings.是否訂閱`

### `src/components/VideoToolUnavailable.tsx`（2 筆）

- **Line:** 20
  - **Kind:** `jsx-text`
  - **Original:** "功能開發中"
  - **Suggested key:** `components.VideoToolUnavailable.功能開發中`

- **Line:** 24
  - **Kind:** `jsx-text`
  - **Original:** "敬請期待後續版本。"
  - **Suggested key:** `components.VideoToolUnavailable.敬請期待後續版本`

### `src/components/WishInput.tsx`（2 筆）

- **Line:** 59
  - **Kind:** `jsx-text`
  - **Original:** "💬 許下你的願望"
  - **Suggested key:** `components.WishInput.許下你的願望`

- **Line:** 69
  - **Kind:** `attr:placeholder`
  - **Original:** "在這裡寫下你的願望..."
  - **Suggested key:** `components.WishInput.在這裡寫下你的願望`

### `src/components/WishLightsList.tsx`（2 筆）

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "載入中..."
  - **Suggested key:** `components.WishLightsList.載入中`

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "目前尚無點燈紀錄"
  - **Suggested key:** `components.WishLightsList.目前尚無點燈紀錄`

### `src/pages/aids/rental-subsidy-2025.tsx`（1 筆）

- **Line:** 43
  - **Kind:** `jsx-text`
  - **Original:** "300 億元中央擴大租金補貼專案"
  - **Suggested key:** `aids.rental-subsidy-2025.300_億元中央擴大租金補貼專案`

### `src/pages/language-guide.tsx`（1 筆）

- **Line:** 226
  - **Kind:** `seo-keywords`
  - **Original:** "i18n, language switching, multilingual, React i18next, translation"
  - **Suggested key:** `pages.language-guide.i18n_language_switching_multilingu`

### `src/pages/NotFound.tsx`（1 筆）

- **Line:** 9
  - **Kind:** `jsx-text`
  - **Original:** "頁面不存在"
  - **Suggested key:** `pages.NotFound.頁面不存在`

### `src/pages/policy-explained.tsx`（1 筆）

- **Line:** 154
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `pages.policy-explained.相關工具`

### `src/pages/PomodoroPage.tsx`（1 筆）

- **Line:** 869
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `pages.PomodoroPage.相關工具`

### `src/pages/PurchasePage.tsx`（1 筆）

- **Line:** 2
  - **Kind:** `jsx-text`
  - **Original:** "[?�購?�能?��??�中]"
  - **Suggested key:** `pages.PurchasePage.購_能_中`

### `src/pages/ServiceDescription.tsx`（1 筆）

- **Line:** 24
  - **Kind:** `jsx-text`
  - **Original:** "繁體中文"
  - **Suggested key:** `pages.ServiceDescription.繁體中文`

### `src/pages/TodoPage.tsx`（1 筆）

- **Line:** 479
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `pages.TodoPage.相關工具`

### `src/pages/tools/shopee-video/components/HighlightsEditor.tsx`（1 筆）

- **Line:** 48
  - **Kind:** `attr:title`
  - **Original:** "移除"
  - **Suggested key:** `components.HighlightsEditor.移除`

### `src/pages/tools/shopee-video/components/ScriptCard.tsx`（1 筆）

- **Line:** 28
  - **Kind:** `attr:placeholder`
  - **Original:** "腳本內容..."
  - **Suggested key:** `components.ScriptCard.腳本內容`

### `src/pages/VideoPreviewPage.tsx`（1 筆）

- **Line:** 11
  - **Kind:** `jsx-text`
  - **Original:** "影音預覽頁已調整"
  - **Suggested key:** `pages.VideoPreviewPage.影音預覽頁已調整`

### `src/components/AdminGuard.tsx`（1 筆）

- **Line:** 21
  - **Kind:** `jsx-text`
  - **Original:** "載入中…"
  - **Suggested key:** `components.AdminGuard.載入中`

### `src/components/ChantSoundSelector.tsx`（1 筆）

- **Line:** 61
  - **Kind:** `jsx-text`
  - **Original:** "🎵 背景音效"
  - **Suggested key:** `components.ChantSoundSelector.背景音效`

### `src/components/ClickableWoodfish.tsx`（1 筆）

- **Line:** 84
  - **Kind:** `attr:alt`
  - **Original:** "木魚"
  - **Suggested key:** `components.ClickableWoodfish.木魚`

### `src/components/CountdownReminder.tsx`（1 筆）

- **Line:** 78
  - **Kind:** `jsx-text`
  - **Original:** "請提醒團友領貨！"
  - **Suggested key:** `components.CountdownReminder.請提醒團友領貨`

### `src/components/ErrorBoundary.tsx`（1 筆）

- **Line:** 29
  - **Kind:** `jsx-text`
  - **Original:** "❌ 頁面載入錯誤"
  - **Suggested key:** `components.ErrorBoundary.頁面載入錯誤`

### `src/components/FAQ.tsx`（1 筆）

- **Line:** 5
  - **Kind:** `attr:title`
  - **Original:** "常見問題"
  - **Suggested key:** `components.FAQ.常見問題`

### `src/components/LanguageSwitcher.tsx`（1 筆）

- **Line:** 39
  - **Kind:** `attr:title`
  - **Original:** "中文"
  - **Suggested key:** `components.LanguageSwitcher.中文`

### `src/components/LightUpButton.example.tsx`（1 筆）

- **Line:** 70
  - **Kind:** `jsx-text`
  - **Original:** "🙏 為此願望點燈祈福"
  - **Suggested key:** `components.LightUpButton.example.為此願望點燈祈福`

### `src/components/MusicPlayer.tsx`（1 筆）

- **Line:** 41
  - **Kind:** `jsx-text`
  - **Original:** "🎵 背景音樂"
  - **Suggested key:** `components.MusicPlayer.背景音樂`

### `src/components/RSSButton.tsx`（1 筆）

- **Line:** 13
  - **Kind:** `jsx-text`
  - **Original:** "訂閱 RSS"
  - **Suggested key:** `components.RSSButton.訂閱_rss`

### `src/components/SearchInput.tsx`（1 筆）

- **Line:** 18
  - **Kind:** `attr:placeholder`
  - **Original:** "🔍 搜尋標題、對象或發起人"
  - **Suggested key:** `components.SearchInput.搜尋標題_對象或發起人`

### `src/components/seo/BreadcrumbNav.tsx`（1 筆）

- **Line:** 17
  - **Kind:** `attr:aria-label`
  - **Original:** "麵包屑"
  - **Suggested key:** `seo.BreadcrumbNav.麵包屑`

### `src/components/seo/PopularPages.tsx`（1 筆）

- **Line:** 14
  - **Kind:** `attr:title`
  - **Original:** "熱門主題頁"
  - **Suggested key:** `seo.PopularPages.熱門主題頁`

### `src/components/seo/RelatedGuides.tsx`（1 筆）

- **Line:** 14
  - **Kind:** `attr:title`
  - **Original:** "相關教學文章"
  - **Suggested key:** `seo.RelatedGuides.相關教學文章`

### `src/components/seo/RelatedTools.tsx`（1 筆）

- **Line:** 14
  - **Kind:** `attr:title`
  - **Original:** "相關工具"
  - **Suggested key:** `seo.RelatedTools.相關工具`

### `src/components/shopping/ProductCard.tsx`（1 筆）

- **Line:** 69
  - **Kind:** `jsx-text`
  - **Original:** "官方旗艦店"
  - **Suggested key:** `shopping.ProductCard.官方旗艦店`

### `src/components/SupportSection.tsx`（1 筆）

- **Line:** 83
  - **Kind:** `jsx-text`
  - **Original:** "每人對每個活動僅能按一次支持"
  - **Suggested key:** `components.SupportSection.每人對每個活動僅能按一次支持`

### `src/components/TodoList.tsx`（1 筆）

- **Line:** 91
  - **Kind:** `jsx-text-en`
  - **Original:** "Toggle task status"
  - **Suggested key:** `components.TodoList.toggle_task_status`

### `src/components/TopAnnouncementBar.tsx`（1 筆）

- **Line:** 55
  - **Kind:** `jsx-text`
  - **Original:** "11 月 5 日"
  - **Suggested key:** `components.TopAnnouncementBar.11_月_5_日`

### `src/components/WishCard.tsx`（1 筆）

- **Line:** 25
  - **Kind:** `jsx-text`
  - **Original:** "🙏 為此願望點燈祈福"
  - **Suggested key:** `components.WishCard.為此願望點燈祈福`


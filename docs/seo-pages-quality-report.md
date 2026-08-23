# seoPages.json 品質檢查報告

- 產生日期：2026-03-28
- 資料來源：`src/data/seoPages.json`
- 總筆數：220

## 1. 完全重複檢查

### slug
**無重複**

### title
**無重複**

### description
**無重複**

### FAQ（整組 JSON 相同）
**無完全相同的 FAQ 區塊**

### useCases（整組 JSON 相同）
**無完全相同的 useCases**

## 2. 關鍵字重疊度（同工具類別）

- 指標：兩筆 keywords 逗號欄位的 Jaccard 係數。
- 門檻：≥ **0.75** 列為「重疊偏高」；≥ **0.9** 列為「重疊過高」。

### image-resize
- 同工具內最高 Jaccard：**0.556**（rxv-seo-ir-001 / rxv-seo-ir-002）
- ≥0.75 的筆對數：**0**（其中 ≥0.9：**0**）

### image-compress
- 同工具內最高 Jaccard：**0.556**（rxv-seo-ic-001 / rxv-seo-ic-002）
- ≥0.75 的筆對數：**0**（其中 ≥0.9：**0**）

### qr-code
- 同工具內最高 Jaccard：**0.500**（rxv-seo-qr-001 / rxv-seo-qr-002）
- ≥0.75 的筆對數：**0**（其中 ≥0.9：**0**）

### ai-summary
- 同工具內最高 Jaccard：**0.500**（rxv-seo-ai-001 / rxv-seo-ai-002）
- ≥0.75 的筆對數：**0**（其中 ≥0.9：**0**）

### pomodoro
- 同工具內最高 Jaccard：**0.556**（rxv-seo-pm-001 / rxv-seo-pm-002）
- ≥0.75 的筆對數：**0**（其中 ≥0.9：**0**）

## 3. 同工具 description 相似度（字元 bigram Jaccard）

- 指標：描述文字經去空白後，字元 bigram 的 Jaccard。
- 門檻：≥ **0.55** 列為「偏相似」；≥ **0.72** 列為「高度相似」。

### image-resize
- 同工具內最高 bigram Jaccard：**0.618**（rxv-seo-ir-012 / rxv-seo-ir-013）
- ≥0.55 的筆對數：**7**（其中 ≥0.72：**0**）

前 12 筆（由高到低）：

| slug A | slug B | Jaccard |
| --- | --- | --- |
| rxv-seo-ir-012 | rxv-seo-ir-013 | 0.618 |
| rxv-seo-ir-023 | rxv-seo-ir-024 | 0.606 |
| rxv-seo-ir-034 | rxv-seo-ir-035 | 0.600 |
| rxv-seo-ir-001 | rxv-seo-ir-002 | 0.596 |
| rxv-seo-ir-018 | rxv-seo-ir-021 | 0.557 |
| rxv-seo-ir-016 | rxv-seo-ir-021 | 0.551 |
| rxv-seo-ir-016 | rxv-seo-ir-022 | 0.550 |

### image-compress
- 同工具內最高 bigram Jaccard：**0.661**（rxv-seo-ic-007 / rxv-seo-ic-010）
- ≥0.55 的筆對數：**175**（其中 ≥0.72：**0**）

前 12 筆（由高到低）：

| slug A | slug B | Jaccard |
| --- | --- | --- |
| rxv-seo-ic-007 | rxv-seo-ic-010 | 0.661 |
| rxv-seo-ic-006 | rxv-seo-ic-010 | 0.653 |
| rxv-seo-ic-005 | rxv-seo-ic-010 | 0.648 |
| rxv-seo-ic-004 | rxv-seo-ic-010 | 0.643 |
| rxv-seo-ic-009 | rxv-seo-ic-010 | 0.643 |
| rxv-seo-ic-001 | rxv-seo-ic-010 | 0.633 |
| rxv-seo-ic-005 | rxv-seo-ic-006 | 0.633 |
| rxv-seo-ic-006 | rxv-seo-ic-007 | 0.633 |
| rxv-seo-ic-018 | rxv-seo-ic-021 | 0.632 |
| rxv-seo-ic-040 | rxv-seo-ic-043 | 0.628 |
| rxv-seo-ic-003 | rxv-seo-ic-010 | 0.628 |
| rxv-seo-ic-004 | rxv-seo-ic-006 | 0.628 |

### qr-code
- 同工具內最高 bigram Jaccard：**0.680**（rxv-seo-qr-014 / rxv-seo-qr-015）
- ≥0.55 的筆對數：**181**（其中 ≥0.72：**0**）

前 12 筆（由高到低）：

| slug A | slug B | Jaccard |
| --- | --- | --- |
| rxv-seo-qr-014 | rxv-seo-qr-015 | 0.680 |
| rxv-seo-qr-036 | rxv-seo-qr-037 | 0.672 |
| rxv-seo-qr-003 | rxv-seo-qr-004 | 0.669 |
| rxv-seo-qr-025 | rxv-seo-qr-026 | 0.656 |
| rxv-seo-qr-015 | rxv-seo-qr-020 | 0.654 |
| rxv-seo-qr-019 | rxv-seo-qr-021 | 0.654 |
| rxv-seo-qr-013 | rxv-seo-qr-021 | 0.649 |
| rxv-seo-qr-005 | rxv-seo-qr-006 | 0.644 |
| rxv-seo-qr-035 | rxv-seo-qr-043 | 0.642 |
| rxv-seo-qr-037 | rxv-seo-qr-042 | 0.642 |
| rxv-seo-qr-018 | rxv-seo-qr-019 | 0.640 |
| rxv-seo-qr-004 | rxv-seo-qr-009 | 0.639 |

### ai-summary
- 同工具內最高 bigram Jaccard：**0.692**（rxv-seo-ai-003 / rxv-seo-ai-006）
- ≥0.55 的筆對數：**220**（其中 ≥0.72：**0**）

前 12 筆（由高到低）：

| slug A | slug B | Jaccard |
| --- | --- | --- |
| rxv-seo-ai-003 | rxv-seo-ai-006 | 0.692 |
| rxv-seo-ai-003 | rxv-seo-ai-010 | 0.683 |
| rxv-seo-ai-014 | rxv-seo-ai-017 | 0.682 |
| rxv-seo-ai-025 | rxv-seo-ai-032 | 0.680 |
| rxv-seo-ai-025 | rxv-seo-ai-028 | 0.673 |
| rxv-seo-ai-014 | rxv-seo-ai-021 | 0.673 |
| rxv-seo-ai-017 | rxv-seo-ai-021 | 0.673 |
| rxv-seo-ai-006 | rxv-seo-ai-010 | 0.670 |
| rxv-seo-ai-036 | rxv-seo-ai-043 | 0.670 |
| rxv-seo-ai-003 | rxv-seo-ai-005 | 0.664 |
| rxv-seo-ai-036 | rxv-seo-ai-039 | 0.664 |
| rxv-seo-ai-016 | rxv-seo-ai-021 | 0.661 |

### pomodoro
- 同工具內最高 bigram Jaccard：**0.629**（rxv-seo-pm-003 / rxv-seo-pm-011）
- ≥0.55 的筆對數：**165**（其中 ≥0.72：**0**）

前 12 筆（由高到低）：

| slug A | slug B | Jaccard |
| --- | --- | --- |
| rxv-seo-pm-003 | rxv-seo-pm-011 | 0.629 |
| rxv-seo-pm-007 | rxv-seo-pm-011 | 0.629 |
| rxv-seo-pm-025 | rxv-seo-pm-033 | 0.625 |
| rxv-seo-pm-003 | rxv-seo-pm-006 | 0.620 |
| rxv-seo-pm-005 | rxv-seo-pm-011 | 0.619 |
| rxv-seo-pm-029 | rxv-seo-pm-033 | 0.619 |
| rxv-seo-pm-003 | rxv-seo-pm-005 | 0.617 |
| rxv-seo-pm-001 | rxv-seo-pm-006 | 0.615 |
| rxv-seo-pm-025 | rxv-seo-pm-027 | 0.613 |
| rxv-seo-pm-025 | rxv-seo-pm-028 | 0.613 |
| rxv-seo-pm-001 | rxv-seo-pm-011 | 0.607 |
| rxv-seo-pm-006 | rxv-seo-pm-011 | 0.607 |

## 4. 總結與建議

- **完全重複項目**：無（slug／title／description／FAQ／useCases）。
- **關鍵字**：全檔跨筆對最高 Jaccard 約 **0.556**（image-resize：rxv-seo-ir-001 / rxv-seo-ir-002）；目前未達 0.75 偏高門檻。若未來高於 0.85，可再增加每筆獨立語意標籤。
- **描述相似度**：請以第 3 節「同工具內最高 bigram Jaccard」為主；未達 0.72 高度相似門檻通常可接受。若特定主題群組仍偏近，可再微調場景句型或加入更多專有名詞。

---
*本報告由 `scripts/checkSeoPagesQuality.mjs` 自動產生。*
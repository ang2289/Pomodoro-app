export const sensitiveWords = [
  '色情', '暴力', '血腥', '自殺', '毒品', '強姦', '殺人', '強奸', '仇恨', '恐攻',
  '裸露', '謀殺', '虐待', '侵犯', '爆炸', '性侵', '槍擊', '恐怖', '性行為',
]

export function containsSensitiveWords(text: string): boolean {
  return sensitiveWords.some(word => text.includes(word))
}

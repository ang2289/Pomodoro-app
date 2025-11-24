import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  url?: string
  image?: string
}

export default function SEO({
  title = 'AI 工具與生活服務中心',
  description = '免費 AI 摘要工具、商品比價、政府補助懶人包、健康理財文章，每天實用新功能一次整合。',
  keywords = 'AI 摘要工具, JSON Schema, Supabase Edge, Gemini 2.0 Flash, 比價工具, 補助懶人包, 健康理財',
  url = 'https://pomodoro-app-eight-rouge.vercel.app',
  image,
}: SEOProps) {
  const baseUrl = 'https://pomodoro-app-eight-rouge.vercel.app'
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${baseUrl}${image}`
    : `${baseUrl}/seo-default.png`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  )
}










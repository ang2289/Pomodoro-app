interface SEOConfig {
  title: string
  description: string
  url: string
  image?: string
}

export function buildSEO({ title, description, url, image = '/seo-default.png' }: SEOConfig) {
  const fullTitle = `${title}｜AI 工具與生活服務中心`
  const baseUrl = 'https://pomodoro-app-eight-rouge.vercel.app'
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: url.startsWith('http') ? url : `${baseUrl}${url}`,
      images: [{ url: fullImageUrl }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: fullTitle,
      description,
      image: fullImageUrl,
    },
  }
}


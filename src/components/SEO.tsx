import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  url?: string;
  canonical?: string;
  image?: string;
  video?: string;
  ogType?: string;
  noindex?: boolean;
  keywords?: string;
  jsonLd?: Record<string, unknown>;
  jsonLdList?: Record<string, unknown>[];
}

const BASE_URL_FALLBACK = 'https://pomodoro-app-eight-rouge.vercel.app';

export function getBaseUrl(): string {
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { VITE_SITE_URL?: string } }).env?.VITE_SITE_URL) ||
    BASE_URL_FALLBACK
  );
}

export default function SEO({
  title,
  description,
  path = '/',
  url: urlProp,
  canonical: canonicalProp,
  image,
  video,
  ogType = 'website',
  noindex = false,
  keywords,
  jsonLd,
  jsonLdList,
}: SEOProps) {
  const baseUrl = getBaseUrl();

  const canonicalPath = path.startsWith('/') ? path : `/${path}`;
  const canonical = canonicalProp ?? urlProp ?? `${baseUrl.replace(/\/$/, '')}${canonicalPath}`;

  const toAbsUrl = (value?: string) => {
    if (!value) return undefined;
    return value.startsWith('http')
      ? value
      : `${baseUrl.replace(/\/$/, '')}${value.startsWith('/') ? value : `/${value}`}`;
  };

  const imageUrl = toAbsUrl(image);
  const videoUrl = toAbsUrl(video);
  const twitterCard = imageUrl ? 'summary_large_image' : 'summary';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {videoUrl && <meta property="og:video" content={videoUrl} />}
      {videoUrl && <meta property="og:video:secure_url" content={videoUrl} />}
      {videoUrl && <meta property="og:video:type" content="video/mp4" />}
      {videoUrl && <meta property="og:video:width" content="1080" />}
      {videoUrl && <meta property="og:video:height" content="1920" />}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
      {jsonLdList?.map((item, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(item)}</script>
      ))}
    </Helmet>
  );
}

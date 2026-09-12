import type { ComparisonSeoPageContent } from '@/data/comparisonSeoContent';
import type { SearchSeoPageData } from '@/data/searchSeoPages';
import type { GuideArticle } from '@/data/toolSeoContent';

export const searchSeoPageEnBySlug: Record<string, Partial<SearchSeoPageData>> = {
  'compress-image': {
    keyword: 'compress image',
    seoTitle: 'Search: compress images online | RxV',
    metaDescription:
      'Map “compress image” intent to RxV compression and format tips for forms, sites, and social attachments.',
    h1: 'Compress images: shrink JPG, PNG, and WebP',
    intro:
      'This page matches generic “compress image” searches: clarify use (web, social, or email), pick acceptable quality, then compress raster files in the browser for quick checks.',
    faqs: [
      { q: 'Resize or compress first?', a: 'Often resize to the displayed size first, then compress—usually more efficient.' },
      { q: 'RAW files?', a: 'Export to JPG/PNG/WebP first, then compress.' },
      { q: 'Batch processing?', a: 'Depends on device limits; ensure each file meets platform caps.' },
    ],
    ctaLabel: 'Open image compress',
  },
  'qr-code-generator': {
    keyword: 'qr code generator',
    seoTitle: 'Search: QR code generator | RxV',
    metaDescription:
      'Route “qr code generator” searches to RxV free generator pages for Wi‑Fi, cards, and reviews.',
    h1: 'QR code generator: encode URLs and text',
    intro:
      'Have HTTPS links or text ready, pick error correction if you add branding, and test scans on phones before printing.',
    faqs: [
      { q: 'Static vs dynamic?', a: 'Static encodes data in the image; dynamic often uses managed short URLs.' },
      { q: 'Colors?', a: 'OK with enough contrast and quiet zones.' },
      { q: 'Download format?', a: 'PNG or SVG—match print vs screen needs.' },
    ],
    ctaLabel: 'Open QR Code generator',
  },
  'ai-summary-tool': {
    keyword: 'ai summary tool',
    seoTitle: 'Search: AI summary tool hub | RxV',
    metaDescription:
      'Point “ai summary tool” searches to RxV AI summary and topic pages for text, PDF, and video flows.',
    h1: 'AI summary tool: condense long text',
    intro:
      'Confirm you may paste the content (privacy and policy). Summarize in sections for long inputs; switch to PDF or transcript guides when needed.',
    faqs: [
      { q: 'Replace professional judgment?', a: 'No—summaries assist; verify numbers and legal text.' },
      { q: 'Different from PDF pages?', a: 'Those focus on document structure; this is the general entry.' },
      { q: 'Multilingual?', a: 'Depends on model—verify proper nouns manually.' },
    ],
    ctaLabel: 'Open AI summary',
  },
  'pomodoro-timer-online': {
    keyword: 'pomodoro timer online',
    seoTitle: 'Search: online Pomodoro timer | RxV',
    metaDescription:
      'Map “pomodoro timer online” to RxV Pomodoro and rhythm guides—25-minute focus with short breaks.',
    h1: 'Online Pomodoro timer for study and work',
    intro:
      'Pomodoro pairs focused work with short breaks. Adjust lengths to your energy; compare with “focus timer” pages for longer single blocks.',
    faqs: [
      { q: 'Must it be 25 minutes?', a: 'Tune to your focus curve—avoid endless stretches without breaks.' },
      { q: 'vs focus timer pages?', a: 'Pomodoro emphasizes repeated rounds; focus timer pages favor custom long sessions.' },
      { q: 'Sound alerts?', a: 'Depends on browser notifications and permissions.' },
    ],
    ctaLabel: 'Open Pomodoro',
  },
};

export const comparisonPageEnBySlug: Record<string, Partial<ComparisonSeoPageContent>> = {
  'png-vs-jpg': {
    scenarioLabel: 'PNG vs JPG',
    h1: 'PNG vs JPG: transparency, size, and typical uses',
    seoTitle: 'PNG vs JPG | transparency & compression | RxV',
    metaDescription:
      'Compare PNG and JPG on file size, lossy vs lossless, transparency, and web use—then compress with RxV.',
    intro:
      'PNG fits UI shots, logos, and transparency; JPG fits photos and smooth gradients. Decide format before aggressive compression.',
    labelA: 'PNG',
    labelB: 'JPG / JPEG',
    table: [
      { criterion: 'File size', sideA: 'Often larger for photos at same pixels', sideB: 'Usually smaller for photos' },
      { criterion: 'Compression', sideA: 'Mostly lossless; less “mushy” repeats', sideB: 'Lossy; heavy settings show blocks' },
      { criterion: 'Compatibility', sideA: 'Broad support in browsers and tools', sideB: 'The most universal photo format' },
      { criterion: 'Typical uses', sideA: 'Transparent UI, screenshots, crisp lines', sideB: 'Camera photos, social thumbs, large backgrounds' },
    ],
    prosA: ['Transparency and cutouts', 'Crisp edges and text'],
    consA: ['Photos can be heavier'],
    prosB: ['Strong photo compression', 'Works everywhere'],
    consB: ['No transparency', 'Over-compression adds noise'],
    situations: ['E‑commerce mix of cutouts and lifestyle photos', 'Slides with screenshots', 'Blog heroes and inline photos'],
    faq: [
      { q: 'Site logos?', a: 'Often PNG or vector; if no transparency, evaluate WebP/SVG workflows.' },
      { q: 'Convert both ways?', a: 'Yes—JPG loses transparency when coming from PNG.' },
      { q: 'Big differences after compress?', a: 'Within-format settings matter; across formats pick purpose first.' },
    ],
    ctaLabel: 'Open image compress',
  },
  'jpg-vs-webp': {
    scenarioLabel: 'JPG vs WebP',
    h1: 'JPG vs WebP for modern web images',
    seoTitle: 'JPG vs WebP | size & compatibility | RxV',
    metaDescription:
      'Compare JPG and WebP on size, quality, and browser support—test with RxV compression.',
    intro:
      'WebP often beats JPG at similar quality, but plan fallbacks for older clients or keep JPG-only pipelines when maintenance is tight.',
    labelA: 'JPG',
    labelB: 'WebP',
    table: [
      { criterion: 'File size', sideA: 'Mature but not always smallest', sideB: 'Often smaller at similar quality' },
      { criterion: 'Compression', sideA: 'Classic lossy JPEG', sideB: 'Lossy or lossless options' },
      { criterion: 'Compatibility', sideA: 'Near universal', sideB: 'Great on modern browsers; plan fallbacks' },
      { criterion: 'Typical uses', sideA: 'Maximum compatibility photos', sideB: 'Web performance and LCP work' },
    ],
    prosA: ['Simplest compatibility story', 'Easy workflows'],
    consA: ['Often larger than WebP at same look'],
    prosB: ['Better size/quality tradeoffs', 'Can include transparency (encoder dependent)'],
    consB: ['Needs fallback or conversion plans'],
    situations: ['Blog image diets', 'E‑commerce grids', 'Landing hero images'],
    faq: [
      { q: 'Must I switch?', a: 'Depends on traffic vs maintenance—small sites may stay JPG-only.' },
      { q: 'Replace PNG?', a: 'Sometimes for photos; test transparency and sharp edges.' },
      { q: 'Safari?', a: 'Modern Safari supports WebP—still spot-check key devices.' },
    ],
    ctaLabel: 'Open image compress',
  },
  'qr-code-vs-barcode': {
    scenarioLabel: 'QR Code vs barcode',
    h1: 'QR codes vs 1D barcodes: data and scanning',
    seoTitle: 'QR Code vs barcode | retail & marketing | RxV',
    metaDescription:
      'Compare QR codes and classic barcodes on payload, distance, marketing use, and hardware—generate QR with RxV.',
    intro:
      '1D barcodes excel at short SKU-style codes; QR codes carry URLs and longer text for consumer phones.',
    labelA: 'QR Code',
    labelB: '1D barcode',
    table: [
      { criterion: 'Marketing', sideA: 'Links to pages, forms, and media', sideB: 'Mostly IDs resolved server-side' },
      { criterion: 'Scan speed', sideA: 'Depends on print quality and size', sideB: 'Laser retail scanners are very fast' },
      { criterion: 'Payload', sideA: 'Larger data including URLs', sideB: 'Short strings' },
      { criterion: 'Typical uses', sideA: 'Consumer phone scans', sideB: 'Warehouse, books, POS' },
    ],
    prosA: ['Holds URLs directly', 'Readable with phone cameras'],
    consA: ['Needs more area than thin barcodes', 'Some legacy guns lack 2D support'],
    prosB: ['Mature checkout workflows', 'Simple print bars'],
    consB: ['Not intuitive for long URLs to consumers'],
    situations: ['Packaging to warranty pages', 'Library circulation', 'Logistics outer cartons'],
    faq: [
      { q: 'Retail shelf label?', a: 'Operations often stay 1D; consumer education uses QR.' },
      { q: 'How much text fits in QR?', a: 'More modules mean denser codes—prefer short URLs.' },
      { q: 'Color QR?', a: 'Fine if contrast and margins remain safe.' },
    ],
    ctaLabel: 'Open QR Code generator',
  },
  'pomodoro-vs-traditional-study': {
    scenarioLabel: 'Pomodoro vs long study blocks',
    h1: 'Pomodoro vs “sit until done”: which fits you?',
    seoTitle: 'Pomodoro vs traditional study | RxV',
    metaDescription:
      'Compare timed Pomodoro rounds with long cram sessions for pacing, fatigue, and interruptions.',
    intro:
      'Long uninterrupted blocks suit deep flow; Pomodoro helps procrastination and fatigue with forced breaks. Mix: deep chapters long, admin tasks in Pomodoros.',
    labelA: 'Pomodoro',
    labelB: 'Long uninterrupted study',
    table: [
      { criterion: 'Getting started', sideA: 'Timer lowers cold-start friction', sideB: 'Fast once in flow' },
      { criterion: 'Ease', sideA: 'Simple rules, many apps', sideB: 'No tools, needs discipline' },
      { criterion: 'Output style', sideA: 'Progress by completed rounds', sideB: 'Progress by chapters completed' },
      { criterion: 'Typical uses', sideA: 'Splittable subjects and chores', sideB: 'Long proofs and continuous writing' },
    ],
    prosA: ['Breaks protect eyes and posture', 'Tasks feel measurable'],
    consA: ['Timer may break rare deep flow'],
    prosB: ['Unbroken reasoning chains', 'No clock pressure'],
    consB: ['Easy to over-sit or drift to phone', 'Fatigue sneaks up'],
    situations: ['Rotating subjects before exams', 'Coding and bugfix sessions', 'Mixing experiments and writing'],
    faq: [
      { q: 'Must it be 25 minutes?', a: 'Customize—keep a steady cadence that you review weekly.' },
      { q: 'Novel reading in Pomodoro?', a: 'Not required—match method to material.' },
      { q: 'Pair with todos?', a: 'Map one focused task per round for clarity.' },
    ],
    ctaLabel: 'Open Pomodoro timer',
  },
};

/** 高優先 guide 頁：英文主內容（slug 對應 guideArticlesExtended） */
export const guideArticleEnBySlug: Record<string, Partial<GuideArticle>> = {
  'instagram-post-size': {
    title: 'Instagram post sizes: square, portrait, and pixel basics',
    seoTitle: 'Instagram post size | 1:1, 4:5 crop | RxV',
    metaDescription:
      'IG feed ratios, suggested long-edge pixels, and carousel consistency—resize online before publishing.',
    intro:
      'Start from the placement: square and 4:5 dominate feeds. Without enough resolution, phones upscale and look soft. Pick single, carousel, or ad first, then export once to the right frame.',
    paragraphs: [
      '1080px wide is a common reference; 1:1 is the most universal, 4:5 uses more vertical space in feed.',
      'From camera or screenshots, crop to ratio before scaling to avoid skewed subjects.',
      'Carousels feel smoother when slides share a similar aspect or long edge.',
      'Keep copy, prices, and products inside safe zones away from UI chrome.',
      'Preview in draft and on a real device before publishing.',
      'If files are heavy, compress after sizing while keeping enough detail.',
    ],
    steps: [
      'Pick post type (single, carousel, ad) and target ratio.',
      'Upload to the resizer, set width/height or ratio, then download.',
      'Check draft previews, then publish.',
    ],
    faq: [
      { q: 'Must posts be exactly 1080px?', a: 'Not strictly, but correct ratio plus enough pixels reduces blur.' },
      { q: 'Mix portrait and square in one carousel?', a: 'Allowed—preview how the gallery feels while swiping.' },
      { q: 'Too large after crop?', a: 'Check if pixels exceed needs, then compress slightly.' },
    ],
    cta: { name: 'Image resize', path: '/tools/image-resize', desc: 'Open the tool to implement this guide.' },
  },
  'instagram-reels-size': {
    title: 'IG Reels size: 9:16, cover art, and safe zones',
    seoTitle: 'Instagram Reels size | vertical cover | RxV',
    metaDescription:
      'Reels vertical 9:16, still covers, and thumbnail safe zones—crop assets online for better swipe-through.',
    intro:
      'Reels are vertical-first. Horizontal art looks small or letterboxed. Match covers to 9:16, reserve space for titles, and keep the first frame compelling.',
    paragraphs: [
      '1080×1920 is a common reference—keep 9:16 for full-screen feel.',
      'Export a separate still cover with readable headline type at thumbnail size.',
      'When reframing landscape, recompose subjects into the vertical window.',
      'Contrast and type size drive swipe stops—test at small previews.',
      'After posting, review how covers look in the Reels tray.',
      'Do not reuse square feed habits—vertical needs its own templates.',
    ],
    steps: [
      'Confirm vertical video output and a matching cover still.',
      'Resize/crop cover overlays to the same ratio.',
      'Check on phones before publishing.',
    ],
    faq: [
      { q: 'Same as feed posts?', a: 'No—Reels are vertical; feed often square or 4:5.' },
      { q: 'Must cover match frame one?', a: 'Not required, but style should feel consistent.' },
      { q: 'Stretch landscape to vertical?', a: 'Avoid distortion—crop or recompose instead.' },
    ],
    cta: { name: 'Image resize', path: '/tools/image-resize', desc: 'Open the tool to implement this guide.' },
  },
  'youtube-thumbnail-size': {
    title: 'YouTube thumbnail size: 16:9, type, and CTR',
    seoTitle: 'YouTube thumbnail size | 16:9 | RxV',
    metaDescription:
      'Long-form thumbnails at 16:9 with readable text on phones—resize online before upload.',
    intro:
      'Thumbnails drive CTR. Align to the 16:9 player, keep enough resolution, and place faces and titles inside safe margins.',
    paragraphs: [
      '16:9 matches the long-form player—most stable default.',
      'Type and contrast must survive tiny subscription and search thumbnails.',
      'Keep key info center-left; the right may sit under duration UI.',
      'Series can share fonts/layouts for channel recognition.',
      'Shrink a preview to phone size before final export.',
      'If files are huge, trim pixels or compress while keeping text sharp.',
    ],
    steps: [
      'Design in 16:9 with headline hierarchy.',
      'Export at recommended pixel width via the resizer.',
      'Zoom out to thumbnail scale to verify readability.',
    ],
    faq: [
      { q: 'Need a face?', a: 'No, but you need a clear focal point and contrast.' },
      { q: 'Reuse for Shorts?', a: 'Shorts are vertical—make a separate cover.' },
      { q: 'Upload errors for size?', a: 'Lower resolution slightly or compress and retry.' },
    ],
    cta: { name: 'Image resize', path: '/tools/image-resize', desc: 'Open the tool to implement this guide.' },
  },
  'youtube-shorts-size': {
    title: 'YouTube Shorts size: vertical video and cover',
    seoTitle: 'YouTube Shorts size | 9:16 | RxV',
    metaDescription:
      'Shorts vertical 9:16, cover safe zones, and separate assets from long-form thumbnails.',
    intro:
      'Shorts feeds are vertical. Horizontal thumbs look tiny. Align covers and text to 9:16 and separate from 16:9 long-form art.',
    paragraphs: [
      '9:16 and ~1080×1920 match phone full-screen viewing.',
      'Keep text inside margins so UI chrome does not clip it.',
      'Long-form 16:9 thumbs should not be cropped blindly into Shorts—recompose.',
      'Captions and stickers belong inside safe zones.',
      'Batch templates help viewers recognize your Shorts in-grid.',
      'After upload, verify Shorts shelf and search previews.',
    ],
    steps: [
      'Prepare vertical video and a matching cover still.',
      'Resize overlay art to the same ratio.',
      'Preview on phone and tablet.',
    ],
    faq: [
      { q: 'Upload horizontal video?', a: 'Possible, but vertical wins reach in Shorts.' },
      { q: 'Minimum cover resolution?', a: 'Match clarity to your video; avoid heavy compression on text.' },
      { q: 'Share files with Reels?', a: 'Ratios are close—tweak per-platform safe zones.' },
    ],
    cta: { name: 'Image resize', path: '/tools/image-resize', desc: 'Open the tool to implement this guide.' },
  },
  'compress-image-large-files': {
    title: 'Compressing large images: order of resize, format, and quality',
    seoTitle: 'Large image compression | balance size & quality | RxV',
    metaDescription:
      'Resize to needed pixels, pick JPG/PNG/WebP, then tune compression—link to online compress for practical steps.',
    intro:
      'Forms, email, and sites cap file size. Blind “max compression” hurts less than right-sizing first. Typical order: resize to display pixels → choose format → compress.',
    paragraphs: [
      'Photos usually favor JPEG; transparency or sharp UI favors PNG, then compress.',
      'If pixels far exceed the screen, shrink long edges before heavy compression.',
      'Batch after a single-file test to set acceptable quality.',
      'Keep originals aside; compress copies to avoid stacked loss.',
      'Hard caps like 1MB may need both pixel and quality tweaks.',
      'After resizing for web, compression results are more predictable.',
    ],
    steps: [
      'Confirm scenario and minimum readable resolution.',
      'Upload to the compressor, pick format and quality.',
      'Compare before/after size and detail, then batch.',
    ],
    faq: [
      { q: 'Will it look bad?', a: 'Overdoing it will—step quality down gradually.' },
      { q: 'PNG as small as JPEG?', a: 'Rare for photos; JPEG is usually smaller.' },
      { q: 'Resize or compress first?', a: 'Usually resize first for efficiency.' },
    ],
    cta: { name: 'Image compress', path: '/tools/image-compress', desc: 'Open the tool to implement this guide.' },
  },
};

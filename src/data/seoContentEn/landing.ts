import type { ToolLandingPageContent, ToolLandingToolKey } from '@/data/toolSeoContent';

/** 依 toolKey 共用的英文 UI 文案（CTA、麵包屑父層、相關工具列） */
export const toolLandingBaseEn: Partial<
  Record<
    ToolLandingToolKey,
    Pick<ToolLandingPageContent, 'toolLabel' | 'ctaLabel' | 'breadcrumbParentName' | 'relatedTools'>
  >
> = {
  'image-resize': {
    toolLabel: 'Image resize',
    ctaLabel: 'Open image resize',
    breadcrumbParentName: 'Image resize',
    relatedTools: [
      { name: 'Image compress', path: '/tools/image-compress', desc: 'Smaller files, faster loads.' },
      { name: 'QR Code generator', path: '/tools/qr-code', desc: 'Share links and assets fast.' },
      { name: 'AI summary', path: '/summary', desc: 'Tighten copy and notes.' },
      { name: 'Image tools hub', path: '/tools/image', desc: 'More image utilities.' },
    ],
  },
  'image-compress': {
    toolLabel: 'Image compress',
    ctaLabel: 'Open image compress',
    breadcrumbParentName: 'Image compress',
    relatedTools: [
      { name: 'Image resize', path: '/tools/image-resize', desc: 'Match social and platform sizes.' },
      { name: 'QR Code generator', path: '/tools/qr-code', desc: 'Traffic and sharing.' },
      { name: 'AI summary', path: '/summary', desc: 'Organize content.' },
      { name: 'Image tools hub', path: '/tools/image', desc: 'More image utilities.' },
    ],
  },
  'image-crop': {
    toolLabel: 'Image crop',
    ctaLabel: 'Open image crop tool',
    breadcrumbParentName: 'Image crop',
    relatedTools: [
      { name: 'Image resize', path: '/tools/image-resize', desc: 'Pixel-perfect sizing after cropping.' },
      { name: 'Image compress', path: '/tools/image-compress', desc: 'Smaller files for upload.' },
      { name: 'Image format conversion', path: '/tools/image-convert', desc: 'PNG, JPG, WebP.' },
      { name: 'Image tools hub', path: '/tools/image', desc: 'More image utilities.' },
    ],
  },
  'qr-code': {
    toolLabel: 'QR Code generator',
    ctaLabel: 'Open QR Code generator',
    breadcrumbParentName: 'QR Code generator',
    relatedTools: [
      { name: 'Image resize', path: '/tools/image-resize', desc: 'Print and sticker sizes.' },
      { name: 'Image compress', path: '/tools/image-compress', desc: 'Smaller scan images.' },
      { name: 'AI summary', path: '/summary', desc: 'Polish descriptions.' },
      { name: 'Image tools hub', path: '/tools/image', desc: 'More image utilities.' },
    ],
  },
  'ai-summary': {
    toolLabel: 'AI summary',
    ctaLabel: 'Open AI summary',
    breadcrumbParentName: 'AI tools',
    relatedTools: [
      { name: 'Homework helper', path: '/tools/homework-helper', desc: 'Step-by-step help.' },
      { name: 'Pomodoro', path: '/pomodoro', desc: 'Focus blocks for reading.' },
      { name: 'Image compress', path: '/tools/image-compress', desc: 'Lighter attachments.' },
      { name: 'QR Code', path: '/tools/qr-code', desc: 'Share summary links.' },
    ],
  },
  productivity: {
    toolLabel: 'Pomodoro & focus',
    ctaLabel: 'Open Pomodoro timer',
    breadcrumbParentName: 'Productivity',
    relatedTools: [
      { name: 'Todo list', path: '/todo', desc: 'Break tasks down.' },
      { name: 'AI summary', path: '/summary', desc: 'Clarify inputs before focus.' },
      { name: 'Homework helper', path: '/tools/homework-helper', desc: 'Study support.' },
      { name: 'Image compress', path: '/tools/image-compress', desc: 'Lighter assets.' },
    ],
  },
};

type LandingEn = Partial<
  Pick<
    ToolLandingPageContent,
    | 'scenarioLabel'
    | 'h1'
    | 'seoTitle'
    | 'metaDescription'
    | 'intro'
    | 'situations'
    | 'faq'
    | 'steps'
  >
>;

/** 各落地頁 id → 英文主內容（與 buildKeywordPage 產生的 id 一致） */
export const toolLandingPageEnById: Record<string, LandingEn> = {
  'image-resize-instagram-post-size': {
    scenarioLabel: 'Instagram post size',
    h1: 'Resize images for Instagram feed posts',
    seoTitle: 'Instagram post size | online image resize | RxV',
    metaDescription:
      'Resize to common IG feed ratios and resolutions so previews stay sharp. Use the browser-based resizer, then open the tool when you are ready.',
    intro:
      'Feed posts favor consistent aspect ratios. If the image does not match, Instagram may crop unpredictably. Resize once to the target frame, then compress if files are large.',
    situations: [
      'Creators publishing square or portrait feed images daily',
      'Exporting posters from design tools into IG-ready frames',
      'Carousel sets that need matching aspect ratios',
    ],
    faq: [
      { q: 'Do posts need exact pixels?', a: 'The app scales, but matching common ratios and enough resolution reduces blur and edge crops.' },
      { q: 'Can one tool handle square and portrait?', a: 'Yes—pick the target placement first, then set width/height or ratio in the resizer.' },
      { q: 'Will resizing make huge files?', a: 'If so, follow with image compression within an acceptable quality range.' },
    ],
  },
  'image-resize-instagram-reels-size': {
    scenarioLabel: 'Instagram Reels size',
    h1: 'Instagram Reels cover and vertical ratio',
    seoTitle: 'Instagram Reels size | 9:16 crop | RxV',
    metaDescription:
      'Cover Reels with correct vertical framing and safe zones. Crop still covers and assets online, then jump into the resize tool.',
    intro:
      'Reels are vertical-first. Wrong ratios look small or letterboxed. Align still covers to 9:16, leave space for UI, then upload with your video.',
    situations: ['Reels cover art for short video', 'Turning landscape photos vertical for Reels', 'Brand campaigns that need consistent vertical art'],
    faq: [
      { q: 'Should the still cover match the video?', a: 'Keep the same vertical ratio so previews feel consistent with playback.' },
      { q: 'Can I crop landscape to vertical?', a: 'Yes—reframe subjects inside the safe area before export.' },
      { q: 'Cover only vs full edit?', a: 'This flow focuses on still images; edit video in your editor of choice.' },
    ],
  },
  'image-resize-youtube-thumbnail-size': {
    scenarioLabel: 'YouTube thumbnail size',
    h1: 'YouTube thumbnail size and safe area',
    seoTitle: 'YouTube thumbnail size | 16:9 online resize | RxV',
    metaDescription:
      'Export 16:9 thumbnails at a strong resolution for phones and TVs. Resize online, then upload with readable text.',
    intro:
      'Thumbnails drive clicks. Weak resolution or wrong ratio looks soft on phones. Resize to 16:9 with enough pixels, then place titles and faces inside safe margins.',
    situations: ['Tutorial channels updating every upload', 'Long-form videos outside Shorts', 'A/B tests with multiple thumbnails'],
    faq: [
      { q: 'Must thumbnails be 16:9?', a: 'That matches the player; it is the most stable default for long-form YouTube.' },
      { q: 'Text looks tiny on mobile?', a: 'Increase headline size and keep margins clear of player chrome.' },
      { q: 'Reuse the same file for Shorts?', a: 'Shorts are vertical—make a separate 9:16 cover instead.' },
    ],
  },
  'image-resize-youtube-shorts-size': {
    scenarioLabel: 'YouTube Shorts size',
    h1: 'YouTube Shorts vertical size',
    seoTitle: 'YouTube Shorts size | vertical crop | RxV',
    metaDescription:
      'Shorts use vertical 9:16. Crop covers and overlays to match, avoiding black bars in previews.',
    intro:
      'Shorts surfaces are vertical. Horizontal art looks small. Match stills and overlays to 9:16 and reserve space for titles.',
    situations: ['Shorts covers after vertical edits', 'Repurposing IG-style vertical assets', 'Product demos in vertical format'],
    faq: [
      { q: 'Can I reuse long-form thumbnails?', a: 'Ratios differ—use a dedicated vertical cover for Shorts.' },
      { q: 'Crop 9:16 to 1:1?', a: 'You can, but you lose full-bleed vertical impact—decide by channel strategy.' },
      { q: 'Files too large after crop?', a: 'Compress after sizing to speed upload.' },
    ],
  },
  'image-resize-facebook-post-size': {
    scenarioLabel: 'Facebook post image size',
    h1: 'Facebook feed image sizes and crops',
    seoTitle: 'Facebook post size | online resize | RxV',
    metaDescription:
      'Align feed, link preview, and multi-image layouts. Resize online to reduce surprise crops on desktop and mobile.',
    intro:
      'Facebook crops previews by placement. Decide single image, multi-image, or link preview first, then export one master asset and derivatives if needed.',
    situations: ['Page posts for promos and events', 'Community announcements with hero images', 'Ads vs organic assets that need separate specs'],
    faq: [
      { q: 'Link preview vs single photo?', a: 'Preview crops differ—test both desktop and mobile mockups.' },
      { q: 'Must carousel images match?', a: 'Not strictly, but similar ratios feel smoother when swiping.' },
      { q: 'Upload rejected for size?', a: 'After resizing, compress to meet platform limits.' },
    ],
  },

  'image-compress-compress-image-online': {
    scenarioLabel: 'Compress image online',
    h1: 'Compress images online: smaller files, faster uploads',
    seoTitle: 'Compress image online | JPG/PNG/WebP | RxV',
    metaDescription:
      'Shrink common raster images in the browser for sites, forms, and social uploads—without installing desktop software.',
    intro:
      'Many flows cap file size. Compression trades bits for smaller KB while keeping acceptable quality. Start from the display size you need, then compress—often better than crushing quality alone.',
    situations: ['Blog and CMS hero images', 'Form uploads and ID scans', 'Email attachments with multiple screenshots'],
    faq: [
      { q: 'Will quality drop a lot?', a: 'Tune strength; try one file before batching.' },
      { q: 'Compress RAW or PSD directly?', a: 'Usually export to JPG/PNG/WebP first.' },
      { q: 'Resize before or after compress?', a: 'Often resize to needed pixels first, then compress.' },
    ],
  },
  'image-compress-compress-jpg-online': {
    scenarioLabel: 'Compress JPG online',
    h1: 'Compress JPG photos and screenshots',
    seoTitle: 'Compress JPG online | JPEG | RxV',
    metaDescription:
      'Reduce JPG/JPEG size for galleries, products, and screenshots while keeping readable detail.',
    intro:
      'JPEG is lossy—good for photos. Adjust compression to balance size and visible artifacts, and keep a master original when possible.',
    situations: ['E‑commerce product batches', 'Phone photos to forms or cloud', 'Embedded photos in slides'],
    faq: [
      { q: 'Does multi-pass JPEG hurt?', a: 'Yes—loss stacks; work from originals when you can.' },
      { q: 'JPG or PNG smaller?', a: 'Photos usually JPG; transparency or sharp UI often needs PNG.' },
      { q: 'Need transparency?', a: 'JPEG cannot do alpha—use PNG/WebP instead.' },
    ],
  },
  'image-compress-compress-png-online': {
    scenarioLabel: 'Compress PNG online',
    h1: 'Compress PNG: logos and UI assets',
    seoTitle: 'Compress PNG online | transparency | RxV',
    metaDescription:
      'Shrink PNG files for logos, cutouts, and UI slices while preserving edges and alpha.',
    intro:
      'PNG supports transparency but can be heavy. Compress to speed up sites and decks while checking edges stay crisp.',
    situations: ['Web header/footer logos', 'Cutout people for slides', 'App @2x/@3x raster slices'],
    faq: [
      { q: 'Will I lose transparency?', a: 'A proper PNG workflow keeps alpha—verify exports.' },
      { q: 'Why is PNG still big?', a: 'Color depth and resolution matter—crop unused margins too.' },
      { q: 'Convert to JPG to save space?', a: 'Only if you do not need transparency; expect detail changes.' },
    ],
  },
  'image-compress-reduce-image-file-size': {
    scenarioLabel: 'Reduce image file size',
    h1: 'Reduce image file size for upload limits',
    seoTitle: 'Reduce image file size | resize + compress | RxV',
    metaDescription:
      'Combine pixel dimensions, format choice, and compression to hit KB/MB limits for uploads and performance.',
    intro:
      'Two levers: fewer pixels and stronger compression. Often resize to the displayed size first, then compress—especially for web performance.',
    situations: ['Core Web Vitals and SEO image budgets', 'CRM ticket attachments', 'Messaging apps with many screenshots'],
    faq: [
      { q: 'Compress only without resize?', a: 'Yes, but oversized dimensions still waste bytes—resize when possible.' },
      { q: 'How do I know it is “too far”?', a: 'Zoom text edges and gradients; blockiness means back off compression.' },
      { q: 'What about SVG?', a: 'Vector assets use different optimization than raster compression.' },
    ],
  },
  'image-compress-compress-image-under-1mb': {
    scenarioLabel: 'Under 1MB images',
    h1: 'Compress images under 1MB for strict forms',
    seoTitle: 'Compress image under 1MB | RxV',
    metaDescription:
      'Many portals cap a single file at 1MB. Resize dimensions, pick a practical format, then compress to pass limits while staying readable.',
    intro:
      'When a portal says “under 1MB”, check allowed formats and minimum readable resolution. Resize long edges, prefer photo-friendly JPEG when appropriate, then tune compression.',
    situations: ['Government or school online forms', 'Internal HR/IT uploads', 'Contest submissions with caps'],
    faq: [
      { q: 'Still blurry at 1MB?', a: 'Raise acceptable pixel floor slightly or tighten crop composition.' },
      { q: 'Every image must be under 1MB?', a: 'Follow the specific rules; watch total upload size too.' },
      { q: 'ID photos with minimum DPI?', a: 'Meet width/height rules first, then compress within the cap.' },
    ],
  },

  'qr-code-free-qr-code-generator': {
    scenarioLabel: 'Free QR Code generator',
    h1: 'Free QR Code generator for URLs and text',
    seoTitle: 'Free QR code generator | RxV',
    metaDescription:
      'Create scannable QR images for links and text—download PNG/SVG for print or screens.',
    intro:
      'QR codes bundle long URLs into one scan. Use HTTPS links, pick error correction if you brand the code, and test scans on real phones before printing.',
    situations: ['Event check-in and surveys', 'Restaurant menus and table ordering', 'Business cards to site or LINE'],
    faq: [
      { q: 'Do static codes expire?', a: 'The pattern does not expire; short links behind them might.' },
      { q: 'Colors and logos?', a: 'Possible if contrast and quiet zones stay scannable.' },
      { q: 'Print size?', a: 'Scale to scanning distance; avoid tiny or blurry prints.' },
    ],
  },
  'qr-code-wifi-qr-code': {
    scenarioLabel: 'WiFi QR Code',
    h1: 'WiFi QR Code for guest networks',
    seoTitle: 'WiFi QR code | share network | RxV',
    metaDescription:
      'Encode SSID and password so guests scan to connect—fewer typos at the counter or lobby.',
    intro:
      'Cafés, studios, and venues repeat Wi‑Fi details often. A QR on a stand replaces spelling passwords aloud. Rotate QR when passwords change.',
    situations: ['Coffee shops and coworking', 'Short events and booths', 'Guest rooms and meeting spaces'],
    faq: [
      { q: 'Is sharing the QR risky?', a: 'Scanning reveals the password—use guest SSIDs or rotate secrets.' },
      { q: '5 GHz vs 2.4 GHz?', a: 'Generate separate codes or label bands if devices differ.' },
      { q: 'Password changed?', a: 'Regenerate and replace printed or on-screen QR assets.' },
    ],
  },
  'qr-code-business-card-qr-code': {
    scenarioLabel: 'Business card QR Code',
    h1: 'Business card QR to vCard or website',
    seoTitle: 'Business card QR code | RxV',
    metaDescription:
      'Link to HTTPS pages, mailto, or vCard downloads. Test Android/iOS scans before printing.',
    intro:
      'Paper cards fit little text. A QR can route to portfolio, booking, or chat. Keep mobile pages fast and verify links before print runs.',
    situations: ['Sales visits and trade shows', 'Speakers and creators', 'Retail membership sign-ups'],
    faq: [
      { q: 'Minimum print size?', a: 'Keep quiet zones and size for your expected scan distance.' },
      { q: 'Multiple QRs on one card?', a: 'Avoid clutter; one landing page with links may be cleaner.' },
      { q: 'Change destination later?', a: 'Static QR encodes content—use a stable URL or regenerate art.' },
    ],
  },
  'qr-code-google-review-qr-code': {
    scenarioLabel: 'Google review QR Code',
    h1: 'Google review QR for storefront feedback',
    seoTitle: 'Google review QR code | RxV',
    metaDescription:
      'Turn your Google Business review URL into a QR for counters and receipts—test login flows on site.',
    intro:
      'Lowering friction increases reviews. Use the correct Business Profile review link, follow platform policies on soliciting reviews, and test on customer phones.',
    situations: ['Checkout counter stands', 'Salons and clinics after service', 'Hotel checkout cards'],
    faq: [
      { q: 'Where do I get the link?', a: 'Use the official Business Profile sharing flow for your location.' },
      { q: 'No Google account on phone?', a: 'Reviews usually require sign-in—offer alternate feedback paths too.' },
      { q: 'Track scans?', a: 'Static QR has no analytics—use a trackable landing page if allowed.' },
    ],
  },
  'qr-code-line-official-qr-code': {
    scenarioLabel: 'LINE Official Account QR',
    h1: 'LINE Official Account QR for add-friend flows',
    seoTitle: 'LINE official account QR | RxV',
    metaDescription:
      'Convert official add-friend HTTPS links to QR codes for flyers, counters, and decks—verify before printing.',
    intro:
      'Retail and events drive LINE follows with QR. Paste the official add-friend URL, test iOS/Android scans, and refresh art when campaigns change.',
    situations: ['Store counters and receipts', 'Flyers and card backs', 'Booth slides and posters'],
    faq: [
      { q: 'Which link should I use?', a: 'The HTTPS add-friend URL from LINE Official Account Manager.' },
      { q: 'Brand colors on QR?', a: 'OK if contrast remains high enough to scan reliably.' },
      { q: 'Print size?', a: 'Match viewing distance; avoid blurry or overly dense modules.' },
    ],
  },

  'ai-summary-ai-text-summarizer': {
    scenarioLabel: 'AI text summarizer',
    h1: 'AI text summarizer for long reads',
    seoTitle: 'AI text summarizer | RxV',
    metaDescription:
      'Turn long text into bullets and takeaways for articles, email threads, and notes—verify facts afterward.',
    intro:
      'Summaries accelerate scanning before deep reading. AI works best on structured prose—double-check numbers, dates, and legal language manually.',
    situations: ['Research and market reports', 'Long email chains', 'Pre-meeting briefs'],
    faq: [
      { q: 'Replace reading the original?', a: 'Not for contracts or compliance—use summaries as triage only.' },
      { q: 'English content?', a: 'Usually supported; verify proper nouns yourself.' },
      { q: 'Sensitive documents?', a: 'Follow org policy; redact or use approved tools.' },
    ],
  },
  'ai-summary-article-summarizer': {
    scenarioLabel: 'Article summarizer',
    h1: 'Article summarizer for news and blogs',
    seoTitle: 'Article summarizer | RxV',
    metaDescription:
      'Condense articles into paragraph-level takeaways—only paste text you are allowed to use.',
    intro:
      'When volume is high, skim titles and conclusions first, then summarize sections you can legally copy. Rephrase outputs and cite sources when publishing.',
    situations: ['Daily news scans', 'Student literature reviews', 'Competitive content monitoring'],
    faq: [
      { q: 'Paste URLs automatically?', a: 'Depends on product—copy/paste allowed excerpts when paywalled.' },
      { q: 'Can I quote the summary?', a: 'Paraphrase and attribute to avoid plagiarism.' },
      { q: 'Different from transcript summary?', a: 'Articles are written structure; transcripts need filler removal.' },
    ],
  },
  'ai-summary-pdf-summarizer': {
    scenarioLabel: 'PDF summarizer',
    h1: 'PDF summarizer for papers and reports',
    seoTitle: 'PDF summarizer | RxV',
    metaDescription:
      'Copy selectable PDF text into AI summaries for papers and memos—tables and formulas need human review.',
    intro:
      'Selectable PDFs paste cleanly; scanned PDFs need OCR first. Summarize chapter by chapter to preserve logic, then verify figures and citations.',
    situations: ['Literature reviews', 'Whitepapers and RFP skims', 'Regulatory first passes (not a substitute for counsel)'],
    faq: [
      { q: 'Scanned PDFs?', a: 'OCR first or type key quotes manually.' },
      { q: 'Will formulas survive?', a: 'Assume risk—check math against the source.' },
      { q: 'Whole manuals?', a: 'Chunk within tool limits and stitch insights carefully.' },
    ],
  },
  'ai-summary-youtube-video-summarizer': {
    scenarioLabel: 'YouTube video summarizer',
    h1: 'YouTube video summarizer from transcripts',
    seoTitle: 'YouTube video summarizer | RxV',
    metaDescription:
      'Summarize teaching, interview, or live content from text you can legally use—pair with Pomodoro blocks for study.',
    intro:
      'Video is dense; summaries help decide what to watch in full. Use permitted captions or your own notes as input, and respect platform terms.',
    situations: ['Course replays', 'Long interviews and podcasts', 'Product and tech livestreams'],
    faq: [
      { q: 'No transcript?', a: 'Note timestamps and key lines yourself, then summarize.' },
      { q: 'Other platforms?', a: 'Same idea—lawful text in, structured notes out.' },
      { q: 'Reuse in reports?', a: 'Paraphrase and cite—avoid copying AI output verbatim.' },
    ],
  },

  'homework-helper-ai-homework-solver': {
    scenarioLabel: 'AI homework help',
    h1: 'AI homework help: step-by-step understanding',
    seoTitle: 'AI homework solver | homework helper | RxV',
    metaDescription:
      'Enter your problem details to get step-by-step reasoning and concept reminders. Always follow your course rules when using the RxV homework helper.',
    intro:
      'Homework is for practicing ideas. Write the prompt, what you know, and what confuses you; ask for step-by-step guidance first, then work through it yourself. If your course forbids AI assistance, follow your instructor.',
    situations: ['Exam-week concept review', 'Getting unstuck on proofs', 'Checking your own work'],
    faq: [
      { q: 'Can I submit AI answers directly?', a: 'Not recommended—it may violate academic integrity rules.' },
      { q: 'Does it work for humanities too?', a: 'Try by question type; essays still need your own argument and citations.' },
      { q: 'How should I describe the problem?', a: 'Include units, conditions, and what you already tried.' },
    ],
  },

  'ai-summary-research-paper-summary': {
    scenarioLabel: 'Research paper summary',
    h1: 'Research paper summary for literature reviews',
    seoTitle: 'Research paper summary | RxV',
    metaDescription:
      'Paste abstracts, sections, or introductions to outline questions and methods—verify data and citations manually.',
    intro:
      'Start with abstract and conclusion, then drill into methods as needed. Chunk long PDFs, merge outlines, and never treat AI as a citation authority.',
    situations: ['Graduate lit reviews', 'Industry whitepaper triage', 'Comparing competing claims across papers'],
    faq: [
      { q: 'Paste into my thesis?', a: 'Rewrite in your words with proper citations—avoid copying AI.' },
      { q: 'Figures and tables?', a: 'AI can misread—confirm against the PDF.' },
      { q: 'English papers?', a: 'Usually fine—verify discipline-specific terms.' },
    ],
  },

  'productivity-pomodoro-timer-online': {
    scenarioLabel: 'Online Pomodoro timer',
    h1: 'Online Pomodoro timer: 25-minute focus',
    seoTitle: 'Pomodoro timer online | RxV',
    metaDescription:
      'Run Pomodoro focus blocks in the browser—25 minutes work plus short breaks to beat procrastination.',
    intro:
      'Pomodoro trades open-ended drift for timed chunks. Tune focus and break lengths, keep the same preset for a week, and pair with a simple task list.',
    situations: ['Remote work and long writing', 'Exam prep and papers', 'Household projects in chunks'],
    faq: [
      { q: 'Must it be 25 minutes?', a: 'No—pick a sustainable preset and review weekly.' },
      { q: 'What to do on breaks?', a: 'Step away from the screen—stretch, water, no doomscroll.' },
      { q: 'Interrupted mid-timer?', a: 'Pause or restart and note what broke focus.' },
    ],
  },
  'productivity-focus-timer-online': {
    scenarioLabel: 'Online focus timer',
    h1: 'Online focus timer for deep work blocks',
    seoTitle: 'Focus timer online | RxV',
    metaDescription:
      'Customize long single-focus sessions with clear breaks—great for coding, writing, and deep reading.',
    intro:
      'If 25 minutes feels short, use longer blocks with planned breaks. Keep one ritual per task type so your brain recognizes “start focus.”',
    situations: ['Debugging and refactors', 'Drafting and brainstorming', 'Parent study time-boxing'],
    faq: [
      { q: 'Different from Pomodoro?', a: 'Pomodoro is a preset cadence; focus timers favor custom lengths.' },
      { q: 'Fullscreen?', a: 'Depends on browser—pin the tab or use a second window.' },
      { q: 'Fatigue in long blocks?', a: 'Add micro-breaks and movement.' },
    ],
  },
  'productivity-pomodoro-50-10': {
    scenarioLabel: '50/10 focus rhythm',
    h1: '50/10 focus: long blocks with short breaks',
    seoTitle: '50 min focus timer | long sessions | RxV',
    metaDescription:
      'Try 50 minutes of focus with 10 minutes off for deep work and long reads—adjust to fit your energy.',
    intro:
      'When 25 minutes feels too choppy, 50/10 keeps momentum while still forcing recovery. Leave screens during breaks.',
    situations: ['Programming deep work', 'Thesis writing and long papers', 'Design and editing flow states'],
    faq: [
      { q: 'Must it be exactly 50?', a: 'Tune freely—consistency matters more than the exact number.' },
      { q: 'What breaks help?', a: 'Movement and hydration beat social feeds.' },
      { q: 'vs 25-minute Pomodoro?', a: 'Choose by task type and how often you lose flow to timers.' },
    ],
  },
};

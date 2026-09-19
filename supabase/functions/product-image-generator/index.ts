// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-rxv-auth-token, x-client-info, apikey, content-type, accept, origin, referer",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_IMAGE_MODEL =
  Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1-mini";
const OPENAI_IMAGE_QUALITY =
  Deno.env.get("OPENAI_IMAGE_QUALITY") || "medium";
const OPENAI_ANALYSIS_MODEL =
  Deno.env.get("OPENAI_ANALYSIS_MODEL") || "gpt-4.1-mini";

const PRODUCT_IMAGE_BUCKET = "product-images";
const PROMPT_VERSION = "ai-commercial-mini-v35-shape-sensitive-food-neck-preserve";

type ProductStyleConfig = {
  title: string;
  points: number;
  commercialLevel: "clean" | "premium" | "social" | "delivery";
  prompt: string;
};

type ProductTypeConfig = {
  label: string;
  mustKeep: string;
  sceneProps: string;
  avoid: string;
};

type ProductImageAnalysis = {
  detectedCategory: string;
  categoryLabel: string;
  confidence: number;
  hasVisibleText: boolean;
  hasVisibleLabelOrSticker: boolean;
  mustPreserve: string[];
  avoid: string[];
  allowedProps: string[];
  forbiddenProps: string[];
  recommendedScene: string;
  sceneDirection: string;
  stylingStrategy: string;
  noTextPolicy: string;
  shortPromptHint: string;
  rawText?: string;
};

/**
 * 商品圖生成風格設定
 * 前端目前 styleId 只會送：white / premium / social / delivery
 * 這裡只負責「圖片要變成什麼商業風格」。促銷活動圖已先下架，不接受 promo。
 */
const STYLE_CONFIG: Record<string, ProductStyleConfig> = {
  white: {
    title: "AI 白底商品圖",
    points: 20000,
    commercialLevel: "clean",
    prompt:
      "Generate an AI white-background ecommerce product image based on the uploaded product photo.\n\nOfficial style goal:\nCreate a clean, bright, professional product listing image suitable for ecommerce, marketplace product pages and product catalogs.\n\nRules:\n- Preserve the core product identity, product category, visible main ingredients, reasonable product count and main structure from the uploaded image.\n- Do not turn the product into a different item, flavor, package, portion or category.\n- Clean up the original phone photo and make the product look neat, clear and ready for online listing.\n- Use a pure white, warm white or very light neutral background.\n- Keep the composition simple, product-centered and highly readable.\n- The product should be large, sharp, centered or naturally arranged, and easy to recognize even as a small thumbnail.\n- A soft natural product shadow is allowed so the image does not look flat.\n- Use almost no props. Only a simple neutral plate or support surface is allowed when necessary for food presentation.\n- Do not add lifestyle props, flowers, extra fruit, extra food, campaign elements, typography, price, logo, watermark or badges.\n- Preserve visible differences between multiple handmade items instead of making them identical.\n- Do not make handmade food overly artificial, plastic-like or too perfect.\n\nFinal target:\nA clean ecommerce white-background product photo that looks professional, clear and commercially usable while still matching the uploaded product.",
  },
  premium: {
    title: "AI 高級商業圖",
    points: 30000,
    commercialLevel: "premium",
    prompt:
      "Generate an AI premium commercial product image based on the uploaded product photo.\n\nOfficial style goal:\nCreate a refined, high-value commercial product photo suitable for official websites, product pages, preorder pages, Google Business photos, brand presentation and marketing drafts.\n\nStyle-only rules:\n- This style controls the commercial mood only: premium lighting, clean composition, tasteful depth, polished surface, professional photography feel and higher perceived product value.\n- Do not decide props from the style alone. Props, surfaces, supporting objects and background details must come from the AI-detected product category rules.\n- Preserve the uploaded product identity, product category, count, package structure, visible ingredients or visible material details.\n- Do not turn the product into another category, flavor, package, portion, model or brand.\n- Make the product visually dominant, sharp, clear, premium and close enough to feel valuable.\n- Use refined commercial lighting, realistic texture, clean shadows and a polished background.\n- Add tasteful category-matched props only when they improve the commercial look. If the detected category is low-confidence, use only universal safe props.\n- Do not add new typography, price, logo, watermark, fake label, fake certification, fake claim, promotional badge or platform badge.\n- If the uploaded product already has label or packaging text, preserve the original-looking label area and visible text as much as possible.\n\nFinal target:\nA premium category-matched commercial product image that looks professionally styled while still matching the uploaded product.",
  },
  social: {
    title: "AI 社群吸睛圖",
    points: 30000,
    commercialLevel: "social",
    prompt:
      "Generate an AI social-media eye-catching product image based on the uploaded product photo.\n\nOfficial style goal:\nCreate a stronger, more memorable, scroll-stopping commercial visual suitable for Facebook, Instagram, Threads, community posts, short-video covers and social sharing.\n\nStyle-only rules:\n- This style controls social appeal only: stronger focal point, warmer or more attractive lighting, richer visual layers, clear brand atmosphere, clean negative space and a more engaging composition.\n- Do not use a default dessert table, beauty table or lifestyle setup for every product. Props must be selected only from the AI-detected product category rules.\n- Preserve the product identity, category, count, package structure, visible ingredients, material and main selling-point features from the uploaded image.\n- Do not turn the product into a different item, flavor, package, portion, model or brand.\n- The product must remain the sharpest, clearest and most visually dominant subject.\n- Leave clean negative space where possible so the user can add social copy later outside the AI image.\n- Avoid empty, flat, overly safe, overly cluttered or misleading composition.\n- Do not add new typography, price, logo, watermark, fake badge or promotional text inside the image.\n- If the uploaded product already has label or packaging text, preserve the original-looking label area and visible text as much as possible.\n\nFinal target:\nA bright, premium, category-matched social product image with stronger visual appeal and clear commercial value.",
  },
  delivery: {
    title: "AI 外送平台主圖",
    points: 30000,
    commercialLevel: "delivery",
    prompt:
      "Generate an AI delivery-platform or marketplace main product image based on the uploaded product photo.\n\nOfficial style goal:\nCreate a clean, clear, mobile-thumbnail-friendly product image suitable for delivery platforms, ecommerce listings, ordering pages, LINE menu images and marketplace thumbnails.\n\nStyle-only rules:\n- This style prioritizes fast recognition, clarity, product focus and mobile readability.\n- Do not automatically use food props. Use food/menu styling only when the AI-detected product category is dessert, drink or food.\n- For non-food products, create a clean marketplace thumbnail with neutral surfaces, simple display, soft shadow and category-matched context only.\n- Preserve product identity, category, count, package structure, visible ingredients or material features.\n- Do not turn the product into a different dish, flavor, package, portion, model or brand.\n- The product should be large, sharp and easy to recognize even when small, usually occupying about 70% to 85% of the image.\n- Use 1 to 3 low-distraction supporting props only when they match the detected category.\n- Avoid rich campaign staging, heavy props, dramatic blur, excessive empty space or anything competing with the product.\n- Do not add new typography, price, logo, watermark, fake label or platform badge.\n- If the uploaded product already has label or packaging text, preserve the original-looking label area and visible text as much as possible.\n\nFinal target:\nA clean platform-ready product image with strong readability and category-correct styling.",
  },
};

/**
 * 商品類型設定
 * 這裡負責「不同商品要放什麼場景／可用什麼道具／不能亂改什麼」。
 * 重點：可美化背景與商業攝影感，但商品本體要跟使用者上傳照一致。
 */
const PRODUCT_TYPE_CONFIG: Record<string, ProductTypeConfig> = {
  dessert: {
    label: "甜點／蛋糕／烘焙商品",
    mustKeep:
      "Keep the exact dessert or baked product identity from the uploaded photo. Preserve the same product count, product type, main shape, camera-facing side, relative size, visible surface features, handmade imperfections, color character and main food details. If the upload shows two egg tarts, keep two egg tarts; preserve the left tart with stronger caramelized brown spots and the right tart with a smoother, lighter custard surface when visible. If the upload shows cake, preserve the slice/cake shape, visible layer count, cream positions, sponge color, topping location and visible filling. Do not turn the product into another flavor, do not add fruit directly onto a product that did not originally have fruit, do not add cream, filling, cut-open sections, sugar powder or toppings that are not in the uploaded product. Do not normalize the product into a generic stock-photo model; keep its real product character. If the uploaded dessert has visible topping pieces or garnish, preserve approximately the same topping count, topping coverage and topping presence. Example: if a mango panna cotta or pudding shows several visible mango cubes on top, keep a similar number of mango cubes rather than reducing them to only one or two pieces. Do not make the topping look sparser than the original unless the original itself is sparse.",
    sceneProps:
      "Suitable premium dessert props: clean white ceramic plate, light cream plate, silver or white dessert fork, beige or ivory linen napkin, cream-white or light marble tabletop, transparent glass cup or crystal goblet in the background, delicate white baby's-breath flowers, warm bakery display atmosphere, soft cream-colored background and gentle sunlight. For strawberry cakes or desserts that already clearly contain strawberries, subtle background-only fresh strawberries are allowed as decorative accents. For egg tarts, bread, plain cakes or desserts without fruit, do not add strawberries or other fruit. Props may appear around the product or behind it only; they must not touch, cover, replace or visually change the product ingredients.",
    avoid:
      "Avoid changing product count, tart/cake layers, surface caramelization pattern, visible topping/filling, flavor, color or product size. Avoid unrelated fruit such as strawberries in egg tart images. Avoid making the dessert too artificial, plastic-like or too perfect. Avoid awkward cropped background props, oversized cups, random tray corners, messy tabletop objects or props that distract from the dessert.",
  },
  drink: {
    label: "飲料／手搖飲／咖啡商品",
    mustKeep:
      "Keep the exact cup or bottle shape, lid, straw, drink color, toppings, ice level and packaging form from the uploaded image. Preserve the visible amount and presence of major toppings such as pearls, foam, fruit pieces, whipped topping or garnish. Do not materially reduce topping quantity when the original clearly shows those toppings. Do not change the flavor, cup type or drink color. If the uploaded drink cup already has a visible label, sticker, printed logo or readable text, preserve its original-looking label/text area as much as possible. If the uploaded drink cup is plain with no visible label/text, do not add any new sticker, cup label, front label, brand name, readable words, printed text or placeholder text such as BUBBLE TEA.",
    sceneProps:
      "Suitable premium drink props: clean cafe counter, light marble tabletop, cup mat or coaster, neutral linen napkin, transparent ice cubes nearby when appropriate, subtle condensation droplets, soft sunlight, refreshing cafe atmosphere, clean tray, and related ingredient accents only when they match the original drink. For bubble tea, tapioca pearls may appear as subtle secondary background accents only if the original drink clearly contains pearls. These are non-text props only and must not create any new cup sticker, label, printed brand name or readable text.",
    avoid:
      "Avoid adding unrelated fruit or changing the drink into another flavor. Do not invent brand labels, logos, cup stickers, front labels, printed text or readable words. Do not make the no-text rule remove useful non-text commercial props such as coaster, ice, condensation, tray, cafe counter or neutral napkin.",
  },
  food: {
    label: "餐點／便當／小吃商品",
    mustKeep:
      "Keep the exact main dish, ingredients, plating, portion structure, sauce position and visible food details from the uploaded image. Preserve the visible amount of key toppings, garnish and major food pieces when they are part of the dish identity. For fried, braised, grilled or cooked meat, preserve the real food cut / body part identity, piece count, original piece arrangement, piece contour, piece shape, length, thickness, curved form, irregular edges, bone-joint structure, skin/crust texture and relative size. Use conservative retouching for meat pieces: improve lighting, background and appetizing color, but keep the uploaded piece silhouettes and layout close to the source image. Do not standardize irregular meat pieces into generic fried chicken, chicken nuggets, drumsticks, wings, boneless strips, tenders or a more familiar meat shape. If the original looks like chicken neck, duck neck, chicken feet, wing tip, ribs, bone-in snack, braised meat pieces or irregular off-cut food, keep that distinctive shape and do not transform it into small chicken legs, sausages, sausage loops or smooth uniform curved tubes. Preserve neck-like pieces as thinner, uneven, segmented, irregular, jointed neck-like pieces instead of plump rounded meat logs. Do not replace ingredients or invent a different meal.",
    sceneProps:
      "Suitable premium props: clean plate or tray, wooden table, soft restaurant lighting, small side utensils, neutral food photography background, subtle steam only when appropriate.",
    avoid:
      "Avoid changing the dish type, ingredients, portion quantity, meat cut, bone structure, piece count, piece size, piece shape or plating identity. Do not add unrelated garnish directly on the food. Avoid making irregular bone-in cooked meat look like generic fried chicken drumsticks, boneless chicken nuggets, wings, tenders, sausage-like loops or uniform stock-photo meat pieces.",
  },
  beauty: {
    label: "美業／保養／美容商品或作品",
    mustKeep:
      "Keep the exact product packaging, bottle shape, cap, texture, color, treatment result or service subject from the uploaded image. Do not invent logos or change package structure.",
    sceneProps:
      "Suitable premium props: clean vanity surface, soft fabric, mirror reflection, cosmetic tray, spa-like lighting, elegant neutral background, subtle highlights.",
    avoid:
      "Avoid changing labels, skin result, product material, logo or package color. Do not add medical claims or before-after text.",
  },
  perfume_bottle: {
    label: "香水／保養品／瓶罐商品",
    mustKeep:
      "Keep the exact bottle, jar, tube, box or cosmetic package identity from the uploaded image. Preserve the bottle/body proportion, height-to-width ratio, cap height, cap color, glass thickness feeling, glass transparency, label position, label area, packaging structure, material, color, liquid tone and visible product silhouette. Do not stretch a short bottle into a tall bottle, do not turn a square bottle into a round bottle, and do not make the cap larger or smaller than the original proportion. If the original label contains visible text, preserving the original label area and original-looking text is higher priority than decorative perfection. Do not invent a different brand name, slogan, claim or readable marketing text.",
    sceneProps:
      "Suitable premium props for perfume, skincare and cosmetic bottles: cream-white or warm beige background, soft linen or silk fabric, light marble-like surface, elegant vanity tabletop, subtle acrylic display block, frosted glass block, soft mirror reflection, boutique cosmetic-display lighting, gentle highlights, clean soft shadow and very small neutral white flowers placed only in the far background. Use luxury cosmetic / fragrance / boutique display styling. Do not use dining-table styling.",
    avoid:
      "Avoid plates, bowls, saucers, forks, spoons, knives, fruit, strawberries, desserts, food, drinks, tea glasses, drink cups, dining props, bakery props, oversized decorative props, flowers that strongly imply a new scent, fake readable brand text, fake labels, fake certification marks, blanking or removing the original product label text when it is visible, changing the bottle ratio, changing cap shape, changing package color, or making the product look like a different perfume/cosmetic item.",
  },
  fashion: {
    label: "服飾／包包／鞋款商品",
    mustKeep:
      "Keep the exact clothing, bag, shoe or wearable product type, silhouette, material, color, pattern, hardware, logo area, strap position, zipper/button details and visible structure from the uploaded image.",
    sceneProps:
      "Suitable premium props: clean studio backdrop, neutral fabric, hanger, simple display stand, boutique tabletop, soft shadow, elegant minimal lifestyle scene related to fashion.",
    avoid:
      "Avoid changing the product color, pattern, size, shape, material, hardware, logo, strap design or turning it into another fashion item. Do not invent brand labels or fake model usage claims.",
  },
  electronics: {
    label: "3C／生活用品／家電商品",
    mustKeep:
      "Keep the exact device or household product shape, screen, buttons, ports, package, model silhouette, color, functional parts and included accessories visible in the uploaded image.",
    sceneProps:
      "Suitable premium props: clean desk, minimal studio background, soft product shadow, neutral modern tabletop, simple home or workspace context related to the product use.",
    avoid:
      "Avoid changing the device model, button layout, screen content, cable/port position, package text, included accessories, brand, color or product function. Do not invent certification labels or fake UI text.",
  },
  accessory: {
    label: "飾品／手作品／小物商品",
    mustKeep:
      "Keep the exact accessory shape, material, color, gem or bead structure, metal finish, handmade details and product quantity from the uploaded image.",
    sceneProps:
      "Suitable premium props: velvet cloth, marble surface, jewelry tray, soft spotlight, gentle shadow, elegant minimal background, gift-box atmosphere.",
    avoid:
      "Avoid changing the jewelry design, stone shape, material, metal color, quantity or handmade structure.",
  },
  shopee: {
    label: "蝦皮／電商一般商品",
    mustKeep:
      "Keep the exact product shape, package, color, label position, material, function parts and visible details from the uploaded image. The buyer should recognize it as the same product.",
    sceneProps:
      "Suitable premium props: clean studio background, light tabletop, soft shadow, product-centered composition, minimal lifestyle context related to the product use.",
    avoid:
      "Avoid changing the brand, package text, function, product model, quantity, color or accessories. Do not invent certification marks or labels.",
  },
  other: {
    label: "一般商品",
    mustKeep:
      "Keep the exact product identity, shape, color, material, quantity, packaging, visible details and main selling-point features from the uploaded image.",
    sceneProps:
      "Suitable premium props: clean tabletop, subtle lifestyle background, professional lighting, soft shadow, depth of field and tasteful context related to the product.",
    avoid:
      "Avoid changing product type, color, material, packaging, logo, quantity, model or important details.",
  },
};

// 舊前端可能送 PRODUCT_TYPE_LABELS 的 key，保留相容性。
const PRODUCT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_TYPE_CONFIG).map(([key, value]) => [key, value.label])
);

const STRICT_PRODUCT_FIDELITY_RULE = `Official product fidelity and commercial-use rule:
- This is an AI commercial product image improvement service, not a legally guaranteed exact documentary product photo.
- Use the uploaded image as the main reference and preserve the product category, main shape, visible main ingredients, reasonable product count and recognizable features.
- The AI may improve lighting, background, commercial composition, surface, display plate, props and overall atmosphere.
- Do not create a different product, different flavor, wrong package, wrong portion, fake ingredient or misleading included item.
- Do not add new text, price, watermark, fake logo, fake label, fake certification, fake award, fake claim, fake platform badge, product sticker, cup sticker, front label or readable words. If the uploaded product already contains visible label text, sticker text or packaging text, preserve the original label/text area as much as possible and do not remove it. If the uploaded product has no visible text or label/sticker, keep it plain and text-free. Do not invent a different brand name, slogan, claim or readable fake text.
- Do not add unrelated ingredients, fruit, toppings, cut-open sections or flavor cues that could make the product look like another item.
- Styling props are allowed only when they support the selected style and stay secondary to the product.
- The product should be the clearest, sharpest and most visually dominant subject.
- If exact product structure, exact label, exact packaging, exact ingredient count or legal-use accuracy is required, offer human retouching after AI generation.`;


const MINI_FIDELITY_ESCALATION_RULE = `OpenAI mini commercial draft rule:
- Prioritize a beautiful and useful commercial product image that can help the user test marketing value.
- Keep the product broadly recognizable from the uploaded photo.
- Avoid fake text, fake labels, misleading claims, unrelated ingredients and decorations that could cause advertising misunderstanding. Preserve original visible product label text when present, but do not invent new readable text.
- Make the result suitable for social posts, preorder pages, product display, Google Business photos or marketing drafts.
- Do not promise perfect product fidelity. The website can provide free or paid human retouching when the user needs closer adjustment.`;

const MESSY_SHOP_PHOTO_CLEANUP_RULE = `Messy shop-photo improvement rule:
- The uploaded image may be a casual phone photo with clutter, poor lighting, messy tabletop, metal tray, kitchen work surface, harsh reflections, plastic packaging or awkward camera angle.
- Clean up the scene and improve the commercial presentation when helpful.
- Use better lighting, improved framing, cleaner background, nicer display surface, more attractive plate or tasteful props according to the selected style.
- If the product placement is messy, you may recompose the product into a more attractive arrangement only when this does not change the product identity.
- For fried, braised, grilled or cooked meat, bone-in snacks, chicken neck, chicken feet, wing tips, ribs, cartilage or irregular savory foods, do not recompose pieces into a generic stock-photo pile. Keep the original piece arrangement, count and silhouettes closer to the uploaded image.
- Keep the main product related to the upload and avoid creating a different product.`;

const PROP_AND_FOCUS_RULE = `Prop and focus rule:
- Props do not need to be all blurred. Nearby styling props may remain reasonably sharp when they are part of the commercial styling.
- Far-background props may have soft natural bokeh.
- The product must remain the sharpest, clearest and most visually dominant subject.
- Props must never imply a different flavor, different ingredient, larger portion, fake included item or false product content.
- Props, accessories, display surfaces and background objects must match the detected product category.
- Do not borrow props from another category. For example, do not use dessert props for perfume, do not use cosmetic props for food, and do not use food ingredients for electronics.
- When the category is uncertain, use only neutral universal commercial props and avoid strong category-specific props.`;

const UNIVERSAL_SAFE_PROP_RULE = `Universal safe prop rule:
- If the product category is unclear, low-confidence, mixed, or not strongly tied to a specific scene, use only neutral, versatile, commercially safe props.
- Suitable universal props include cream-white background, light beige background, warm white tabletop, light marble-like surface, clean neutral fabric, soft linen, subtle glass object, simple acrylic block, frosted glass block, small neutral display block, soft shadow, gentle natural light, and minimal white flowers placed far from the product only when they do not imply a scent, flavor or ingredient.
- Universal props must stay visually secondary and must not overpower, cover, touch, replace or visually change the product.
- Do not use strong category-specific props unless the uploaded product clearly belongs to that category.
- Strong category-specific props to avoid when uncertain: strawberries, lemon slices, fruit, desserts, crumbs, forks, spoons, knives, straws, ice cubes, cosmetic brushes, jewelry boxes, food ingredients, sauce dishes, certification badges, newly invented readable labels, fake brand text, or platform badges.
- When uncertain, prefer fewer props, cleaner composition and stronger product focus rather than decorative but wrong styling.`;

const ORIGINAL_LABEL_TEXT_RULE = `Original product label text rule:
- If the uploaded product already has visible label text, packaging text, logo-like text, sticker text or a brand placeholder on the bottle/package/cup, preserve the same label area and original-looking text as much as possible.
- If the uploaded product does not have visible label text, packaging text, logo-like text, sticker text or a brand placeholder, do not add any new label, sticker, cup label, front label, readable text, brand name, slogan, price or printed words.
- Do not erase an existing product label just because the prompt says no new text. The no-text rule means no added advertising text, price, watermark, fake claim or new brand text.
- Do not replace the original label with a different invented brand name, different slogan, different claim, fake certification or unrelated readable text.
- If the exact small text cannot be reproduced, keep the label area visually similar and softly readable/neutral, rather than making it blank or changing the product identity.`;

const LABEL_TEXT_PRIORITY_RULE = `Label preservation priority rule:
- This rule applies only when the original uploaded image already contains visible text, a printed label, a package label, a sticker, logo-like text or a brand placeholder.
- If the uploaded product has readable label text, packaging text or a brand placeholder, preserving that text is higher priority than decorative perfection.
- Do not simplify an existing label into a blank box.
- Do not replace the wording with another invented brand, slogan, claim or random text.
- Keep the label position, approximate line structure, alignment and visual balance similar to the original whenever possible.
- If the exact tiny wording cannot be perfectly reproduced, keep it visually close and product-consistent rather than empty.
- If the original uploaded product does not have visible text or a label/sticker, do not create a new label, sticker, cup label, printed text or readable words.`;

const STRICT_NO_INVENTED_TEXT_OR_STICKER_RULE = `Strict no-invented-text / no-new-sticker rule:
- Never create new readable text, product names, brand names, slogans, price tags, promo words, labels, stickers, cup stickers, front labels, badges, signs or package printing that were not already visible in the uploaded image.
- For plain drink cups, plain bottles, plain packages or products without visible text, keep the surface plain. Do not add "BUBBLE TEA", "COFFEE", "MILK TEA", "YOUR BRAND", "NEW", "SALE" or any other readable words.
- If the original product already has a label or readable text, preserve it as close as possible, but do not replace it with a different invented text.
- This rule only blocks invented text, labels and stickers. It does not block non-text decorative props such as ice cubes, condensation, coaster, clean tray, neutral napkin, acrylic block, display stand, fabric, flowers, shadow or cafe tabletop when they match the product category.
- This rule overrides all style, category, social, premium and marketplace instructions when there is any conflict about text or labels.`;

const VISIBLE_TOPPING_AND_COUNT_RULE = `Visible topping / ingredient-count preservation rule:
- Preserve the visible amount, count and presence of major toppings, garnish and key ingredient pieces when they are clearly shown in the uploaded product.
- Do not materially reduce, simplify or remove major visible toppings just to make the image look cleaner.
- If the original dessert or drink shows multiple visible fruit cubes, pearls, topping pieces, garnish or ice pieces, keep approximately the same visual richness and count.
- Example: if the original mango pudding or panna cotta shows several mango cubes on top, keep a similar number of visible mango cubes in the generated image instead of only one or two pieces.
- Example: if the original bubble tea clearly shows a dense layer of pearls, keep a similar pearl presence rather than making the cup look sparsely filled.
- Preserve topping placement logic: top toppings stay on top, layered toppings stay layered, side garnish stays secondary.
- Do not add new topping types that were not visible in the original upload.
- For food and dessert, commercial styling may improve neatness, but not at the cost of making the product look less generous than the original.`;

const MEAT_CUT_AND_BODY_PART_PRESERVATION_RULE = `Meat cut / cooked-food body-part preservation rule:
- For fried, braised, grilled, roasted or cooked meat products, preserving the real food cut / body part identity is more important than making the food look like a familiar stock-photo fried chicken item.
- Preserve piece count, major piece arrangement, length-to-width ratio, thickness, curved or bent shape, irregular edges, bone/joint hints, skin folds, crust bumps, sauce/coating texture and visible cut-specific features.
- Do not transform chicken neck, chicken feet, wing tips, ribs, cartilage, bone-in snacks, braised meat pieces or irregular off-cut foods into drumsticks, small chicken legs, boneless nuggets, tenders, generic fried chicken strips or more common meat shapes.
- If the original pieces are thin, curved, knobby, segmented, uneven or bone-like, keep those proportions and irregular features. Do not make every piece plump, oval, uniform or drumstick-shaped.
- Commercial styling may improve color, crispness, lighting, plate, surface and background, but it must not change the recognisable meat cut or body part.
- If the AI is uncertain whether a cooked meat item is drumstick, wing, neck, rib, chicken feet or another bone-in cut, use a conservative preservation strategy: copy the uploaded shapes and arrangement more closely, use fewer invented meat shapes, and avoid standardizing the pieces.`;

const SHAPE_SENSITIVE_FOOD_CONSERVATIVE_RETOUCH_RULE = `Shape-sensitive food conservative retouch rule:
- Some foods are visually identified mainly by their irregular shape, not by generic category. This includes chicken neck, chicken feet, wing tips, ribs, cartilage, duck neck, braised off-cuts, fried off-cuts, fried fish pieces, irregular meat pieces, handmade snacks and chopped savory foods.
- For these foods, use CONSERVATIVE RETOUCH mode: keep the original plate arrangement, number of pieces, major silhouettes, long/curved/knobby shapes, holes, bone-joint hints, uneven edges and relative sizes as close as possible.
- Do not recompose the food into a cleaner stock-photo pile if doing so changes the piece identity.
- Do not replace irregular pieces with more appetizing but wrong shapes.
- Do not create plump oval fried pieces, drumstick-like pieces, chicken leg shapes, nuggets, tenders, wings or uniform meat strips unless the original upload clearly shows that exact cut.
- Background, plate, surface, light, color temperature, shadows and crispness may be improved, but the edible pieces themselves should remain source-faithful.
- If the model is uncertain whether the meat is chicken neck, drumstick, wing, rib or another cut, choose the safest option: preserve the uploaded contours and irregular arrangement instead of inventing a standard chicken shape.
- For shape-sensitive food, exact product identity is more important than premium styling.`;

const CHICKEN_NECK_EXTREME_PRESERVATION_RULE = `Chicken-neck / irregular off-cut extreme preservation rule:
- When the uploaded food appears to be chicken neck, duck neck or another long narrow irregular off-cut, preserve that exact neck-like identity above all else.
- Preserve long narrow bent contours, uneven thickness, joint-like bulges, segmented structure, pointed or tapered ends, bony bends, open inner gaps and non-uniform fried texture.
- Do not thicken the pieces into plump rounded tubes.
- Do not smooth the pieces into sausage-like curves, closed loops, meat logs or polished uniform arcs.
- Do not reinterpret the food as sausage, bratwurst, hot dog, generic fried chicken, chicken tenders or drumsticks.
- If uncertain, copy the source piece geometry more literally and reduce styling intensity rather than inventing a prettier but wrong food shape.`;



const AI_DYNAMIC_SCENE_STRATEGY_RULE = `Universal AI scene-strategy rule:
- Do not rely only on hard-coded category examples. Use the AI product analysis result as the primary scene planner for this specific uploaded product.
- The analysis provides mustPreserve, avoid, allowedProps, forbiddenProps, sceneDirection, stylingStrategy and noTextPolicy. Follow those fields before generic style decoration.
- The style controls the output purpose; the AI analysis controls the product-safe props and scene. This allows the tool to work across drinks, desserts, foods, cosmetics, accessories, electronics, household goods, packages and unknown products.
- If the analysis says no visible text or no label/sticker, keep the product surface text-free, but still allow non-text commercial props that are explicitly allowed or category-safe.
- If the analysis confidence is low, use fewer props and choose universal safe props only.
- Never let a rule for one product category override the actual detected product. For example, do not apply perfume props to drinks, food props to perfume, or dessert fruit props to plain bakery items.`;

const CATEGORY_MATCHED_PROP_RULE = `Category-matched prop rule:
- Choose props by detected product category, not by general beauty, dessert or social aesthetics.
- Dessert / bakery: clean plate, cake stand, dessert fork, napkin, baking paper, warm bakery tabletop, same-ingredient background accents only when those ingredients already exist in the uploaded product.
- Drink / coffee / hand-shaken beverage: cup mat, clean counter, cafe tabletop, condensation, ice only when suitable, straw only if already present or natural to the drink, related ingredient accents only when they match the drink.
- Meal / bento / savory food: plate, tray, chopsticks, simple utensil, wooden table, restaurant lighting, subtle steam only when appropriate. For fried/braised/grilled cooked meat, keep the original meat cut shape, piece count, contours and arrangement; do not standardize it into drumsticks, nuggets, tenders, wings, strips or generic fried chicken.
- Perfume / skincare / cosmetics / bottle products: vanity surface, cream fabric, silk/linen fabric, acrylic block, frosted glass block, mirror reflection, marble-like surface, boutique cosmetic display, soft shadow, very small neutral white flowers in the far background only. Do not use glass cups, tea glasses, plates, saucers, bowls, forks, spoons, knives or dining-table objects.
- Accessories / jewelry / handmade items: velvet cloth, jewelry tray, display block, gift-like neutral background, soft spotlight, elegant shadow.
- Fashion / bag / shoes: clean studio backdrop, neutral fabric, boutique display surface, hanger or simple stand only when appropriate, soft shadow.
- Electronics / home goods: clean desk, modern neutral tabletop, simple workspace or home-use context, soft product shadow. Do not use food styling or beauty props.
- General ecommerce products: clean studio background, neutral tabletop, simple product-centered layout, soft shadow and minimal same-category context.
- Never mix food-table props into perfume/cosmetic/bottle products. Never mix cosmetic tools into food products. Never mix jewelry props into electronics. Never add props that imply a different product, ingredient, included item, scent, flavor or function.
- If the category is uncertain, use the universal safe prop rule only and keep props minimal.`;


const WHITE_BACKGROUND_RULE = `White-background ecommerce rule:
- Keep the composition simple, clean and product-centered.
- Do not create a lifestyle scene.
- Do not add flowers, fruits, extra utensils, extra food, decorative background objects or campaign props.
- The product should be large and clearly readable as a product listing image.
- Preserve visible differences between multiple items, such as one egg tart having stronger caramel spots and the other having a smoother custard surface.
- Avoid turning handmade food into an overly perfect stock-photo model.`;

const PREMIUM_DECORATION_RULE = `Premium commercial styling rule:
- The image should not look like only a background replacement.
- Use refined commercial lighting, cleaner composition and tasteful category-matched props to create value.
- The scene should feel like a professional product photoshoot, not a casual phone photo.
- Use enough decoration to add visual layers, but keep the product dominant.
- Props must be selected according to the detected product category, not from a generic dessert table.
- For desserts or food, suitable props may include a clean plate, neutral napkin, appropriate utensil, related drink cup, light tabletop or subtle same-ingredient background accent when it already belongs to the product.
- For perfume, skincare, cosmetics, bottle or package products, suitable props may include cream fabric, light marble-like surface, subtle mirror reflection, neutral vanity surface, acrylic display block, frosted glass block, silk/linen fabric, soft shadow and very small neutral white flowers placed behind the product. Do not use plates, bowls, saucers, forks, spoons, knives, fruit, desserts, food props, tea glasses, drink cups or dining-table styling.
- For accessories or jewelry, suitable props may include velvet cloth, marble surface, jewelry tray, display block, soft spotlight and gift-like neutral background. Do not use food or drink props.
- For electronics or household products, suitable props may include clean desk, modern neutral tabletop, soft shadow and simple home/workspace context. Do not use food styling or beauty props.
- If the detected category is unclear or confidence is low, use the universal safe prop rule only.
- Avoid awkward cropped props, random wooden board corners, oversized drinks or props that look accidentally placed.
- Keep the product large and close enough to feel valuable, not small in a wide empty scene.`;


const PREMIUM_DESSERT_REFERENCE_RULE = `Elegant dessert commercial reference direction:
- Aim for the polished feeling of a high-end commercial dessert photo: bright marble-like surface, clean white plate, delicate small white flowers, crystal goblet softly placed in the background, ivory napkin and silver fork.
- Use this as a styling direction only; do not copy unrelated ingredients onto products that do not contain them.
- For strawberry shortcake, highlight glossy whole strawberry topping, smooth white cream, soft sponge texture and visible sliced strawberries in the cream layer.
- For egg tart, use the same premium lighting and props but do not add strawberries, cream, flowers touching the tart, fruit filling or cake-like elements.
- The final image should feel elegant, bright, appetizing, luxurious and suitable for a paid commercial product image sample.`;

const PREMIUM_PERFUME_REFERENCE_RULE = `Elegant perfume / skincare commercial reference direction:
- Aim for a refined luxury perfume, skincare or cosmetic campaign feeling.
- Use a clean boutique-style composition with cream-white or warm beige palette, soft luxury lighting, minimal props and a premium cosmetic-display mood.
- Suitable scene elements: subtle acrylic display block, frosted glass block, marble-like surface, elegant neutral fabric, soft shadow, faint mirror reflection, blurred boutique glass object in the background, and very small white flowers only as distant background accents.
- Do not use plates, bowls, saucers, forks, spoons, knives, food props, fruit, desserts, drinks, tea glasses, dining-table styling or anything that makes the product look like food.
- Keep the bottle/package visually dominant, clean, premium and close enough to feel valuable.
- Preserve the uploaded bottle proportion, cap ratio, glass material, package color and original label area.
- If readable label text exists in the upload, preserve the same wording and structure as much as possible instead of making the label blank or replacing it with a different invented brand.`;

const SOCIAL_RICH_SCENE_RULE = `Social eye-catching rule:
- Do not make the image look like a plain product catalog photo.
- Add more visual layers, brand atmosphere, stronger composition, warm lighting, depth, color harmony, clean negative space and a scroll-stopping focal point, while keeping the product as the main subject.
- All props must match the detected product category. Do not use a default food / dessert table setup for non-food products.
- The scene should feel suitable for IG, Facebook, Threads, short-video covers and community sharing.
- Avoid empty, flat, overly clean, overly safe or cluttered composition.
- Do not add text or promotional words; social copy should be added outside the image.`;

const SOCIAL_PERFUME_REFERENCE_RULE = `Social perfume / skincare scroll-stopping rule:
- For perfume, skincare, cosmetics and bottle products in social style, create a luxury beauty social visual, not a dessert-table or dining-table image.
- Use soft luxury light, cream-white / beige palette, silk or linen folds, acrylic display block, frosted glass block, subtle mirror reflection, marble-like surface, soft glow, elegant shadow, small white flowers placed only in the far background and clean negative space for later social text overlay.
- Make the bottle/package visually dominant, close, sharp, premium and suitable for a high-end brand social post or short-video cover.
- Do not use plates, bowls, saucers, forks, spoons, knives, food props, fruit, strawberries, desserts, drinks, tea glasses, drink cups, cafe table styling or dining composition.
- Preserve the original bottle/package proportion, cap ratio, label area and visible original-looking label text as much as possible.`;

const SOCIAL_DESSERT_REFERENCE_RULE = `Social dessert / food scroll-stopping rule:
- For dessert, bakery, drink and food products in social style, emphasize appetite, freshness, texture, warm light and a richer lifestyle feeling.
- Food props are allowed only when they match the uploaded product category and do not imply a different flavor, ingredient, larger portion or included item.
- For desserts without fruit, do not add fruit. For strawberry desserts, background strawberries are allowed only as secondary accents.`;

const SOCIAL_DRINK_REFERENCE_RULE = `Social drink / coffee scroll-stopping rule:
- For drink, hand-shaken beverage, tea and coffee products in social style, emphasize refreshment, cup clarity, drink color, label visibility, condensation or light ice only when appropriate, and a clean cafe or counter atmosphere.
- Use only drink-related props such as cup mat, clean counter, subtle ice, straw if natural to the product, and ingredient accents only when they match the drink.
- Do not add unrelated desserts, perfume props, cosmetic tools, jewelry props, fake labels, cup stickers, front labels, readable words or unrelated fruit.
- If the original drink cup is plain, keep the cup plain; do not add BUBBLE TEA, COFFEE, MILK TEA or any invented wording.`;

const SOCIAL_ACCESSORY_REFERENCE_RULE = `Social accessory / jewelry scroll-stopping rule:
- For accessories, jewelry and handmade items in social style, emphasize material texture, sparkle, craft detail, elegant shadow, boutique display and gift-like atmosphere.
- Use velvet cloth, display block, marble surface, jewelry tray, soft spotlight or neutral gift-like background only.
- Do not use food props, drink props, beauty bottles, cosmetic brushes, fake brand marks or props that imply a different material or quantity.`;

const SOCIAL_ELECTRONICS_REFERENCE_RULE = `Social electronics / home goods scroll-stopping rule:
- For electronics, appliances and household products in social style, emphasize clean modern usability, product function clarity, neat desk or home context, soft shadow and practical lifestyle atmosphere.
- Use modern tabletop, clean workspace, simple home setting or neutral studio display only.
- Do not use food styling, perfume props, jewelry props, cosmetic props, fake UI text, fake certification badges or misleading function indicators.`;

const PREMIUM_DRINK_REFERENCE_RULE = `Premium drink / coffee commercial reference direction:
- For drink, hand-shaken beverage, tea and coffee products in premium style, make the cup look fresh, clean, clear and professionally photographed.
- Preserve cup shape, lid, straw, drink color, ice level, toppings, pearls and packaging form.
- Add category-matched visual richness without adding text: clean cafe counter, light marble tabletop, coaster, neutral napkin, transparent ice cubes, subtle condensation, soft sunlight, refreshing background, clean tray and cafe atmosphere.
- For bubble tea, preserve tapioca pearls and drink color. Tapioca pearls may appear as subtle secondary background accents only when the original drink contains pearls.
- If the original cup has no visible label or text, keep the cup plain. Do not add BUBBLE TEA, MILK TEA, COFFEE, brand name, cup sticker, front label or any readable words.
- Do not change flavor, cup type, drink color, toppings or brand identity.`;

const PREMIUM_ACCESSORY_REFERENCE_RULE = `Premium accessory / jewelry commercial reference direction:
- For accessories, jewelry and handmade items in premium style, create a refined boutique product photo with elegant material detail, soft spotlight, velvet or marble surface and clean display composition.
- Preserve product quantity, shape, material, gemstone/bead structure, metal color and handmade details.
- Do not change the design, material, metal color, gem shape, quantity or add fake brand/certification marks.`;

const PREMIUM_ELECTRONICS_REFERENCE_RULE = `Premium electronics / home goods commercial reference direction:
- For electronics, appliances and household products in premium style, create a clean modern product-display image with neutral desk, simple home/workspace context, soft shadow and clear functional parts.
- Preserve device shape, buttons, ports, screen, package, model silhouette, included accessories and visible structure.
- Do not change model, layout, function, screen content, cable/port position, package text, certifications or included accessories.`;

const DELIVERY_FOOD_REFERENCE_RULE = `Delivery food / drink platform rule:
- For dessert, drink and food products in delivery style, prioritize appetite appeal, clarity, portion readability and mobile ordering usefulness.
- Use simple food-appropriate props only: clean plate, tray, napkin, utensil, cup or tabletop when appropriate.
- Do not imply a larger portion, different flavor, extra included item or unrelated ingredient. For cooked meat products, do not change the visible cut/body-part identity or turn irregular bone-in pieces into drumsticks, nuggets or generic fried chicken.`;

const DELIVERY_NON_FOOD_REFERENCE_RULE = `Delivery / marketplace non-food thumbnail rule:
- For non-food products in delivery or marketplace style, do not create a food menu image.
- Use a clean product-centered marketplace thumbnail with neutral background, simple surface, soft shadow and category-matched minimal props.
- Preserve product model, package, label area, material, quantity, function parts and visible details.
- Do not use plates, utensils, food, fruit, drinks or dining-table composition.`;

const DELIVERY_THUMBNAIL_RULE = `Delivery platform rule:
- Prioritize clarity and appetite appeal over decoration.
- The product must be readable as a small mobile thumbnail.
- Use light decoration only: usually 1 to 3 clean supporting props such as plate, napkin, small utensil, drink cup or simple tabletop element.
- Props are allowed to make the food look more attractive, but the image must remain simpler than premium, social and promo styles.
- Avoid a scene that looks too artistic, too lifestyle-oriented, too decorative or too empty for a menu image.
- The final image should look like a clean food-ordering menu photo with slight commercial styling, not a brand campaign photo.`;

const PROMO_TEXT_SPACE_RULE = `Promo campaign rule:
- Create a more festive and marketing-oriented image than premium style.
- Leave clean negative space for later text overlay by Canva, website editor or frontend canvas.
- Do not generate text, prices, discounts, badges or labels directly in the AI image because AI text may be wrong.
- The image should feel suitable for limited-time offers, preorder campaigns, new launches, seasonal promotions and sale posts.
- Use visual energy, color accents and tasteful campaign mood, but do not make the product misleading.`;

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getBearerToken(req: Request) {
  const rxvToken =
    req.headers.get("x-rxv-auth-token") ||
    req.headers.get("X-Rxv-Auth-Token") ||
    "";
  if (rxvToken.trim()) return rxvToken.trim();

  const authHeader = req.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

async function hashSessionToken(token: string) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getUserIdFromSession(req: Request, supabaseAdmin: any) {
  const token = getBearerToken(req);
  if (!token) return null;

  const tokenHash = await hashSessionToken(token);
  const { data, error } = await supabaseAdmin
    .from("user_sessions")
    .select("user_id, expires_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data?.user_id) {
    if (error) console.error("Session verify error:", error);
    return null;
  }

  return String(data.user_id);
}

function extractBase64FromDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("圖片格式錯誤，無法解析 data URL。");
  }

  return {
    mimeType: match[1],
    base64Data: match[2],
  };
}

function base64ToBytes(base64: string) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function getExtByMime(mimeType: string) {
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "png";
}

function mapRatioToSize(outputRatio: string) {
  switch (outputRatio) {
    case "4:5":
    case "9:16":
      return "1024x1536";
    case "16:9":
      return "1536x1024";
    case "1:1":
    default:
      return "1024x1024";
  }
}


const CATEGORY_ALIASES: Record<string, string> = {
  dessert: "dessert",
  cake: "dessert",
  bakery: "dessert",
  egg_tart: "dessert",
  drink: "drink",
  beverage: "drink",
  coffee: "drink",
  tea: "drink",
  meal: "food",
  food: "food",
  fried_food: "food",
  fried_chicken: "food",
  braised_food: "food",
  braised_meat: "food",
  bone_in_meat: "food",
  chicken_neck: "food",
  chicken_wing: "food",
  chicken_feet: "food",
  meat_cut: "food",
  bento: "food",
  perfume: "perfume_bottle",
  perfume_bottle: "perfume_bottle",
  fragrance: "perfume_bottle",
  cosmetic: "perfume_bottle",
  cosmetics: "perfume_bottle",
  skincare: "perfume_bottle",
  bottle: "perfume_bottle",
  jar: "perfume_bottle",
  beauty: "beauty",
  accessory: "accessory",
  jewelry: "accessory",
  handmade: "accessory",
  fashion: "fashion",
  clothing: "fashion",
  bag: "fashion",
  shoes: "fashion",
  electronics: "electronics",
  device: "electronics",
  appliance: "electronics",
  ecommerce: "shopee",
  shopee: "shopee",
  other: "other",
};

function normalizeProductCategory(raw: any, fallback = "other") {
  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const normalized = CATEGORY_ALIASES[key] || key;
  return PRODUCT_TYPE_CONFIG[normalized] ? normalized : fallback;
}

function normalizeStringList(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 12);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,，、;；]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  return [];
}

function fallbackProductAnalysis(fallbackCategory = "other", rawText = ""): ProductImageAnalysis {
  const detectedCategory = normalizeProductCategory(fallbackCategory, "other");
  const config = PRODUCT_TYPE_CONFIG[detectedCategory] || PRODUCT_TYPE_CONFIG.other;
  return {
    detectedCategory,
    categoryLabel: config.label,
    confidence: 0,
    hasVisibleText: false,
    hasVisibleLabelOrSticker: false,
    mustPreserve: ["商品主體", "外觀比例", "主要顏色", "包裝或材質特徵"],
    avoid: ["錯誤品類", "不相關道具", "可讀假文字", "假品牌或標籤"],
    allowedProps: ["乾淨淺色背景", "柔和光線", "中性布料", "簡單展示面", "柔和陰影"],
    forbiddenProps: ["新增文字", "新標籤", "錯誤品類道具", "誤導性配件"],
    recommendedScene: "乾淨商業背景、柔和光線、商品主體清楚",
    sceneDirection: "依商品實際類型使用安全商業場景",
    stylingStrategy: "提升光線、背景、構圖與商業質感，避免改變商品本體",
    noTextPolicy: "如果原圖沒有文字或標籤，不新增任何可讀文字或貼紙。",
    shortPromptHint: "Keep the product recognizable and do not add misleading props or fake text.",
    rawText,
  };
}

function extractResponseOutputText(data: any): string {
  if (typeof data?.output_text === "string") return data.output_text;

  const parts: string[] = [];
  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const block of content) {
      if (typeof block?.text === "string") parts.push(block.text);
      if (typeof block?.output_text === "string") parts.push(block.output_text);
    }
  }
  return parts.join("\n").trim();
}

function parseProductAnalysis(text: string, fallbackCategory = "other"): ProductImageAnalysis {
  const raw = String(text || "").trim();
  const jsonText = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonText);
    const detectedCategory = normalizeProductCategory(parsed?.detectedCategory, fallbackCategory || "other");
    const config = PRODUCT_TYPE_CONFIG[detectedCategory] || PRODUCT_TYPE_CONFIG.other;
    const confidence = Number(parsed?.confidence ?? 0);
    return {
      detectedCategory,
      categoryLabel: String(parsed?.categoryLabel || config.label),
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
      hasVisibleText: Boolean(parsed?.hasVisibleText),
      hasVisibleLabelOrSticker: Boolean(parsed?.hasVisibleLabelOrSticker),
      mustPreserve: normalizeStringList(parsed?.mustPreserve),
      avoid: normalizeStringList(parsed?.avoid),
      allowedProps: normalizeStringList(parsed?.allowedProps),
      forbiddenProps: normalizeStringList(parsed?.forbiddenProps),
      recommendedScene: String(parsed?.recommendedScene || "").trim(),
      sceneDirection: String(parsed?.sceneDirection || "").trim(),
      stylingStrategy: String(parsed?.stylingStrategy || "").trim(),
      noTextPolicy: String(parsed?.noTextPolicy || "").trim(),
      shortPromptHint: String(parsed?.shortPromptHint || "").trim(),
      rawText: raw,
    };
  } catch {
    return fallbackProductAnalysis(fallbackCategory, raw);
  }
}

async function analyzeProductImage(params: {
  imageDataUrl: string;
  fallbackProductType?: string;
  productDetail?: string;
}): Promise<ProductImageAnalysis> {
  const analysisPrompt = `
You are an ecommerce product-photo classifier AND scene strategist for an AI commercial image tool.
Look at the uploaded product image and decide what the product actually is, then create a safe commercial retouching strategy for this exact product.
Return ONLY valid JSON. No markdown. No explanation.

Allowed detectedCategory values:
- dessert
- drink
- food
- perfume_bottle
- beauty
- accessory
- fashion
- electronics
- shopee
- other

Rules:
- If the image shows perfume, skincare, cosmetics, jars, tubes, bottles or boxed beauty products, choose perfume_bottle.
- Do not classify a perfume bottle as dessert, drink or food.
- Detect what must be preserved so the image does not become a different product.
- Detect what should be avoided so the generation does not add misleading props, food, fruit, fake text, fake labels or wrong ingredients.
- Detect whether the original uploaded product already has visible readable text, printed label text, cup sticker text, package text, logo-like text, or brand placeholder text.
- If brand text exists, tell the generator to preserve the original visible label text and label area as much as possible, and avoid inventing different readable fake text.
- If no visible text/label/sticker exists, explicitly tell the generator not to add any new label, sticker, cup sticker, front label, brand placeholder or readable words.
- For perfume_bottle, explicitly avoid plates, forks, spoons, bowls, saucers, fruit, food, dessert props, drink cups and dining-table styling. Recommend cosmetic/boutique display props only.
- Recommend allowedProps that are safe for THIS exact product and can make the image commercially richer without misleading customers.
- Recommend forbiddenProps that should not appear because they would imply a wrong product, wrong flavor, wrong scent, wrong included item, wrong function, fake label or fake brand.
- If no visible text/label/sticker exists, the noTextPolicy must block new text and stickers, but it must not block non-text props such as light, shadow, texture, coaster, neutral fabric, display block, ice or tray when category-safe.
- If the category is uncertain, recommend only universal safe props such as cream background, neutral fabric, marble-like surface, soft shadow, acrylic or frosted glass block, small display block and gentle light.
- For cooked meat, fried food, braised food, chicken parts, bone-in snacks or irregular meat pieces, detect and describe the exact visible cut/body-part features that must be preserved: piece count, original arrangement, long/curved shape, bone-joint structure, irregular edges, crust texture, contour, thickness and whether it looks like chicken neck, wing, feet, rib, drumstick, nuggets or another cut. If it might be chicken neck, duck neck, chicken feet, wing tips, ribs, cartilage, fried off-cuts or any irregular meat cut, explicitly put these shape-preservation warnings in mustPreserve and avoid. If uncertain, instruct the generator to preserve the original irregular shapes and not turn them into drumsticks or generic fried chicken. If the piece looks neck-like or off-cut-like, explicitly warn against sausage-like loops, plump tubes, closed arcs, smooth curved meat logs or rounded drumstick silhouettes.
- Do not recommend strong category-specific props such as fruit, forks, spoons, straws, cosmetic brushes, jewelry boxes or food ingredients unless the product category clearly matches.
- Keep the output concise but useful for prompt generation.

User optional note:
${String(params.productDetail || "").trim() || "(none)"}

JSON format:
{
  "detectedCategory": "perfume_bottle",
  "categoryLabel": "繁體中文類別名稱",
  "confidence": 0.92,
  "hasVisibleText": true,
  "hasVisibleLabelOrSticker": true,
  "mustPreserve": ["瓶身比例", "瓶蓋高度"],
  "avoid": ["水果", "甜點", "不同品牌假文字", "移除原本標籤文字"],
  "allowedProps": ["米白桌面", "柔和光線", "壓克力展示台", "中性布料"],
  "forbiddenProps": ["餐具", "水果", "杯貼文字", "不同品牌假文字"],
  "recommendedScene": "米白桌面、柔光、簡約精品感",
  "sceneDirection": "根據商品實際類型安排安全且有商業感的場景，不新增文字或誤導性配件",
  "stylingStrategy": "保留商品本體，提升背景、光線、構圖與非文字配件層次",
  "noTextPolicy": "只有原圖本來有文字時才保留文字；原圖無文字時不可新增任何可讀字或貼紙",
  "shortPromptHint": "Keep the bottle ratio, preserve original visible label text when present, and avoid fruit, food, plates and different fake brand text."
}
`.trim();

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_ANALYSIS_MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: analysisPrompt },
            { type: "input_image", image_url: params.imageDataUrl, detail: "low" },
          ],
        },
      ],
      temperature: 0.1,
      max_output_tokens: 700,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("OpenAI product analysis error:", data);
    throw new Error(data?.error?.message || `商品圖片分析失敗：${res.status}`);
  }

  const text = extractResponseOutputText(data);
  const fallbackCategory = normalizeProductCategory(params.fallbackProductType || "other", "other");
  const analysis = parseProductAnalysis(text, fallbackCategory);

  // 補齊保守限制，避免香水變甜點、商品出現假文字。
  if (!analysis.mustPreserve.length) {
    analysis.mustPreserve = fallbackProductAnalysis(analysis.detectedCategory).mustPreserve;
  }
  if (!analysis.avoid.length) {
    analysis.avoid = fallbackProductAnalysis(analysis.detectedCategory).avoid;
  }

  return analysis;
}

function buildAnalysisPromptBlock(analysis: ProductImageAnalysis, originalProductDetail?: string) {
  const config = PRODUCT_TYPE_CONFIG[analysis.detectedCategory] || PRODUCT_TYPE_CONFIG.other;
  const lowConfidence = Number(analysis.confidence || 0) < 0.72;
  const propSafetyMode = lowConfidence
    ? "Low-confidence category: use only neutral universal commercial props. Do not use fruit, food, utensils, cosmetic tools, jewelry boxes or other strong category-specific props unless clearly visible in the uploaded image."
    : "Category is sufficiently detected: use only props that match this detected category and avoid cross-category props.";

  return `
AI product analysis result:
- Detected category: ${analysis.categoryLabel || config.label} (${analysis.detectedCategory})
- Confidence: ${analysis.confidence}
- Original has visible text: ${analysis.hasVisibleText ? "yes" : "no"}
- Original has visible label/sticker: ${analysis.hasVisibleLabelOrSticker ? "yes" : "no"}
- Must preserve: ${analysis.mustPreserve.join(", ") || "product identity, shape, color and package"}
- Must avoid: ${analysis.avoid.join(", ") || "misleading props, fake text, fake labels and wrong product category"}
- Allowed props for this exact product: ${analysis.allowedProps?.join(", ") || "category-safe commercial props only"}
- Forbidden props for this exact product: ${analysis.forbiddenProps?.join(", ") || "wrong-category or misleading props"}
- Recommended scene: ${analysis.recommendedScene || "clean commercial background with soft light"}
- Scene direction: ${analysis.sceneDirection || "category-matched commercial scene"}
- Styling strategy: ${analysis.stylingStrategy || "improve light, background, composition and commercial value without changing product identity"}
- No-text policy: ${analysis.noTextPolicy || "do not add readable text unless the original already has visible text"}
- Short prompt hint: ${analysis.shortPromptHint || "Keep the product recognizable and avoid misleading edits."}
- Prop safety mode: ${propSafetyMode}

Important automatic instruction:
Use the detected product category above as the true product category, even if the frontend sent a different or old product type.
Props must fit the detected category. Do not use dessert/food/dining props unless the detected category is actually dessert, drink or food. If detected category is perfume_bottle, use only cosmetic/boutique display props and avoid plates, forks, spoons, bowls, saucers, fruit, desserts, drink cups and dining-table styling.
If confidence is low, choose neutral universal props only: cream background, neutral fabric, marble-like surface, soft shadow, acrylic or frosted glass block, small display block, gentle light. Avoid category-specific props.
If original has visible text = no and original has visible label/sticker = no, do not create any new readable words, stickers, labels, cup labels, front labels, brand placeholders, logo-like text or printed text. Keep plain product surfaces plain.
This no-text restriction does not forbid non-text commercial props. You may still use allowedProps such as ice cubes, condensation, coaster, tray, fabric, acrylic block, flowers, shadows, marble surface or neutral display objects when they match the detected category and do not imply a wrong product.
If detected category is drink and original has visible label/sticker = no, never add a front cup sticker or words such as BUBBLE TEA, COFFEE, MILK TEA or YOUR BRAND, but still use non-text drink props if allowed by the analysis.
If detected category is perfume_bottle, never use food-table props even if they appear aesthetically pleasing. No plate, bowl, saucer, fork, spoon, knife, fruit, dessert, food, drink cup, tea glass or dining composition is allowed.
If the detected category is dessert, drink or food, preserving visible topping count / ingredient count / garnish presence is higher priority than minimalist styling. Do not make the product look less full, less generous or less topped than the original image.
If the detected category is food and the uploaded product appears to be fried, braised, grilled or cooked meat, preserve the original meat cut / body part identity, piece count, original arrangement, irregular contour, long/curved shape, length, thickness, bone-joint hints and coating texture. Use conservative retouching: improve light/background/plate/color only, and keep edible piece silhouettes close to the uploaded image. Do not convert chicken neck, duck neck, chicken feet, wing tips, ribs, cartilage, bone-in snacks, fried off-cuts or irregular meat pieces into drumsticks, small chicken legs, nuggets, tenders, wings, strips, sausages, sausage-like loops or generic fried chicken. If the source pieces are neck-like, keep them visibly neck-like: thinner, uneven, segmented and irregular rather than plump or smoothly rounded.

User note:
${String(originalProductDetail || "").trim() || "(none)"}
`.trim();
}
function buildOpenAIPrompt(params: {
  productType: string;
  outputRatio: string;
  styleId: string;
  productDetail?: string;
}) {
  const productTypeConfig =
    PRODUCT_TYPE_CONFIG[params.productType] || PRODUCT_TYPE_CONFIG.other;
  const style = STYLE_CONFIG[params.styleId];
  const userProductDetail = String(params.productDetail || "").trim();

  const productDetailBlock = userProductDetail
    ? `
User notes / requested direction. Follow these when reasonable, but they must not override product fidelity, no-new-text rules, category safety, or legal advertising safety:
${userProductDetail}
`
    : "";

  return `
You are creating an AI high-end commercial product image from the uploaded shop product photo.
This is for marketing, social posts, preorder pages, product display, Google Business photos or ecommerce drafts.
It is not a guaranteed exact product-documentation photo.

${STRICT_PRODUCT_FIDELITY_RULE}

${MINI_FIDELITY_ESCALATION_RULE}

${MESSY_SHOP_PHOTO_CLEANUP_RULE}

${PROP_AND_FOCUS_RULE}

${UNIVERSAL_SAFE_PROP_RULE}

${ORIGINAL_LABEL_TEXT_RULE}

${LABEL_TEXT_PRIORITY_RULE}

${STRICT_NO_INVENTED_TEXT_OR_STICKER_RULE}

${VISIBLE_TOPPING_AND_COUNT_RULE}

${MEAT_CUT_AND_BODY_PART_PRESERVATION_RULE}

${SHAPE_SENSITIVE_FOOD_CONSERVATIVE_RETOUCH_RULE}

${CHICKEN_NECK_EXTREME_PRESERVATION_RULE}

${AI_DYNAMIC_SCENE_STRATEGY_RULE}

${CATEGORY_MATCHED_PROP_RULE}

Output requirements:
- Aspect ratio: ${params.outputRatio}
- Product category: ${productTypeConfig.label}
- Selected style: ${style.title}
- No new text, no price, no watermark, no AI label, no fake logo, no fake badge, no new sticker, no new cup label, no new front label, no new printed words. If the uploaded product already has visible label/sticker/packaging text, preserve that original-looking text and label area as much as possible; do not erase it and do not replace it with a different fake brand. If the uploaded product has no visible text or label/sticker, keep it plain and text-free.
- Use the AI product analysis block as a dynamic product-specific strategy. It should decide allowed non-text props and forbidden props for this exact item so the tool can work across many product categories.
- For cooked meat / fried food / braised food, keep the original meat part shape, piece structure, piece count and arrangement. Use conservative retouching and do not transform irregular pieces into chicken drumsticks, nuggets, tenders, wings, strips, sausages, sausage-like loops or generic fried chicken. If the source looks like chicken neck or another irregular off-cut, preserve a thinner neck-like segmented silhouette.
${productDetailBlock}

Selected visual style:
${style.prompt}

Product fidelity guidance:
${productTypeConfig.mustKeep}

Product category scene guidance:
${productTypeConfig.sceneProps}

Avoid:
${productTypeConfig.avoid}

${params.styleId === "white" ? WHITE_BACKGROUND_RULE : ""}
${params.styleId === "premium" ? PREMIUM_DECORATION_RULE : ""}
${params.styleId === "premium" && params.productType === "dessert" ? PREMIUM_DESSERT_REFERENCE_RULE : ""}
${params.styleId === "premium" && params.productType === "drink" ? PREMIUM_DRINK_REFERENCE_RULE : ""}
${params.styleId === "premium" && params.productType === "perfume_bottle" ? PREMIUM_PERFUME_REFERENCE_RULE : ""}
${params.styleId === "premium" && params.productType === "accessory" ? PREMIUM_ACCESSORY_REFERENCE_RULE : ""}
${params.styleId === "premium" && params.productType === "electronics" ? PREMIUM_ELECTRONICS_REFERENCE_RULE : ""}
${params.styleId === "social" ? SOCIAL_RICH_SCENE_RULE : ""}
${params.styleId === "social" && params.productType === "perfume_bottle" ? SOCIAL_PERFUME_REFERENCE_RULE : ""}
${params.styleId === "social" && params.productType === "drink" ? SOCIAL_DRINK_REFERENCE_RULE : ""}
${params.styleId === "social" && ["dessert", "food"].includes(params.productType) ? SOCIAL_DESSERT_REFERENCE_RULE : ""}
${params.styleId === "social" && params.productType === "accessory" ? SOCIAL_ACCESSORY_REFERENCE_RULE : ""}
${params.styleId === "social" && params.productType === "electronics" ? SOCIAL_ELECTRONICS_REFERENCE_RULE : ""}
${params.styleId === "delivery" ? DELIVERY_THUMBNAIL_RULE : ""}
${params.styleId === "delivery" && ["dessert", "drink", "food"].includes(params.productType) ? DELIVERY_FOOD_REFERENCE_RULE : ""}
${params.styleId === "delivery" && !["dessert", "drink", "food"].includes(params.productType) ? DELIVERY_NON_FOOD_REFERENCE_RULE : ""}
Composition target:
Create a clean, bright, realistic and category-matched commercial product image that matches the selected style. Make it more attractive than the original phone photo through better lighting, composition, background, display surface, suitable props and depth of field. Use plating language only for food-related products. Keep the product broadly recognizable from the upload. For food, dessert and drink products, preserve visible topping count, ingredient presence, piece count, original arrangement, cut identity, shape contour and overall generosity so the result does not look less full or like a different food item than the original. For shape-sensitive cooked meat, do not beautify by changing the edible pieces into more common meat shapes. If the original appears to be chicken neck or another irregular off-cut, prefer a literal source-faithful silhouette over a prettier commercial redesign: keep the thinner uneven segmented neck-like contours and avoid sausage-like or drumstick-like reinterpretation. This is an AI commercial draft; if the image still needs exact food structure, exact topping count, exact label, exact packaging or legal-use precision, it should be handled by a human retouching upgrade after AI generation.
`.trim();
}

async function uploadImageToStorage(params: {
  supabaseAdmin: any;
  userId: string;
  imageBytes: Uint8Array;
  mimeType: string;
  folder: "source" | "result";
}) {
  const ext = getExtByMime(params.mimeType);
  const filePath = `${params.folder}/${params.userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await params.supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, params.imageBytes, {
      contentType: params.mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error(`圖片儲存失敗：${uploadError.message || "Storage error"}`);
  }

  const { data: publicData } = params.supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: publicData.publicUrl,
  };
}

async function callOpenAIImageEdit(params: {
  mimeType: string;
  imageBytes: Uint8Array;
  prompt: string;
  outputRatio: string;
}) {
  const form = new FormData();

  const ext = getExtByMime(params.mimeType);
  const filename = `source.${ext}`;
  const blob = new Blob([params.imageBytes], { type: params.mimeType });

  form.append("model", OPENAI_IMAGE_MODEL);
  form.append("prompt", params.prompt);
  form.append("quality", OPENAI_IMAGE_QUALITY);
  form.append("size", mapRatioToSize(params.outputRatio));
  form.append("image[]", blob, filename);

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("OpenAI image edit error:", data);
    throw new Error(
      data?.error?.message || `OpenAI 圖片重畫失敗：${res.status}`
    );
  }

  const b64 =
    data?.data?.[0]?.b64_json ||
    data?.data?.[0]?.b64Json ||
    null;

  if (!b64) {
    console.error("OpenAI no image data:", data);
    throw new Error("OpenAI 未回傳圖片資料。");
  }

  return {
    mimeType: "image/png",
    imageBytes: base64ToBytes(b64),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        { success: false, error: "缺少 Supabase 環境變數。" },
        500
      );
    }

    if (!OPENAI_API_KEY) {
      return jsonResponse(
        {
          success: false,
          error:
            "缺少 OPENAI_API_KEY。請到 Edge Functions Secrets 新增 OpenAI API Key。",
        },
        500
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userId = await getUserIdFromSession(req, supabaseAdmin);

    if (!userId) {
      return jsonResponse(
        { success: false, error: "請先登入後再使用" },
        401
      );
    }

    const body = await req.json();

    const {
      productType,
      outputRatio,
      styleId,
      imageDataUrl,
      productDetail,
    } = body || {};

    if (!userId) {
      return jsonResponse({ success: false, error: "缺少 userId。" }, 400);
    }

    if (!outputRatio || !styleId || !imageDataUrl) {
      return jsonResponse(
        {
          success: false,
          error: "缺少必要欄位，請確認圖片尺寸、風格與圖片。",
        },
        400
      );
    }

    if (!STYLE_CONFIG[styleId]) {
      return jsonResponse({ success: false, error: "無效的風格類型。" }, 400);
    }

    const style = STYLE_CONFIG[styleId];
    const pointsCost = style.points;

    const { data: creditRow, error: creditError } = await supabaseAdmin
      .from("user_credits")
      .select("user_id, remaining_chars")
      .eq("user_id", userId)
      .single();

    if (creditError || !creditRow) {
      console.error("讀取點數失敗:", creditError);
      return jsonResponse(
        { success: false, error: "找不到使用者點數資料。" },
        404
      );
    }

    const remainingPoints = Number(creditRow.remaining_chars || 0);

    if (remainingPoints < pointsCost) {
      return jsonResponse(
        {
          success: false,
          error: "點數不足，請先購買點數",
        },
        402
      );
    }

    const { mimeType, base64Data } = extractBase64FromDataUrl(imageDataUrl);
    const sourceBytes = base64ToBytes(base64Data);

    const sourceUploaded = await uploadImageToStorage({
      supabaseAdmin,
      userId,
      imageBytes: sourceBytes,
      mimeType,
      folder: "source",
    });

    let productAnalysis = fallbackProductAnalysis(productType || "other");
    try {
      productAnalysis = await analyzeProductImage({
        imageDataUrl,
        fallbackProductType: productType || "other",
        productDetail,
      });
    } catch (analysisError) {
      console.error("AI 商品判讀失敗，改用保守一般商品模式:", analysisError);
      productAnalysis = fallbackProductAnalysis(productType || "other");
    }

    const detectedProductType = normalizeProductCategory(
      productAnalysis.detectedCategory,
      productType || "other"
    );
    productAnalysis.detectedCategory = detectedProductType;

    const prompt = buildOpenAIPrompt({
      productType: detectedProductType,
      outputRatio,
      styleId,
      productDetail: buildAnalysisPromptBlock(productAnalysis, productDetail),
    });

    const openAiResult = await callOpenAIImageEdit({
      mimeType,
      imageBytes: sourceBytes,
      prompt,
      outputRatio,
    });

    const resultUploaded = await uploadImageToStorage({
      supabaseAdmin,
      userId,
      imageBytes: openAiResult.imageBytes,
      mimeType: openAiResult.mimeType,
      folder: "result",
    });

    const { data: consumeRows, error: consumeError } = await supabaseAdmin.rpc(
      "consume_credits_with_meta",
      {
        p_user_id: userId,
        p_amount: pointsCost,
        p_feature: "product-image-generator",
        p_input_chars: 0,
        p_output_chars: 0,
        p_meta: {
          engine: "openai",
          processingMode: "ai-commercial-mini-draft-with-auto-product-analysis",
          model: OPENAI_IMAGE_MODEL,
          analysisModel: OPENAI_ANALYSIS_MODEL,
          quality: OPENAI_IMAGE_QUALITY,
          requestedProductType: productType || null,
          detectedProductType,
          productAnalysis,
          outputRatio,
          styleId,
          styleTitle: style.title,
          productDetail: productDetail || null,
          pointsUsed: pointsCost,
          sourceImageUrl: sourceUploaded.publicUrl,
          imageUrl: resultUploaded.publicUrl,
          storagePath: resultUploaded.filePath,
          promptVersion: PROMPT_VERSION,
        },
      }
    );

    if (consumeError) {
      console.error("PRODUCT_IMAGE_CREDIT_DEBIT_FAILED", consumeError.message);
      const insufficient = /insufficient/i.test(consumeError.message || "");
      return jsonResponse(
        {
          success: false,
          error: insufficient ? "INSUFFICIENT_CREDITS" : "CREDIT_DEBIT_FAILED",
        },
        insufficient ? 402 : 500
      );
    }

    const consumeRow = Array.isArray(consumeRows) ? consumeRows[0] : consumeRows;
    const newRemaining = Number(
      consumeRow?.remaining_chars ?? consumeRow?.after_remaining ?? 0
    );

    return jsonResponse({
      success: true,
      engine: "openai",
      model: OPENAI_IMAGE_MODEL,
      analysisModel: OPENAI_ANALYSIS_MODEL,
      quality: OPENAI_IMAGE_QUALITY,
      imageUrl: resultUploaded.publicUrl,
      sourceImageUrl: sourceUploaded.publicUrl,
      storagePath: resultUploaded.filePath,
      pointsUsed: pointsCost,
      remainingPoints: newRemaining,
      styleTitle: style.title,
      detectedProductType,
      productAnalysis,
      promptVersion: PROMPT_VERSION,
    });
  } catch (error) {
    console.error("product-image-generator error:", error);

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AI 商品圖重畫失敗，請稍後再試。",
      },
      500
    );
  }
});

/**
 * @file geminiClient.js
 * Isolated Google Gemini API client with graceful fallback mechanisms.
 * Supports review generation, text improvement (grammar, translate, tone),
 * and AI moderation.
 */

import { GENERATION_LENGTH, GENERATION_TONE, GENERATION_LANGUAGES } from "../types/managementTypes.js";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Invoke Gemini REST API
 * @param {string} prompt
 * @param {Object} [options]
 * @returns {Promise<string|null>}
 */
export async function callGeminiApi(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "demo_gemini_api_key") {
    return null; // Will trigger deterministic fallback
  }

  const model = options.model || DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs || 8000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 600,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[GeminiClient] Gemini API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return textOutput ? textOutput.trim() : null;
  } catch (err) {
    console.warn("[GeminiClient] Call failed or timed out:", err.message);
    return null;
  }
}

/**
 * Generate a customer review from brief bullet points using Gemini (with heuristic fallback)
 * @param {Object} params
 * @param {string} params.prompt - User notes (e.g. "teak dining table, delivered in 4 days, very good finish")
 * @param {number} params.rating - 1 to 5 star rating
 * @param {string} params.length - SHORT | MEDIUM | LONG
 * @param {string} params.tone - PROFESSIONAL | CASUAL | FORMAL | FRIENDLY
 * @param {string} params.language - en | mr | hi
 * @returns {Promise<string>} Natural review text
 */
export async function generateReviewWithGemini({
  prompt = "",
  rating = 5,
  length = GENERATION_LENGTH.MEDIUM,
  tone = GENERATION_TONE.PROFESSIONAL,
  language = "en",
}) {
  const cleanPrompt = String(prompt).trim();
  const langLabel = GENERATION_LANGUAGES[language] || "English";

  const systemInstruction = `You are an authentic Indian customer writing a genuine Google review for "Aameena Furniture" in Solapur, Maharashtra.
STRICT RULES:
1. ONLY write about what the user mentions: "${cleanPrompt}".
2. Do NOT invent fake delivery details, products, or family stories not mentioned.
3. Language: Write entirely in ${langLabel}.
4. Length: ${length === GENERATION_LENGTH.SHORT ? "Short (30-50 words)" : length === GENERATION_LENGTH.LONG ? "Long & detailed (120-160 words)" : "Medium (60-90 words)"}.
5. Tone: ${tone}.
6. Rating: ${rating} out of 5 stars sentiment.
7. Return ONLY the review text. No quotes, no preamble, no markdown formatting.`;

  const geminiResponse = await callGeminiApi(systemInstruction, { temperature: 0.7 });
  if (geminiResponse) {
    return geminiResponse.replace(/^["']|["']$/g, "").trim();
  }

  // Fallback heuristic generator
  return generateLocalReviewFallback({ prompt: cleanPrompt, rating, length, tone, language });
}

/**
 * Improve review text (grammar, readability, translate, rewrite, tone change)
 * @param {Object} params
 * @returns {Promise<string>}
 */
export async function improveReviewWithGemini({
  text = "",
  action = "grammar",
  targetTone = GENERATION_TONE.PROFESSIONAL,
  targetLanguage = "en",
}) {
  const cleanText = String(text).trim();
  if (!cleanText) return "";

  const langLabel = GENERATION_LANGUAGES[targetLanguage] || "English";

  let prompt = "";
  if (action === "translate") {
    prompt = `Translate the following furniture review into fluent, natural ${langLabel}, keeping the exact meaning identical:\n\n"${cleanText}"\n\nReturn ONLY the translation without quotes.`;
  } else if (action === "grammar") {
    prompt = `Correct the grammar, spelling, and punctuation of this customer review while keeping the voice authentic and meaning identical:\n\n"${cleanText}"\n\nReturn ONLY the corrected text.`;
  } else if (action === "change_tone") {
    prompt = `Rewrite this furniture review in a ${targetTone} tone while keeping every factual detail identical:\n\n"${cleanText}"\n\nReturn ONLY the rewritten review.`;
  } else if (action === "summarize") {
    prompt = `Summarize this review into 1-2 factual sentences:\n\n"${cleanText}"\n\nReturn ONLY the summary.`;
  } else {
    prompt = `Enhance the clarity and flow of this review without changing any facts:\n\n"${cleanText}"\n\nReturn ONLY the improved text.`;
  }

  const geminiResponse = await callGeminiApi(prompt, { temperature: 0.3 });
  if (geminiResponse) {
    return geminiResponse.replace(/^["']|["']$/g, "").trim();
  }

  // Heuristic cleanup fallback: fix capitalization and spacing
  let cleaned = cleanText.replace(/\s+/g, " ").trim();
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return cleaned;
}

/**
 * Generate a complete auto-fill review with AI — single click, no user input required.
 * Produces a human-sounding review (120–220 words) with a random reviewer name.
 * The result is immutable per click — each invocation yields a unique review.
 *
 * @param {Object} [options]
 * @param {number} [options.rating] - Optional fixed rating (1-5). Random 4-5 if omitted.
 * @param {string} [options.language] - en | hi | mr
 * @returns {Promise<{ success: boolean, reviewerName: string, rating: number, reviewText: string }>}
 */
export async function generateAutoFillReview(options = {}) {
  const rating = options.rating || (Math.random() > 0.3 ? 5 : 4);
  const language = options.language || "en";
  const langLabel = GENERATION_LANGUAGES[language] || "English";

  // Curated authentic Indian names from Solapur/Maharashtra region
  const NAMES = [
    "Ramesh Kulkarni", "Priya Deshmukh", "Anil Jadhav", "Suresh Patil",
    "Kavita Bhosle", "Rajesh More", "Sneha Shinde", "Mahesh Gaikwad",
    "Anjali Pawar", "Deepak Chavan", "Sunita Kamble", "Vikas Mane",
    "Pooja Londhe", "Sanjay Wagh", "Meena Ingale", "Ravi Thorat",
    "Swati Kale", "Amit Nikam", "Rekha Salunkhe", "Nilesh Kokate",
    "Fatima Sheikh", "Irfan Patel", "Nusrat Banu", "Altaf Shaikh",
    "Sameer Mulani", "Zarina Inamdar", "Arjun Khot", "Vidya Desai",
  ];
  const reviewerName = NAMES[Math.floor(Math.random() * NAMES.length)];

  // Furniture-specific talking points for variation
  const PRODUCTS = [
    "teak wood dining table set", "sheesham wood wardrobe", "custom sofa set",
    "modular kitchen cabinet", "solid wood bed frame", "study table with shelves",
    "office furniture set", "dressing table with mirror", "TV unit with storage",
    "wooden bookshelf", "display showcase", "center table for living room",
  ];
  const QUALITIES = [
    "polish finish", "wood grain quality", "joint alignment", "durability",
    "scratch-resistant coating", "smooth edges", "craftsmanship detail",
    "timber selection", "fitting precision", "lacquer finish",
  ];
  const STAFF = ["Imran Bhai", "Farhan", "the sales team", "the showroom staff", "Arif Bhai"];

  const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const quality = QUALITIES[Math.floor(Math.random() * QUALITIES.length)];
  const staff = STAFF[Math.floor(Math.random() * STAFF.length)];

  const prompt = `You are a real Indian customer writing a genuine Google review for "Aameena Furniture" in Solapur, Maharashtra.

STRICT RULES:
1. Write as "${reviewerName}" who recently purchased a ${product}.
2. Mention the ${quality} positively.
3. Mention ${staff} helped during the visit.
4. Rating sentiment: ${rating} out of 5 stars.
5. Language: ${langLabel}.
6. Length: EXACTLY 120 to 220 words. Not shorter, not longer.
7. Write like a genuine Indian customer — use natural phrasing, occasional Hindi/Marathi words if English, mention Solapur city.
8. Include one small constructive suggestion to feel authentic (e.g., parking, waiting time, catalogue update).
9. Do NOT use marketing language, exclamation marks excessively, or generic phrases like "best furniture shop ever".
10. Do NOT mention discounts, prices, or promotional offers.
11. Return ONLY the review text. No quotes, no preamble, no markdown, no signatures.`;

  const geminiResponse = await callGeminiApi(prompt, {
    temperature: 0.85,
    maxOutputTokens: 800,
  });

  if (geminiResponse) {
    const cleanText = geminiResponse
      .replace(/^["'"""]+|["'"""]+$/g, "")
      .replace(/^(Review|Rating|Stars|Name|By)[\s:]+/gi, "")
      .trim();

    return {
      success: true,
      reviewerName,
      rating,
      reviewText: cleanText,
    };
  }

  // Deterministic fallback when Gemini API is unavailable
  const fallbackText = generateAutoFillFallback(reviewerName, product, quality, staff, rating, language);
  return {
    success: true,
    reviewerName,
    rating,
    reviewText: fallbackText,
  };
}

/**
 * Deterministic fallback for auto-fill when Gemini is unavailable
 */
function generateAutoFillFallback(name, product, quality, staff, rating, language) {
  if (language === "mr") {
    return `आम्ही नुकतेच सोलापूरमधील अमीना फर्निचरमधून ${product} खरेदी केले. ${staff} यांनी आम्हाला शोरूममध्ये खूप चांगले मार्गदर्शन केले. लाकडाची ${quality} उत्तम आहे आणि कारागिरांचे काम अत्यंत बारकाईने केलेले दिसते. फर्निचर घरी आल्यावर सगळ्यांनाच आवडले. डिलिव्हरी वेळेवर झाली आणि फिटिंग देखील व्यवस्थित केली. फक्त पार्किंगची जागा थोडी अपुरी वाटली, पण एकूणच अनुभव चांगला होता. नक्कीच मित्रांना शिफारस करेन.`;
  }

  if (language === "hi") {
    return `हमने हाल ही में सोलापुर के अमीना फर्नीचर से ${product} खरीदा। ${staff} ने शोरूम में बहुत अच्छी तरह से गाइड किया। लकड़ी की ${quality} बेहतरीन है और कारीगरी में बारीकी साफ दिखती है। डिलीवरी सही समय पर हुई और फिटिंग भी ठीक से की गई। घर पर सभी को फर्नीचर बहुत पसंद आया। बस एक सुझाव है कि कैटलॉग को थोड़ा और अपडेट किया जा सकता है ताकि ग्राहकों को चुनने में आसानी हो। कुल मिलाकर बहुत संतुष्ट हैं।`;
  }

  // English fallback — 120-220 words, authentic voice
  const openings = [
    `We had been looking for quality ${product} for our home in Solapur for quite some time.`,
    `After visiting several furniture shops in Solapur, we finally decided to check out Aameena Furniture.`,
    `A colleague recommended Aameena Furniture when we mentioned we needed a ${product}.`,
  ];
  const opening = openings[Math.floor(Math.random() * openings.length)];

  return `${opening} ${staff} at the showroom was genuinely helpful — explained the different wood options without any sales pressure. We ended up going with a ${product} and the ${quality} is exactly what we expected. The timber feels solid and the overall construction is sturdy. Delivery was done on schedule and the team was careful during assembly. My wife was particularly happy with how the finish matched our existing interiors. One small thing — the waiting area could use better seating and maybe some water arrangement, especially during Solapur summers. But that is a minor point. The furniture itself is excellent value for the price range. Would definitely recommend Aameena Furniture to friends and family looking for genuine hardwood furniture in Solapur.`;
}

/**
 * Deterministic local fallback for review generation when Gemini key is not configured
 */
function generateLocalReviewFallback({ prompt, rating, length, language }) {
  const note = prompt || "Handcrafted furniture experience at Aameena Furniture Solapur";

  if (language === "mr") {
    if (rating >= 4) {
      return `आम्ही सोलापूरच्या अमीना फर्निचरमधून खरेदी केली. ${note}. लाकडाची गुणवत्ता आणि कारागिरांचे काम उत्कृष्ट आहे. वेळेवर डिलिव्हरी आणि उत्तम फिनिशिंग मिळाले. नक्कीच शिफारस करेन!`;
    }
    return `सोलापूरमधील अमीना फर्निचरला भेट दिली. ${note}. फर्निचरचे लाकूड चांगले आहे, पण डिलिव्हरी वेळेत थोडी सुधारणा हवी आहे.`;
  }

  if (language === "hi") {
    if (rating >= 4) {
      return `अमीना फर्नीचर सोलापुर से अनुभव बहुत अच्छा रहा। ${note}। सागवान लकड़ी की मजबूती और कारीगरी बेहतरीन है। सही समय पर डिलीवरी मिली। बहुत संतुष्ट हैं!`;
    }
    return `अमीना फर्नीचर सोलापुर का अनुभव मिला। ${note}। गुणवत्ता अच्छी है लेकिन डिलीवरी समय को और बेहतर किया जा सकता है।`;
  }

  // English fallback
  if (rating >= 4) {
    if (length === GENERATION_LENGTH.SHORT) {
      return `Great experience with Aameena Furniture in Solapur. ${note}. Solid hardwood quality and clean finish. Highly recommend!`;
    }
    return `We recently engaged with Aameena Furniture in Solapur. ${note}. The timber grain and joint alignment reflect genuine Grade-A craftsmanship. The team handled delivery and assembly with great care. Very pleased with the overall durability.`;
  }

  return `Visited Aameena Furniture in Solapur. ${note}. The hardwood quality is solid, though scheduling and transit updates could be improved. Appreciate the polite customer support team.`;
}

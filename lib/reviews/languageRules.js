/**
 * Language rules, stylistic constraints, and anti-marketing dictionaries
 * for the Aameena Furniture AI Review Generation Layer.
 */

// Banned marketing buzzwords across English, Hindi, and Marathi
export const BANNED_MARKETING_WORDS = [
  // English
  "highly recommended",
  "world class",
  "world-class",
  "outstanding",
  "best ever",
  "amazing company",
  "luxury experience",
  "life changing",
  "life-changing",
  "guaranteed",
  "100%",
  "100 percent",
  "hundred percent",
  "perfect",
  "perfection",
  "revolutionary",
  "top notch",
  "top-notch",
  "flawless",
  "unparalleled",
  "unbeatable",
  "five stars",
  "5 stars",
  "must visit",
  "must buy",
  "game changer",
  "game-changer",

  // Hindi
  "सर्वश्रेष्ठ",
  "सर्वोत्कृष्ट",
  "विश्वस्तरीय",
  "अद्वितीय",
  "बेमिसाल",
  "लाजवाब",
  "गारंटीड",
  "शत प्रतिशत",
  "100%",
  "१००%",
  "परफेक्ट",
  "शानदार कंपनी",
  "अविश्वसनीय",

  // Marathi
  "जगात भारी",
  "एक नंबर कंपनी",
  "सर्वोत्कृष्ट",
  "आलिशान अनुभव",
  "गारंटी",
  "शंभर टक्के",
  "100%",
  "१००%",
  "परफेक्ट",
  "अतुलनीय",
];

// Star rating emotional tones and structural expectations
export const RATING_TONE_DIRECTIVES = {
  5: {
    tone: "Positive",
    sentiment: "warm, satisfied, genuine personal appreciation",
    guideline:
      "Express sincere happiness with the purchase. Sound like a contented household customer or family member sharing honest feedback.",
  },
  4: {
    tone: "Positive",
    sentiment: "mostly positive with one small, realistic suggestion or observation",
    guideline:
      "Share genuine satisfaction with the main furniture piece while mentioning one tiny suggestion (e.g., slight wait during polish drying, booking in advance, or scheduling delivery window).",
  },
  3: {
    tone: "Balanced",
    sentiment: "fair, balanced, realistic pros and cons",
    guideline:
      "Acknowledge what worked well alongside what could be improved. Keep it completely fair, balanced, and constructive.",
  },
  2: {
    tone: "Constructive",
    sentiment: "mostly dissatisfied but calm and constructive",
    guideline:
      "State specific points of dissatisfaction calmly without drama. Focus only on the provided experience tags.",
  },
  1: {
    tone: "Constructive",
    sentiment: "critical, disappointed, completely polite and respectful",
    guideline:
      "Express clear disappointment about the specific issue experienced. Remain strictly polite and respectful; never use offensive, vulgar, or aggressive language.",
  },
};

// Language specific rules and metadata
export const LANGUAGE_METADATA = {
  en: {
    code: "en",
    name: "English",
    native: "English",
    flag: "🇬🇧",
    characterSet: "Latin",
    promptInstruction:
      "Write entirely in natural, conversational Indian English as spoken by Solapur and Maharashtra furniture buyers. Avoid corporate or marketing jargon.",
  },
  hi: {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    flag: "🇮🇳",
    characterSet: "Devanagari",
    promptInstruction:
      "Write entirely in authentic Devanagari Hindi (हिंदी लिपि). Use natural, conversational sentence structures common in Maharashtra/Solapur households. Do not use English words in Latin script.",
  },
  mr: {
    code: "mr",
    name: "Marathi",
    native: "मराठी",
    flag: "🇮🇳",
    characterSet: "Devanagari",
    promptInstruction:
      "Write entirely in authentic Marathi (मराठी देवनागरी). Use natural, colloquial Maharashtrian customer phrasing (सोलापूर व पश्चिम महाराष्ट्रातील ग्राहकांसारखे सहज व साधे संभाषण). Do not translate word-for-word from English.",
  },
};

// Permitted topics mapped to Experience tags to prevent hallucination/fabrication
export const EXPERIENCE_TOPIC_MAP = {
  "Product Quality": ["quality", "build", "sturdy", "गुणवत्ता", "मजबूती", "दर्जा", "बांधणी"],
  "Wood Quality": ["wood", "timber", "teak", "sagwan", "लाकूड", "सागवान", "शीशम"],
  "Finishing": ["finish", "finishing", "polish", "सतह", "पॉलिश", "फिनिशिंग"],
  "Comfort": ["comfort", "comfortable", "seating", "आराम", "कुशन", "बैठक"],
  "Design": ["design", "look", "pattern", "दिखने में", "आकार", "रचना", "डिझाइन"],
  "Durability": ["durable", "long lasting", "strong", "टिकाऊ", "मजबूत"],
  "Value for Money": ["value", "worth", "price to value", "पैसा वसूल", "किफायतशीर", "वाजवी"],
  "Delivery": ["delivery", "transport", "vehicle", "डिलिव्हरी", "पहुंचाना", "वाहतूक"],
  "Packaging": ["packaging", "packing", "wrap", "पॅकिंग", "कव्हर"],
  "Installation": ["installation", "fitting", "setup", "फिटिंग", "जोडणी"],
  "Staff Behaviour": ["staff", "workers", "salesman", "कर्मचारी", "स्टाफचे वर्तन"],
  "Owner Behaviour": ["owner", "management", "sir", "मालक", "दुकानदार", "संभाषण"],
  "Customization": ["custom", "made to order", "customized", "कस्टमाइज", "मनाप्रमाणे"],
  "Overall Experience": ["experience", "visit", "shopping", "अनुभव", "खरेदी"],
  "Customer Service": ["service", "response", "assistance", "सेवा", "मदत"],
  "Showroom Experience": ["showroom", "workshop", "display", "दुकान", "शोरूम", "वर्कशॉप"],
  "Easy Communication": ["communication", "call", "guidance", "संवाद", "मार्गदर्शन"],
  "Good Pricing": ["price", "cost", "rates", "किंमत", "दर", "भाव"],
  "On-time Delivery": ["on time", "schedule", "punctual", "वेळेवर", "टाईमिंग"],
  "Professional Guidance": ["guidance", "advice", "knowledge", "सल्ला", "माहिती"],
};

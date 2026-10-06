/**
 * Native language profiles, colloquial nuances, imperfection injection,
 * and banned AI marketing dictionaries for English, Hindi, and Marathi.
 */

// Banned AI and Marketing Buzzwords - STRICTLY PROHIBITED
export const BANNED_AI_WORDS = [
  // English AI & Marketing Fluff
  "exceptional",
  "outstanding",
  "top-notch",
  "top notch",
  "premium craftsmanship",
  "best in the market",
  "highly exceptional",
  "amazing quality",
  "five star experience",
  "5 star experience",
  "world class",
  "world-class",
  "perfect",
  "perfection",
  "excellent service throughout",
  "delighted",
  "outstanding customer satisfaction",
  "highly recommended",
  "life changing",
  "game changer",
  "unparalleled",
  "unbeatable",
  "flawless",
  "masterpiece",
  "second to none",
  "100%",
  "guaranteed",

  // Hindi AI Buzzwords
  "सर्वश्रेष्ठ",
  "सर्वोत्कृष्ट",
  "अद्वितीय",
  "विश्वस्तरीय",
  "बेमिसाल",
  "लाजवाब अनुभव",
  "शत प्रतिशत",
  "परफेक्ट",
  "शानदार कंपनी",
  "अविश्वसनीय",

  // Marathi AI Buzzwords
  "जगात भारी",
  "सर्वोत्कृष्ट",
  "एक नंबर कंपनी",
  "शंभर टक्के",
  "परफेक्ट",
  "आलिशान अनुभव",
  "अतुलनीय",
];

// Natural Imperfections by Language
export const NATURAL_IMPERFECTIONS = {
  en: ["honestly", "overall", "quite", "pretty", "actually", "finally", "really", "fortunately"],
  hi: ["सच कहें तो", "कुल मिलाकर", "काफी हद तक", "दरअसल", "आखिरकार", "सौभाग्य से", "ईमानदारी से"],
  mr: ["खरं सांगायचं तर", "एकंदरीत", "बऱ्याच अंशी", "शेवटी", "नशीबाने", "प्रामाणिकपणे"],
};

// Fact safety: strictly forbidden fabricated assertions
export const FORBIDDEN_FABRICATIONS = [
  "discount",
  "free warranty",
  "5 year warranty",
  "10 year warranty",
  "cashback",
  "special offer",
  "festival offer",
  "cheapest in india",
];

// Language Profiles with Native Showroom and Experience Banks
export const LANGUAGE_PROFILES = {
  en: {
    code: "en",
    name: "English",
    native: "English",
    flag: "🇬🇧",
    writingPersona: "Conversational Indian English as spoken in urban Maharashtra households",
    // Case 2: Showroom-only natural evaluation paragraphs (No product invented)
    showroomThemes: [
      {
        theme: "staff & showroom atmosphere",
        snippets: [
          "The showroom staff gave us plenty of space to browse without constantly hovering over us.",
          "They explained how different timber cuts hold up over time in Indian weather conditions.",
          "The display area in Solapur is well arranged, giving a clear sense of actual dimensions.",
        ],
      },
      {
        theme: "quality & honesty",
        snippets: [
          "What stood out was their upfront honesty regarding timber seasoning and polish care.",
          "The build quality across their display pieces looked solid, with clean joinery.",
          "They don't use particle board or artificial veneers; authentic timber is visible everywhere.",
        ],
      },
      {
        theme: "pricing & customer service",
        snippets: [
          "Their pricing is sensible compared to branded chain stores that mark up heavily.",
          "Customer service was prompt in answering our dimension queries over phone.",
          "Transparent quotation with no hidden delivery or polish charges.",
        ],
      },
      {
        theme: "trust & delivery",
        snippets: [
          "You can sense the generational craft expertise in how the team handles customer requirements.",
          "They coordinate logistics reliably and keep buyers updated on readiness.",
          "A trustworthy local Solapur enterprise with genuine craft values.",
        ],
      },
    ],
  },

  hi: {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    flag: "🇮🇳",
    writingPersona: "Authentic Devanagari Hindi (हिंदी) natural household dialogue",
    showroomThemes: [
      {
        theme: "स्टाफ और शोरूम का अनुभव",
        snippets: [
          "शोरूम का माहौल बहुत शांत और व्यवस्थित था, किसी तरह की जल्दबाजी नहीं कराई गई।",
          "स्टाफ ने लकड़ी के बारे में सीधी और काम की जानकारी दी।",
          "दुकान में रखी वैरायटी देखकर असली काम की पहचान आसानी से हो जाती है।",
        ],
      },
      {
        theme: "गुणवत्ता और ईमानदारी",
        snippets: [
          "सबसे अच्छी बात यह लगी कि इन्होंने लकड़ी की क्वालिटी को लेकर पूरी पारदर्शिता रखी।",
          "फर्नीचर के जोड़ और मजबूती देखकर समझ आता है कि अनुभवी कारीगरों का हाथ है।",
          "सस्ते बोर्ड के बजाय ठोस लकड़ी का उपयोग साफ झलकता है।",
        ],
      },
      {
        theme: "कीमत और ग्राहक सेवा",
        snippets: [
          "दाम के मामले में यह दुकान काफी वाजिब और संतुलित लगी।",
          "फोन पर बातचीत और समन्वय बहुत सहज और सहयोगी रहा।",
          "दाम को लेकर कोई छिपाव नहीं था, सब कुछ पहले ही स्पष्ट कर दिया।",
        ],
      },
      {
        theme: "भरोसा और डिलीवरी",
        snippets: [
          "सोलापुर में ठोस लकड़ी के काम के लिए इनका नाम भरोसेमंद साबित हुआ।",
          "समय पर काम पूरा करके देने की इनकी आदत अच्छी लगी।",
          "स्थानीय ग्राहकों के साथ इनका व्यवहार पारिवारिक और आत्मीय लगा।",
        ],
      },
    ],
  },

  mr: {
    code: "mr",
    name: "Marathi",
    native: "मराठी",
    flag: "🇮🇳",
    writingPersona: "Authentic colloquial Maharashtrian Marathi (सोलापूरी व पश्चिम महाराष्ट्र बोली)",
    showroomThemes: [
      {
        theme: "स्टाफ आणि शोरूमचे वातावरण",
        snippets: [
          "शोरूममधील कामगारांनी कोणतीही घाई न करता सर्व नमुने शांतपणे दाखवले.",
          "लाकडाच्या प्रकारांविषयी त्यांनी दिलेली माहिती अतिशय समर्पक आणि खरी वाटली.",
          "दुकानातील रचना स्वच्छ आणि नमुने नीटनेटके मांडलेले आहेत.",
        ],
      },
      {
        theme: "गुणवत्ता आणि प्रामाणिकपणा",
        snippets: [
          "लाकडाचा कस आणि कामातील सफाई पाहून स्थानिक कारागिरीचा विश्वास बसतो.",
          "साध्या प्लायवूडपेक्षा अस्सल भरभक्कम लाकूड वापरल्याचे प्रत्यक्ष पाहताना जाणवते.",
          "कोणताही खोटा दावा न करता वस्तूची खरी माहिती ग्राहकासमोर मांडतात.",
        ],
      },
      {
        theme: "किंमत आणि ग्राहक सेवा",
        snippets: [
          "मोठमोठ्या ब्रँडेड दुकानांच्या तुलनेत यांचे भाव अतिशय वाजवी आणि परवडणारे आहेत.",
          "फोनवर संपर्क साधल्यावर लगेच योग्य माहिती मिळाली.",
          "किंमतीत कोणतीही लपवाछपवी नसून व्यवहार अगदी चोख वाटला.",
        ],
      },
      {
        theme: "विश्वास आणि डिलिव्हरी",
        snippets: [
          "सोलापूरमध्ये अस्सल लाकडी कामासाठी ही एक भरवशाची जागा वाटते.",
          "सांगितलेल्या वेळेत काम पूर्ण करण्याची यांची पद्धत कौतुकास्पद आहे.",
          "ग्राहकाला आपलेसे करून योग्य सल्ला देण्याची पद्धत मनाला भावली.",
        ],
      },
    ],
  },
};

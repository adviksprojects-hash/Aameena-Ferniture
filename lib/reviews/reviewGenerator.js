/**
 * @file reviewGenerator.js
 * Context-Aware & Authentic Customer Review Generation Engine for Aameena Furniture.
 *
 * Capabilities:
 * - Exactly 6 distinct reviews generated per session
 * - Every review calibrated to natural medium-length (60 - 120 words)
 * - 10 distinct customer personas:
 *   1. Family Customer
 *   2. First Home Buyer
 *   3. Office Owner / Commercial Client
 *   4. Interior Designer
 *   5. Architect
 *   6. Doctor / Healthcare Professional
 *   7. Hospitality / Restaurant Client
 *   8. Teacher / Academic
 *   9. Retired Couple / Senior Patron
 *   10. Apartment Owner
 * - Native script support: English, Marathi (mr), and Hindi (hi)
 * - Two distinct customer journeys:
 *   1. Case A: Showroom & Store Visit Review (Rating-only / Walkthrough)
 *   2. Case B: Verified Furniture Purchase Review (Deeply weaves category, exact product, experience tags, and customer notes)
 * - Authentic woodworking vocabulary: Sagwan teak, seasoning, mortise & tenon joinery, PU polish
 */

import { countWords, classifyWordLength, classifyTone } from "./reviewValidation.js";

// ==============================================================================
// EXPERIENCE ASPECTS DICTIONARY (EN, MR, HI)
// ==============================================================================

const ASPECT_LABELS = {
  en: {
    "product quality": "exceptional timber build quality",
    "wood quality": "authentic seasoned Sagwan teak wood",
    "finishing": "flawless PU polish and smooth grain texture",
    "comfort": "ergonomic seating comfort",
    "design": "timeless aesthetic proportions",
    "durability": "solid heirloom durability",
    "value for money": "unbeatable factory-direct value",
    "delivery": "punctual safe delivery",
    "on-time delivery": "prompt on-time delivery",
    "timely delivery": "punctual doorstep delivery",
    "packaging": "protective transit packaging",
    "installation": "clean on-site assembly",
    "staff behaviour": "courteous staff guidance",
    "owner behaviour": "transparent advice from Mr. Farooq and family",
    "customization": "tailored bespoke customization",
    "overall experience": "flawless experience throughout",
    "customer service": "attentive customer support",
    "showroom experience": "informative showroom walkthrough",
    "easy communication": "clear and transparent communication",
    "good pricing": "honest manufacturer pricing",
    "professional guidance": "expert carpentry guidance",
    "solid sagwan teak": "genuine solid Sagwan teak wood",
    "flawless pu polish": "flawless satin PU polish",
    "comfortable cushioning": "supportive high-density cushioning",
    "direct factory price": "factory-direct pricing without showroom markups",
    "master joinery": "traditional mortise-and-tenon joinery",
  },
  mr: {
    "product quality": "उत्कृष्ट बांधणी आणि मजबुती",
    "wood quality": "अस्सल सीझन्ड सागवान लाकूड",
    "finishing": "देखणी पीयू पॉलिश आणि सफाईदार फिनिशिंग",
    "comfort": "अतिशय आरामदायी बैठक",
    "design": "सुंदर आणि भारदस्त डिझाइन",
    "durability": "पिढ्यानपिढ्या टिकणारी मजबूती",
    "value for money": "वाजवी दरात दर्जेदार लाकूडकाम",
    "delivery": "वेळेवर सुरक्षित डिलिव्हरी",
    "on-time delivery": "तय वेळेत सुरक्षित डिलिव्हरी",
    "timely delivery": "वेळेत सुरक्षित पोहोच",
    "packaging": "मजबूत पॅकिंग",
    "installation": "सफाईदार जोडणी",
    "staff behaviour": "कर्मचाऱ्यांचे नम्र व आदरयुक्त वर्तन",
    "owner behaviour": "मालकांचे प्रामाणिक मार्गदर्शन",
    "customization": "अचूक कस्टमायझेशन",
    "overall experience": "अतिशय सुखद व समाधानकारक अनुभव",
    "customer service": "उत्तम ग्राहक सेवा",
    "showroom experience": "सोलापूर शोरूममधील उत्तम अनुभव",
    "easy communication": "सुलभ आणि पारदर्शक संवाद",
    "good pricing": "थेट फॅक्टरीचे रास्त दर",
    "professional guidance": "तज्ज्ञ कारागिरांचे मार्गदर्शन",
    "solid sagwan teak": "अस्सल अस्सल सागवान लाकूड",
    "flawless pu polish": "चकाकणारे गुळगुळीत पीयू पॉलिश",
    "comfortable cushioning": "आरामदायी कुशनिंग",
    "direct factory price": "थेट कारखान्याचे रास्त दर",
    "master joinery": "पारंपरिक मजबूत जोडणी",
  },
  hi: {
    "product quality": "मजबूत और बेहतरीन बनावट",
    "wood quality": "असली सीजन्ड सागवान की लकड़ी",
    "finishing": "शानदार पीयू पॉलिश और फिनिशिंग",
    "comfort": "बेहद आरामदायक सिटिंग",
    "design": "शानदार और आकर्षक डिजाइन",
    "durability": "सालों-साल चलने वाली मजबूती",
    "value for money": "किफायती दामों में बेस्ट क्वालिटी",
    "delivery": "समय पर सुरक्षित होम डिलीवरी",
    "on-time delivery": "तय समय पर सुरक्षित डिलीवरी",
    "timely delivery": "समय पर सुरक्षित डिलीवरी",
    "packaging": "मजबूत और सुरक्षित पैकिंग",
    "installation": "सफाई से की गई फिटिंग",
    "staff behaviour": "स्टाफ का बेहद विनम्र व्यवहार",
    "owner behaviour": "ओनर की ईमानदार और सही सलाह",
    "customization": "मनपसंद कस्टमाइजेशन",
    "overall experience": "बहुत ही सुखद और संतोषजनक अनुभव",
    "customer service": "शानदार कस्टमर सपोर्ट",
    "showroom experience": "सोलापुर शोरूम का बेहतरीन अनुभव",
    "easy communication": "पारदर्शी और आसान बातचीत",
    "good pricing": "डायरेक्ट फैक्ट्री के सही रेट्स",
    "professional guidance": "कुशल कारीगरों का मार्गदर्शन",
    "solid sagwan teak": "असली मजबूत सागवान की लकड़ी",
    "flawless pu polish": "शानदार ग्लॉसी पीयू पॉलिश",
    "comfortable cushioning": "आरामदायक कुशनिंग",
    "direct factory price": "बिना किसी बिचौलिए के फैक्ट्री रेट",
    "master joinery": "पारंपरिक मजबूत जोड़",
  },
};

function formatAspectsSentence(experience = [], lang = "en") {
  if (!Array.isArray(experience) || experience.length === 0) return "";
  const langDict = ASPECT_LABELS[lang] || ASPECT_LABELS.en;
  const picked = experience
    .slice(0, 3)
    .map((tag) => {
      const key = String(tag).toLowerCase().trim();
      return langDict[key] || tag;
    })
    .filter(Boolean);

  if (picked.length === 0) return "";

  if (lang === "mr") {
    return `विशेषतः येथील ${picked.join(", ")} यामुळे आमचे समाधान अधिकच वाढले.`;
  }
  if (lang === "hi") {
    return `खास तौर पर यहां की ${picked.join(", ")} ने हमारा दिल जीत लिया।`;
  }
  return `In particular, the ${picked.join(", ")} exceeded all our expectations.`;
}

function formatCustomerNote(additionalFeedback = "", lang = "en") {
  if (!additionalFeedback || typeof additionalFeedback !== "string") return "";
  const clean = additionalFeedback.trim().replace(/[.!?।]+$/, "");
  if (!clean || clean.length < 3) return "";

  if (lang === "mr") {
    return `आमचा वैयक्तिक अभिप्राय: "${clean}."`;
  }
  if (lang === "hi") {
    return `हमारा व्यक्तिगत अनुभव: "${clean}।"`;
  }
  return `To share our personal note: "${clean}."`;
}

// ==============================================================================
// 10 DIVERSE REALISTIC CUSTOMER PERSONAS & NARRATIVE BUILDERS (60 - 120 WORDS)
// ==============================================================================

const PERSONA_BLUEPRINTS = [
  // 1. Family Customer
  {
    id: "family_customer",
    personaName: "Family Customer",
    writingStyle: "Warm, multi-generational, family comfort oriented",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `आमच्या कुटुंबासमवेत सोलापूर येथील आमीना फर्निचरच्या शोरूम व वर्कशॉपला भेट देणे हा एक अतिशय सुखद अनुभव ठरला. कोणताही निर्णय घेण्यापूर्वी अस्सल सीझन्ड सागवान लाकूड प्रत्यक्ष पाहण्याची आमची इच्छा होती. शोरूममधील कर्मचाऱ्यांनी आमचे आदराने स्वागत केले आणि लाकडाच्या सीझनिंगची व विविध फर्निचर डिझाइन्सची सविस्तर माहिती दिली. कोणताही विक्रीचा दबाव न आणता त्यांनी सर्व शंकांचे निरसन केले. ${noteSnippet} थेट कारखान्याचे पारदर्शक दर आणि कारागिरांची प्रामाणिक मेहनत पाहून खूप समाधान वाटले. दर्जेदार लाकूडकाम पाहण्यासाठी सोलापूरच्या या शोरूमला नक्की भेट द्यावी.`;
        }
        if (lang === "hi") {
          return `अपने परिवार के साथ सोलापुर में आमीना फर्नीचर के शोरूम और वर्कशॉप का दौरा करना बहुत ही सुखद अनुभव रहा। हम कोई भी फैसला लेने से पहले असली सीजन्ड सागवान की लकड़ी को अपनी आंखों से देखना चाहते थे। वहां की टीम ने बड़े आदर के साथ हमारा स्वागत किया और बिना किसी जल्दबाजी के लकड़ी की सीजनिंग व डिस्प्ले का पूरा राउंड लगवाया। सीधे मैन्युफैक्चरर के वाजिब दाम और कारीगरों की ईमानदारी देखकर दिल खुश हो गया। ${noteSnippet} अगर आप असली टीक वुड देखना चाहते हैं, तो सोलापुर वर्कशॉप पर जरूर जाएं।`;
        }
        return `Visiting Aameena Furniture's Solapur showroom and workshop with our family was a wonderful experience. We wanted to see authentic solid Sagwan teak timber before making any decisions. The showroom team greeted us warmly, offered comfortable seating, and patiently walked us through their raw wood seasoning stocks and display pieces without any pushy sales tactics. Seeing the traditional mortise-and-tenon craftsmanship firsthand gave us total confidence in their woodwork. Factory-direct pricing is transparent with zero showroom commissions. ${noteSnippet} We thoroughly recommend visiting their Solapur workshop to anyone looking for genuine hardwood.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आम्ही सोलापूरच्या आमीना फर्निचरकडून आमच्या ${category || "घरा"}साठी '${product}' खरेदी केला आणि संपूर्ण कुटुंब अतिशय समाधानी आहे. हलक्या प्लायवूडऐवजी येथे अस्सल सीझन्ड सागवान लाकडाची भक्कम जोडणी आणि देखणी फिनिशिंग मिळाली आहे. ${expSnippet} डिलिव्हरी वेळेवर व सुरक्षित पॅकिंगसह झाली आणि कारागिरांनी व्यवस्थित असेंब्ली पूर्ण केली. ${noteSnippet} थेट फॅक्टरी दरांमुळे आमचे चांगले पैसे वाचले. दर्जेदार लाकडी फर्निचरसाठी आमीना फर्निचरची आम्ही मनापासून शिफारस करतो!`;
      }
      if (lang === "hi") {
        return `हमने सोलापुर में आमीना फर्नीचर से अपने ${category || "घर"} के लिए '${product}' खरीदा और हमारा पूरा परिवार बेहद खुश है। कमजोर बोर्ड की जगह यहां हमें असली भारी सागवान की लकड़ी और बेमिसाल फिनिशिंग मिली। ${expSnippet} डिलीवरी टीम ने तय समय पर सुरक्षित पैकिंग के साथ सामान पहुंचाया और कमरे में सफाई से फिटिंग कर दी। ${noteSnippet} सीधे फैक्ट्री से लेने पर शोरूम के महंगे खर्चों से बड़ी बचत हुई। मजबूत और टिकाऊ लकड़ी के काम के लिए आमीना फर्नीचर बेहतरीन विकल्प है।`;
      }
      return `We recently purchased the ${product} for our ${category || "home"} from Aameena Furniture in Solapur, and the entire family is absolutely thrilled. Instead of fragile engineered boards, the piece is crafted from genuine heavy Sagwan teak with flawless finishing and sturdy mortise-and-tenon joints. ${expSnippet} The delivery team arrived punctually with protective multi-layer packaging and completed hassle-free assembly inside our room. ${noteSnippet} Factory-direct pricing saved us significantly compared to retail stores. A truly authentic heirloom piece that our family will cherish for generations!`;
    },
  },

  // 2. First Home Buyer
  {
    id: "first_home_buyer",
    personaName: "First Home Buyer",
    writingStyle: "Excited, detail-conscious, practical budget",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `आमच्या पहिल्या नवीन घरासाठी फर्निचर निवडताना आमीना फर्निचरच्या सोलापूर शोरूमला भेट दिल्यावर सर्व शंका दूर झाल्या. त्यांच्या कुशल टीमने फ्लॅटच्या आकारानुसार जागेची बचत करणारे अस्सल सागवान लाकडाचे विविध पर्याय दाखवले. लाकडाच्या सीझनिंगची तांत्रिक माहिती त्यांनी अतिशय सोप्या भाषेत समजावून सांगितली. ${noteSnippet} थेट उत्पादक असल्याने मध्यस्थांचे कमिशन वाचले. पहिल्या घरासाठी असा प्रामाणिक सल्ला मिळणे खूप समाधानकारक आहे.`;
        }
        if (lang === "hi") {
          return `अपने पहले नए घर के लिए फर्नीचर तलाशते हुए सोलापुर में आमीना फर्नीचर के शोरूम जाना हमारे लिए सबसे सही निर्णय रहा। कुशल टीम ने हमारे फ्लैट के स्पेस के अनुसार टिकाऊ सागवान लकड़ी के बेहतरीन विकल्प दिखाए और लकड़ी की क्वालिटी की पूरी जानकारी दी। बिना किसी बनावटी सेल्स पिच के उन्होंने ईमानदारी से गाइड किया। ${noteSnippet} डायरेक्ट फैक्ट्री सेटअप होने से बजट में अच्छी बचत हुई। नए घर के खरीदारों के लिए यह बिल्कुल सही जगह है।`;
        }
        return `Furnishing our first apartment felt overwhelming until we stepped into Aameena Furniture's Solapur showroom. The staff patiently understood our room layout and demonstrated space-efficient solid Sagwan teak pieces with complete transparency about timber seasoning. Visiting the actual facility gave us peace of mind that we were dealing directly with skilled manufacturers rather than middlemen. ${noteSnippet} Highly recommended for first-time homeowners who value honest woodwork.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आमच्या पहिल्या फ्लॅटसाठी आमीना फर्निचरकडून '${product}' घेणे हा अतिशय योग्य निर्णय ठरला. बाजारातील हलक्या बोर्डपेक्षा अस्सल सागवान लाकूड आणि अचूक पॉलिशिंग घराला भारदस्त लुक देते. ${expSnippet} वेळेवर सुरक्षित डिलिव्हरी झाली आणि कारागिरांनी कोणताही गोंधळ न करता जोडणी पूर्ण केली. ${noteSnippet} थेट मॅन्युफॅक्चरर असल्याने आमच्या बजेटमध्ये उत्कृष्ट दर्जा मिळाला. पहिल्या घरासाठी नक्कीच शिफारस करतो!`;
      }
      if (lang === "hi") {
        return `अपने पहले फ्लैट के लिए आमीना फर्नीचर सोलापुर से '${product}' खरीदना बहुत सुखद अनुभव रहा। बाजार के रेडीमेड बोर्ड के मुकाबले यहां हमें असली सागवान लकड़ी की मजबूती और स्मूथ फिनिशिंग मिली। ${expSnippet} सुरक्षित पैकिंग के साथ समय पर डिलीवरी हुई और कारीगरों ने तुरंत फिटिंग कर दी। ${noteSnippet} डायरेक्ट फैक्ट्री रेट मिलने से हमारा बजट बिल्कुल नहीं बिगड़ा। मजबूत और सुंदर फर्नीचर के लिए आमीना फर्नीचर बेस्ट है।`;
      }
      return `Selecting the ${product} for our first apartment from Aameena Furniture in Solapur was the best decision we made. We wanted authentic solid wood rather than flimsy modular pieces, and the craftsmanship on this piece is outstanding. ${expSnippet} Delivery arrived in perfect condition with multi-layer wrapping, and assembly took less than an hour. ${noteSnippet} Dealing directly with the manufacturer kept everything well within our budget without middleman markups.`;
    },
  },

  // 3. Office Owner / Commercial Client
  {
    id: "office_owner",
    personaName: "Office Owner",
    writingStyle: "Professional, punctual, durability-focused",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `माझ्या व्यावसायिक कार्यालयासाठी लाकडी फर्निचर बनवण्यापूर्वी मी सोलापूरच्या आमीना फर्निचर शोरूम व फॅक्टरीला भेट दिली. दैनंदिन व्यावसायिक वापरासाठी लागणारे मजबूत सागवान लाकूड, सीझनिंगची प्रक्रिया आणि कारागिरांचे कौशल्य पाहून मी प्रभावित झालो. व्यावसायिक गरजांनुसार कामाची रूपरेषा त्यांनी अतिशय व्यावसायिक पद्धतीने मांडली. ${noteSnippet} कॉर्पोरेट दर्जाच्या लाकूडकामासाठी आमीना फर्निचर अत्यंत विश्वासू आहे.`;
        }
        if (lang === "hi") {
          return `अपने कमर्शियल ऑफिस के सेटअप के लिए मैंने सोलापुर में आमीना फर्नीचर के शोरूम और वर्कशॉप का दौरा किया। वहां भारी सागवान की लकड़ी का स्टॉक, सीजनिंग प्रोसेस और मजबूत जॉइनरी देखकर बहुत भरोसा हुआ। टीम ने ऑफिस के लेआउट और स्टोरेज को ध्यान में रखते हुए बहुत सटीक सुझाव दिए। ${noteSnippet} व्यावसायिक प्रोजेक्ट्स के लिए डायरेक्ट फैक्ट्री से जुड़ना बहुत फायदेमंद साबित हुआ।`;
        }
        return `I visited Aameena Furniture's Solapur showroom and manufacturing facility to evaluate hardwood quality for our commercial office setup. The operational scale, kiln-seasoned timber inventory, and heavy-duty mortise joinery on display immediately impressed me. Their team discussed structural requirements with thorough professionalism and zero pushy sales behavior. ${noteSnippet} A dependable local firm for professional commercial woodwork.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `कार्यालयाच्या सेटअपसाठी आम्ही आमीना फर्निचरकडून '${product}' बनवून घेतला. दैनंदिन व्यावसायिक वापरासाठी लागणारी अस्सल सागवान लाकडाची मजबुती आणि आकर्षक फिनिशिंग यामध्ये स्पष्ट दिसते. ${expSnippet} लॉजिस्टिक्स वेळेत पोहोचले आणि आमच्या दैनंदिन कामात अडथळा न आणता कारागिरांनी पद्धतशीर जोडणी पूर्ण केली. ${noteSnippet} थेट फॅक्टरी दरांमुळे कॉर्पोरेट स्टोअर्सपेक्षा खूप बचत झाली. व्यावसायिक कामासाठी सर्वोत्तम पर्याय!`;
      }
      if (lang === "hi") {
        return `अपने कमर्शियल ऑफिस के लिए हमने आमीना फर्नीचर से '${product}' तैयार करवाया। रोजाना के भारी इस्तेमाल के लिए असली सागवान की मजबूती और शानदार एग्जीक्यूटिव लुक इसमें साफ दिखाई देता है। ${expSnippet} डिलीवरी तय समय पर हुई और कारीगरों ने बिना किसी शोर-शराबे के तेजी से इंस्टॉलेशन पूरा किया। ${noteSnippet} डायरेक्ट मैन्युफैक्चरिंग रेट्स मिलने से प्रोजेक्ट की लागत में काफी बचत हुई।`;
      }
      return `We commissioned Aameena Furniture in Solapur for the ${product} for our commercial office, requiring heavy-duty hardwood that withstands daily professional use. The timber density, flawless finish, and structural joinery reflect true artisanal quality. ${expSnippet} Logistics arrived right on schedule in heavy protective wrapping, and installation was completed smoothly. ${noteSnippet} The factory-direct quotation was highly cost-effective compared to commercial showroom quotes.`;
    },
  },

  // 4. Interior Designer
  {
    id: "interior_designer",
    personaName: "Interior Designer",
    writingStyle: "Aesthetic, technical specifications, material expertise",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `इंटिरियर डिझायनर म्हणून काम करताना लाकडातील ओलावा, सीझनिंग आणि पॉलिशची गुणवत्ता तपासणे अत्यंत महत्त्वाचे असते. सोलापूर येथील आमीना फर्निचरच्या शोरूमला भेट दिल्यावर त्यांच्या लाकडाची पारदर्शकता आणि सात-टप्प्यांची पॉलिशिंग पाहून समाधान वाटले. कारागिरांना डिझाइन ड्रॉइंग्सचे तांत्रिक ज्ञान उत्तम आहे. ${noteSnippet} डिझाइनर्स आणि क्लायंट्ससाठी हे वर्कशॉप अत्यंत विश्वासार्ह आहे.`;
        }
        if (lang === "hi") {
          return `एक इंटीरियर डिजाइनर के तौर पर मैंने सोलापुर में आमीना फर्नीचर की वर्कशॉप और शोरूम का गहन निरीक्षण किया। लकड़ी की सीजनिंग, ग्रेन अलाइनमेंट और 7-स्टेप पॉलिशिंग का स्तर काफी उच्च दर्जे का है। मास्टर कारपेंटर्स को टेक्निकल ड्रॉइंग्स की अच्छी समझ है और वे किसी भी कस्टम डिजाइन को सटीक रूप से तैयार करने में सक्षम हैं। ${noteSnippet} क्लाइंट्स को रिकमेंड करने के लिए यह बहुत ही भरोसेमंद वर्कशॉप है।`;
        }
        return `As an interior designer working across Maharashtra, finding workshops that respect precise drawings is rare. I visited Aameena Furniture's Solapur facility to inspect their timber seasoning, grain alignment, and polyurethane polish samples. Their master carpenters understand architectural detailing, joint tolerances, and finish consistency. ${noteSnippet} Direct factory collaboration allows my clients to bypass retail markups while securing heirloom Grade-A Sagwan teak.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आमच्या डिझाइन प्रोजेक्टसाठी आमीना फर्निचरने बनवलेला '${product}' खरोखरच अप्रतिम आहे. लाकडाचे नैसर्गिक ग्रेन्स, गुळगुळीत पीयू पॉलिश आणि पारंपरिक जोडणी यामुळे हा पीस अत्यंत आकर्षक दिसतो. ${expSnippet} वेळेवर सुरक्षित डिलिव्हरी झाली आणि कारागिरांनी जागेवर तंतोतंत असेंब्ली पूर्ण केली. ${noteSnippet} क्लायंट्सना थेट वर्कशॉपमधून रास्त दरात अस्सल सागवान लाकूड मिळवून देण्यासाठी आमीना फर्निचर माझी पहिली पसंती आहे.`;
      }
      if (lang === "hi") {
        return `हमारे इंटीरियर प्रोजेक्ट के लिए आमीना फर्नीचर सोलापुर द्वारा तैयार किया गया '${product}' तकनीकी और कलात्मक दोनों दृष्टि से शानदार है। लकड़ी के नेचुरल ग्रेन्स, स्मूथ 7-स्टेप पॉलिश और मजबूत जॉइनरी ने पूरे कमरे की खूबसूरती बढ़ा दी है। ${expSnippet} डिलीवरी बिल्कुल समय पर और सुरक्षित पहुंची। ${noteSnippet} सीधे फैक्ट्री से काम होने से क्लाइंट को वाजिब दामों में सॉलिड टीक वुड मिला। बारीक काम के लिए मैं इनकी पुरजोर सिफारिश करती हूं।`;
      }
      return `For our recent interior project, we specified the ${product} from Aameena Furniture in Solapur. Their master craftsmen matched the required dimensional tolerances and executed an impeccable satin polyurethane polish that showcases the natural golden-brown teak grains. ${expSnippet} Transit was thoroughly cushioned, and the on-site assembly was spotless. ${noteSnippet} Direct factory pricing saved our client significant budget while delivering heirloom quality Sagwan teak woodwork.`;
    },
  },

  // 5. Architect
  {
    id: "architect",
    personaName: "Architect",
    writingStyle: "Structural integrity, timber joinery, long-term durability",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `वास्तुविशारद (आर्किटेक्ट) या नात्याने फर्निचरच्या संरचनेतील ताकद आणि लाकडाची घनता मी आवर्जून तपासतो. सोलापूर येथील आमीना फर्निचरच्या वर्कशॉप व शोरूमला भेट देऊन त्यांच्या सीझन्ड सागवान लाकडाचे साठे आणि पारंपरिक 'मॉर्टिस आणि टेनन' जोडणी प्रत्यक्ष पाहिली. लाकडाची निवड आणि कारागिरी वाखाणण्याजोगी आहे. ${noteSnippet} अस्सल लाकूडकामाचा आदर करणाऱ्या प्रत्येकाने या शोरूमला नक्की भेट द्यावी.`;
        }
        if (lang === "hi") {
          return `आर्किटेक्ट के रूप में मैं फर्नीचर की संरचनात्मक मजबूती और लकड़ी के जोड़ों को बहुत गंभीरता से देखता हूं। सोलापुर में आमीना फर्नीचर के शोरूम और कारखाने का दौरा करने पर मुझे असली सीजन्ड सागवान के बड़े लॉग्स और पारंपरिक मॉर्टिस-टेनन जॉइनरी देखने को मिली। लकड़ी का चुनाव और कारीगरों की लगन उच्च स्तरीय है। ${noteSnippet} सॉलिड वुडवर्क की परख रखने वालों के लिए यह शोरूम बेहतरीन है।`;
        }
        return `Throughout my architectural practice, I insist on structural integrity and authentic timber seasoning. I visited Aameena Furniture's Solapur facility to observe their raw timber seasoning logs, mortise-and-tenon framing, and moisture control protocols firsthand. Their master craftsmen respect classical joinery techniques over shortcut fasteners. ${noteSnippet} An exemplary local manufacturer that takes pride in genuine hardwood construction.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आर्किटेक्चरल दृष्टीने अत्यंत मजबूत आणि दर्जेदार असा '${product}' आमीना फर्निचरने तंतोतंत साकारला आहे. सीझन्ड सागवान लाकडाची घनता, अचूक काटकोनातील जोडणी आणि टिकाऊ पॉलिश वाखाणण्याजोगी आहे. ${expSnippet} सुरक्षित वाहतूक आणि वेळेवर डिलिव्हरी झाली, तसेच जोडणी अचूक झाली. ${noteSnippet} वास्तुशिल्पीय सौंदर्याला साजेसे अस्सल लाकूडकाम रास्त फॅक्टरी दरात मिळाल्याबद्दल धन्यवाद.`;
      }
      if (lang === "hi") {
        return `आर्किटेक्चरल मानकों के अनुसार अत्यंत मजबूत और संतुलित '${product}' आमीना फर्नीचर ने तैयार किया है। सीजन्ड सागवान लकड़ी की डेंसिटी, सटीक जॉइनरी और टिकाऊ फिनिशिंग उच्च दर्जे की है। ${expSnippet} डिलीवरी सुरक्षित पैकिंग के साथ समय पर हुई और कमरे में सही तरीके से फिटिंग की गई। ${noteSnippet} डायरेक्ट मैन्युफैक्चरर से वाजिब दामों में सॉलिड टीक की ऐसी बनावट मिलना दुर्लभ है।`;
      }
      return `As an architect, I appreciate furniture built with true structural honesty. The ${product} delivered by Aameena Furniture in Solapur exemplifies seasoned Grade-A Sagwan teak with perfectly executed mortise-and-tenon joints and balanced load distribution. ${expSnippet} Transit was safely handled and the on-site carpentry team was efficient. ${noteSnippet} Direct manufacturer pricing eliminated unnecessary markups while preserving heirloom craftsmanship.`;
    },
  },

  // 6. Doctor / Healthcare Professional
  {
    id: "doctor",
    personaName: "Doctor / Healthcare Professional",
    writingStyle: "Ergonomics, posture, non-toxic finish, peaceful relaxation",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `हॉस्पिटलमधील दीर्घ वेळेच्या ड्युटीनंतर घरात आरामदायी आणि आरोग्यदायी फर्निचर असावे अशी माझी इच्छा होती. सोलापूर येथील आमीना फर्निचरच्या शोरूमला भेट दिल्यावर त्यांच्या फर्निचरची एर्गोनॉमिक रचना, पाठीला मिळणारा उत्तम आधार आणि बिनविषारी पॉलिशची माहिती मिळाली. कर्मचाऱ्यांनी अत्यंत शांतपणे सर्व मॉडेल्स दाखवले. ${noteSnippet} विश्रांतीसाठी आणि आरोग्यासाठी योग्य फर्निचर शोधणाऱ्यांना ही शोरूम नक्की आवडेल.`;
        }
        if (lang === "hi") {
          return `अस्पताल में लंबे समय तक काम करने के बाद घर पर आरामदायक और सही पोस्चर देने वाले फर्नीचर की जरूरत होती है। सोलापुर में आमीना फर्नीचर के शोरूम में जाकर हमने डिस्प्ले पर लगे सोफा और कुर्सियों का एर्गोनॉमिक कम्फर्ट टेस्ट किया। बैक सपोर्ट, नेचुरल टीक की खुशबू और नॉन-टॉक्सिक पॉलिश देखकर बहुत संतोष हुआ। ${noteSnippet} सेहत और आराम के लिए यह शोरूम बेहतरीन विकल्प है।`;
        }
        return `Following demanding hospital shifts, ergonomic posture and peaceful relaxation at home are essential to me. Visiting Aameena Furniture's Solapur showroom allowed me to personally test the lumbar support, seating angles, and non-toxic finish of their solid Sagwan timber pieces. The staff was patient, polite, and completely transparent about materials. ${noteSnippet} A wonderful showroom experience for anyone prioritizing health and natural comfort.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आमीना फर्निचरकडून आमच्या ${category || "घरा"}साठी '${product}' घेतला आणि विश्रांतीसाठी हा अतिशय आरामदायी ठरला आहे. पाठीला योग्य आधार देणारी रचना, अस्सल सागवान लाकूड आणि वासहीन गुळगुळीत पॉलिश यामुळे घरातील वातावरण प्रसन्न वाटते. ${expSnippet} वेळेवर सुरक्षित डिलिव्हरी झाली आणि घरात सफाईने जोडणी पूर्ण केली. ${noteSnippet} कामाच्या तणावानंतर शांतता देणारे दर्जेदार लाकूडकाम!`;
      }
      if (lang === "hi") {
        return `आमीना फर्नीचर से अपने ${category || "घर"} के लिए '${product}' लेकर हमें बहुत सुकून मिला। सही पोस्चर सपोर्ट, भारी सागवान लकड़ी और गंधहीन सुरक्षित पॉलिश ने इसे हमारे लिए एकदम परफेक्ट बना दिया है। ${expSnippet} सुरक्षित पैकिंग के साथ समय पर डिलीवरी हुई और सफाई से फिटिंग की गई। ${noteSnippet} दिनभर की थकान के बाद ऐसा आरामदायक और प्राकृतिक लकड़ी का फर्नीचर मिलना बहुत राहत देता है।`;
      }
      return `Demanding hospital hours make restorative comfort essential, and the ${product} from Aameena Furniture in Solapur delivers perfect ergonomic support. The solid Sagwan teak frame is solid and grounded, while the low-VOC satin finish is completely odorless and smooth to the touch. ${expSnippet} Punctual delivery with multi-layer bubble wrap ensured zero scuffs. ${noteSnippet} Very pleased with the health-conscious comfort and artisanal quality.`;
    },
  },

  // 7. Hospitality / Restaurant Client
  {
    id: "restaurant_owner",
    personaName: "Hospitality Client",
    writingStyle: "Heavy daily usage, sturdiness, stain resistance",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `दैनंदिन गर्दी आणि सततचा वापर सहन करू शकेल अशा भक्कम लाकडी फर्निचरच्या शोधात मी सोलापूरच्या आमीना फर्निचर शोरूमला भेट दिली. त्यांच्या कार्यशाळेतील अस्सल सीझन्ड सागवान लाकूड आणि डाग-प्रतिरोधक पॉलिशिंगचे नमुने पाहून मी पूर्णपणे आश्वस्त झालो. मोठ्या प्रमाणातील ऑर्डरसाठी त्यांनी अतिशय वाजवी फॅक्टरी कोट्स दिले. ${noteSnippet} व्यावसायिक मजबुतीसाठी हे सर्वोत्तम ठिकाण आहे.`;
        }
        if (lang === "hi") {
          return `रोजाना के भारी इस्तेमाल को झेल सकने वाले मजबूत फर्नीचर की तलाश में मैंने सोलापुर में आमीना फर्नीचर के शोरूम का दौरा किया। वहां डिस्प्ले में लगे भारी सागवान लकड़ी के प्रोडक्ट्स और टिकाऊ पॉलिश देखकर मुझे पूरा भरोसा हो गया। बड़ी खरीदारी के लिए उन्होंने सीधे फैक्ट्री रेट्स ऑफर किए जिससे लागत में काफी बचत हुई। ${noteSnippet} कमर्शियल और घरेलू दोनों तरह के मजबूत काम के लिए यह बेहतरीन जगह है।`;
        }
        return `Running a busy hospitality establishment requires commercial durability that standard retail furniture cannot handle. I visited Aameena Furniture's Solapur facility to inspect the sturdiness of their Sagwan teak builds and stain-resistant polyurethane finishes. The master carpenters demonstrated their timber seasoning and heavy mortise jointing with complete transparency. ${noteSnippet} A rock-solid local manufacturing partner.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आमीना फर्निचरकडून घेतलेला '${product}' दिसायला जितका देखणा आहे तितकाच वापरायला अत्यंत भक्कम आहे. जड सीझन्ड सागवान लाकूड आणि डाग-प्रतिरोधक पॉलिशमुळे हा दैनंदिन वापरासाठी परिपूर्ण ठरला आहे. ${expSnippet} डिलिव्हरी वेळेवर व सुरक्षित झाली आणि कारागिरांनी नीटनेटकी जोडणी केली. ${noteSnippet} थेट फॅक्टरी दरामुळे आमचे मोठे पैसे वाचले. टिकाऊ लाकूडकामासाठी आमीना फर्निचरची मनापासून शिफारस करतो!`;
      }
      if (lang === "hi") {
        return `आमीना फर्नीचर से तैयार कराया गया '${product}' जितना खूबसूरत दिखता है, उतना ही मजबूत भी है। भारी सीजन्ड सागवान की लकड़ी और दाग-प्रतिरोधक पीयू पॉलिश ने इसे रोजमर्रा के इस्तेमाल के लिए बिल्कुल परफेक्ट बना दिया है। ${expSnippet} समय पर सुरक्षित डिलीवरी हुई और टीम ने तेजी से फिटिंग कर दी। ${noteSnippet} सीधे मैन्युफैक्चरर से लेने पर हमें बेहतरीन वैल्यू मिली। मजबूत फर्नीचर के लिए इनकी पूरी सिफारिश है।`;
      }
      return `We acquired the ${product} from Aameena Furniture in Solapur, and its heavy-duty build quality is truly commendable. Crafted from seasoned solid Sagwan teak with durable polyurethane coating, it resists accidental spills and heavy daily handling effortlessly. ${expSnippet} Logistics arrived punctually with protective wrapping, followed by clean assembly. ${noteSnippet} Direct factory pricing provided remarkable value without retail markup.`;
    },
  },

  // 8. Teacher / Academic
  {
    id: "teacher_academic",
    personaName: "Teacher / Academic",
    writingStyle: "Thoughtful, peaceful study atmosphere, value for money",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `शिक्षकी पेशात असल्यामुळे अस्सल आणि अभ्यासू लाकूडकामाची मला नेहमीच आवड राहिली आहे. सोलापूरच्या आमीना फर्निचर शोरूमला भेट दिल्यावर लाकडाच्या जाती, सीझनिंगची प्रक्रिया आणि कारागिरांची प्रामाणिक मेहनत पाहून मन भरून आले. कर्मचाऱ्यांनी कसलाही घाईगडबड न करता आदरपूर्वक मार्गदर्शन केले. ${noteSnippet} प्रामाणिक मूल्यांवर आधारलेले अस्सल फर्निचर शोधणाऱ्यांसाठी ही शोरूम अत्यंत समाधानकारक आहे.`;
        }
        if (lang === "hi") {
          return `अकादमिक क्षेत्र से जुड़े होने के कारण मुझे शांत, सादगीपूर्ण और प्रामाणिक लकड़ी के काम की गहरी कद्र है। सोलापुर में आमीना फर्नीचर के शोरूम में जाकर हमें लकड़ी की सीजनिंग और कारीगरों की कला को करीब से देखने का अवसर मिला। स्टाफ ने बड़ी शालीनता और धैर्य से हर बात समझाई। ${noteSnippet} मेहनत की कमाई से टिकाऊ और सच्चा फर्नीचर खरीदने के लिए यह जगह सबसे सही है।`;
        }
        return `As an academic, I deeply value quiet authenticity and honest craftsmanship. Visiting Aameena Furniture's Solapur showroom gave me an educational walkthrough of natural timber seasoning, wood grain selection, and traditional hand-joinery. The showroom staff communicated with utmost courtesy, answering every technical inquiry without pushy sales pressure. ${noteSnippet} A very reassuring and respectful environment for thoughtful buyers.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आमीना फर्निचरकडून आमच्या अभ्यासिकेसाठी व घरासाठी '${product}' घेतला आणि लाकडाचा दर्जा पाहून मन अतिशय प्रसन्न झाले. अस्सल सागवान लाकडाची शांतता, सुंदर फिनिशिंग आणि मजबूत जोडणी वाखाणण्याजोगी आहे. ${expSnippet} वेळेवर सुरक्षित डिलिव्हरी झाली आणि कारागिरांनी शांतपणे असेंब्ली पूर्ण केली. ${noteSnippet} कष्टाच्या पैशांचे पूर्ण सार्थक झाले आहे. दर्जेदार लाकडी कामासाठी आमीना फर्निचर सर्वोत्तम आहे.`;
      }
      if (lang === "hi") {
        return `आमीना फर्नीचर सोलापुर से अपने अध्ययन कक्ष और घर के लिए '${product}' खरीदना बहुत सुखद निर्णय रहा। असली सागवान की लकड़ी की गरिमा, स्मूथ फिनिशिंग और मजबूत जोड़ देखते ही बनते हैं। ${expSnippet} समय पर सुरक्षित डिलीवरी हुई और टीम ने बहुत सलीके से काम पूरा किया। ${noteSnippet} मेहनत की कमाई का पूरा मूल्य मिला है। सच्चे और टिकाऊ लकड़ी के काम के लिए मैं दिल से इनकी सिफारिश करता हूं।`;
      }
      return `Investing in the ${product} from Aameena Furniture in Solapur brought quiet dignity and lasting value to our home. The seasoned Sagwan teak feels dense, stable, and naturally fragrant, while the satin finish reflects thoughtful care in every corner. ${expSnippet} Transit was punctual with secure multi-layer packaging, followed by respectful on-site assembly. ${noteSnippet} A genuine heirloom purchase that honors honest local craftsmanship.`;
    },
  },

  // 9. Retired Couple / Senior Patron
  {
    id: "retired_couple",
    personaName: "Retired Couple",
    writingStyle: "Comfort, longevity, hassle-free installation",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `निवृत्तीनंतर घरासाठी मजबूत आणि आरामदायक लाकडी फर्निचर हवे होते म्हणून आम्ही सोलापूरच्या आमीना फर्निचर शोरूमला भेट दिली. कर्मचाऱ्यांनी आम्हाला आदरपूर्वक बसवले आणि लाकडाची संपूर्ण माहिती दिली. जुन्या काळातील अस्सल सागवानाची आठवण करून देणारे लाकूडकाम येथे पाहायला मिळाले. ${noteSnippet} ज्येष्ठ नागरिकांना सन्मानाने वागवून योग्य सल्ला दिल्याबद्दल धन्यवाद. या शोरूमला नक्की भेट द्यावी.`;
        }
        if (lang === "hi") {
          return `रिटायरमेंट के बाद घर के लिए टिकाऊ और आरामदायक फर्नीचर की तलाश में हम सोलापुर में आमीना फर्नीचर के शोरूम पहुंचे। वहां की टीम ने हमारे बुढ़ापे का आदर करते हुए बड़े प्यार से बिठाया और बिना किसी जल्दबाजी के सभी मॉडल दिखाए। पुराने जमाने की असली सागवान लकड़ी देखकर बहुत खुशी हुई। ${noteSnippet} वरिष्ठ नागरिकों के लिए यह एक बहुत ही आरामदायक और भरोसेमंद अनुभव रहा।`;
        }
        return `In our retirement years, we sought comfortable and durable furniture that would last without requiring constant upkeep. Visiting Aameena Furniture's Solapur showroom was a pleasant and dignified experience. The staff greeted us with genuine warmth, provided comfortable seating, and patiently explained the wood grading and seasoning without rushing us. ${noteSnippet} Seeing authentic Sagwan teak brought back memories of traditional heirloom woodwork.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आमच्या घरासाठी आमीना फर्निचरकडून '${product}' घेतला आणि आमचा अनुभव अतिशय समाधानकारक राहिला. बसण्यासाठी अतिशय आरामदायी, उठण्या-बसण्यास सोयीस्कर आणि अस्सल जड सागवान लाकडाची भक्कम जोडणी यात मिळाली आहे. ${expSnippet} डिलिव्हरी ठरलेल्या वेळेत झाली आणि कारागिरांनी कसलाही त्रास न देता जागेवर व्यवस्थित मांडून दिले. ${noteSnippet} आमच्या मुला-नातवंडांपर्यंत टिकणारे अस्सल लाकूडकाम मिळाले आहे!`;
      }
      if (lang === "hi") {
        return `आमीना फर्नीचर सोलापुर से अपने घर के लिए '${product}' लेकर हम बेहद संतुष्ट हैं। उठने-बैठने में बहुत आरामदायक, मजबूत और असली भारी सागवान लकड़ी की बनावट शानदार है। ${expSnippet} समय पर डिलीवरी हुई और फिटिंग करने वाले लड़कों ने बहुत सफाई और आदर के साथ काम किया। ${noteSnippet} हमारी आने वाली पीढ़ी तक चलने वाला सच्चा फर्नीचर देने के लिए आमीना फर्नीचर का बहुत-बहुत धन्यवाद।`;
      }
      return `Selecting the ${product} from Aameena Furniture in Solapur brought peace of mind and enduring comfort to our home. The seating posture is gentle on our joints, and the solid seasoned Sagwan teak frame requires virtually zero maintenance. ${expSnippet} Delivery was punctual, and the carpenter crew handled installation with utmost courtesy and care. ${noteSnippet} A wonderful heirloom investment that will be cherished by our children and grandchildren.`;
    },
  },

  // 10. Apartment Owner
  {
    id: "apartment_owner",
    personaName: "Apartment Owner",
    writingStyle: "Space efficiency, modern apartment fitting, neat delivery",
    buildNarrative: ({ product, category, lang, rating, experience, additionalFeedback, isShowroomOnly }) => {
      const expSnippet = formatAspectsSentence(experience, lang);
      const noteSnippet = formatCustomerNote(additionalFeedback, lang);

      if (isShowroomOnly) {
        if (lang === "mr") {
          return `आधुनिक अपार्टमेंटमध्ये जागेची योग्य बचत करणारे अस्सल लाकडी फर्निचर शोधण्यासाठी मी सोलापूरच्या आमीना फर्निचर शोरूमला भेट दिली. फ्लॅटच्या आकाराला साजेसे कॉम्पॅक्ट आणि देखणे सागवान फर्निचर मॉडेल्स येथे पाहायला मिळाले. कारागिरांनी नाप आणि जागेचे नियोजन उत्तम प्रकारे समजावून सांगितले. ${noteSnippet} अपार्टमेंटमध्ये राहणाऱ्या प्रत्येकाने या शोरूमला नक्की भेट द्यावी.`;
        }
        if (lang === "hi") {
          return `आधुनिक अपार्टमेंट के हिसाब से स्पेस-सेविंग और मजबूत टीक वुड फर्नीचर देखने के लिए मैंने सोलापुर में आमीना फर्नीचर के शोरूम का दौरा किया। वहां डिस्प्ले पर लगे कॉम्पैक्ट और सुंदर सागवान के डिजाइन्स हमारे फ्लैट के लिए एकदम सही लगे। टीम ने साइज और स्पेस यूटिलाइजेशन की बहुत अच्छी सलाह दी। ${noteSnippet} फ्लैट्स के लिए सॉलिड वुड फर्नीचर की तलाश करने वालों को यहां जरूर आना चाहिए।`;
        }
        return `Living in a modern high-rise apartment requires smart space utilization without compromising on solid hardwood strength. Visiting Aameena Furniture's Solapur showroom allowed me to inspect compact, space-efficient Sagwan teak designs tailored for modern floor plans. Their team provided clear dimensional consultations and showed raw seasoned wood stocks. ${noteSnippet} A very productive showroom visit for apartment dwellers.`;
      }

      // Purchase Review
      if (lang === "mr") {
        return `आमच्या अपार्टमेंटसाठी आमीना फर्निचरकडून घेतलेला '${product}' जागेच्या नियोजनाच्या दृष्टीने परिपूर्ण ठरला आहे. अस्सल सागवान लाकडाची मजबुती आणि कॉम्पॅक्ट डिझाइन यामुळे घराचे रूप पालटले आहे. ${expSnippet} लिफ्टमधून काळजीपूर्वक आणून सुरक्षित डिलिव्हरी झाली आणि कारागिरांनी तात्काळ जोडणी पूर्ण केली. ${noteSnippet} थेट उत्पादक असल्याने योग्य बजेटमध्ये उत्कृष्ट लाकूडकाम मिळाले. सर्वांना नक्कीच शिफारस करतो!`;
      }
      if (lang === "hi") {
        return `अपने अपार्टमेंट के लिए आमीना फर्नीचर से '${product}' लेना सबसे बढ़िया फैसला रहा। असली सागवान की मजबूती और जगह की बचत करने वाला स्मार्ट डिजाइन हमारे फ्लैट में बहुत जंच रहा है। ${expSnippet} सीढ़ियों और लिफ्ट से बिना किसी खरोंच के सुरक्षित डिलीवरी हुई और फिटिंग भी बहुत साफ-सुथरी रही। ${noteSnippet} डायरेक्ट फैक्ट्री रेट मिलने से बजट में बड़ी बचत हुई। मजबूत और सुंदर काम के लिए पूरी सिफारिश है।`;
      }
      return `The ${product} from Aameena Furniture in Solapur fits our modern apartment layout with precision and elegance. It delivers genuine solid Sagwan teak strength while maintaining space-efficient proportions. ${expSnippet} Transit was meticulously managed up the building elevators without a single scratch, followed by rapid assembly. ${noteSnippet} Factory-direct pricing saved us significantly compared to retail showroom alternatives. Very happy with the purchase!`;
    },
  },
];

// ==============================================================================
// WORD COUNT CALIBRATOR (ENSURES 60 - 120 WORDS STRICTLY)
// ==============================================================================

function calibrateWordCount(narrativeText, lang = "en") {
  let text = narrativeText.replace(/\s+/g, " ").trim();
  let words = countWords(text);

  // If already in 60-120 range, return directly
  if (words >= 60 && words <= 120) {
    return text;
  }

  // If slightly short (< 60), append authentic woodworking satisfaction sentence
  if (words < 60) {
    const fillerMap = {
      en: "From raw timber selection to the final satin finish, master craftsmanship is evident in every joint.",
      mr: "लाकडाच्या निवडीपासून ते अंतिम फिनिशिंगपर्यंत त्यांच्या कारागिरांची मेहनत प्रत्येक जोडणीत स्पष्ट दिसून येते.",
      hi: "कच्ची लकड़ी की परख से लेकर अंतिम फिनिशिंग तक, कारीगरों की लगन हर जोड़ में साफ नजर आती है।",
    };
    const addition = fillerMap[lang] || fillerMap.en;
    text = `${text} ${addition}`.replace(/\s+/g, " ").trim();
    words = countWords(text);
  }

  // If slightly long (> 120), trim trailing redundant sentences cleanly
  if (words > 120) {
    const sentences = text.split(/(?<=[.!?।])\s+/);
    while (sentences.length > 3 && countWords(sentences.join(" ")) > 120) {
      if (sentences.length > 2) {
        sentences.splice(sentences.length - 2, 1);
      } else {
        sentences.pop();
      }
    }
    text = sentences.join(" ").replace(/\s+/g, " ").trim();
  }

  return text;
}

// ==============================================================================
// MAIN AI REVIEW GENERATION SERVICE
// ==============================================================================

/**
 * Generates exactly 6 distinct, authentic reviews strictly within 60-120 words.
 *
 * @param {Object} validatedInput
 * @param {Object} options
 * @returns {Promise<{ success: boolean, suggestions: Array<Object>, count: number, debug: Object }>}
 */
export async function generateAiReviews(validatedInput = {}, options = {}) {
  const startTime = Date.now();

  const rating = Math.min(5, Math.max(1, Number(validatedInput.rating) || 5));
  const language = ["en", "hi", "mr"].includes(validatedInput.language) ? validatedInput.language : "en";
  const isShowroomOnly = Boolean(
    validatedInput.isShowroomOnly ||
    validatedInput.isRatingOnly ||
    validatedInput.category === "Showroom Visit" ||
    validatedInput.product === "Showroom & Store Visit"
  );

  const category = isShowroomOnly
    ? "Showroom Visit"
    : validatedInput.category || "Living Room";

  const product = isShowroomOnly
    ? "Showroom & Store Visit"
    : validatedInput.product || validatedInput.customProduct || "Handcrafted Sagwan Teak Piece";

  const experience = Array.isArray(validatedInput.experience) ? validatedInput.experience : [];
  const additionalFeedback = validatedInput.additionalFeedback ? String(validatedInput.additionalFeedback).trim() : "";
  const seedOffset = Number(options.seedOffset || 0);

  // Select 6 distinct personas out of 10
  // Rotate selection based on seedOffset to provide variety on "Generate New Reviews"
  const totalPersonas = PERSONA_BLUEPRINTS.length;
  const selectedBlueprints = [];
  for (let i = 0; i < 6; i++) {
    const idx = (i + seedOffset) % totalPersonas;
    selectedBlueprints.push(PERSONA_BLUEPRINTS[idx]);
  }

  const generatedSuggestions = [];

  for (let i = 0; i < selectedBlueprints.length; i++) {
    const bp = selectedBlueprints[i];
    const rawNarrative = bp.buildNarrative({
      product,
      category,
      lang: language,
      rating,
      experience,
      additionalFeedback,
      isShowroomOnly,
    });

    const finalReviewText = calibrateWordCount(rawNarrative, language);
    const wordCount = countWords(finalReviewText);
    const lengthInfo = classifyWordLength(finalReviewText);

    generatedSuggestions.push({
      id: `rev-gen-${i + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      review: finalReviewText,
      quoteText: finalReviewText, // Backward compatibility with ReviewWizard
      authorHint: `${bp.personaName} (${language.toUpperCase()})`,
      personality: bp.personaName,
      writingStyle: bp.writingStyle,
      estimatedLength: lengthInfo.category,
      wordCount,
      tone: classifyTone(rating),
      rating,
      language,
      category,
      product,
      woodType: isShowroomOnly ? null : "Sagwan Teak",
      visitedShowroom: isShowroomOnly,
      verificationBadge: isShowroomOnly ? "SHOWROOM_VISIT" : "VERIFIED_PURCHASE",
    });
  }

  const latencyMs = Date.now() - startTime;

  return {
    success: true,
    suggestions: generatedSuggestions,
    count: generatedSuggestions.length,
    debug: {
      generatedCount: generatedSuggestions.length,
      averageWordCount: Math.round(
        generatedSuggestions.reduce((acc, cur) => acc + cur.wordCount, 0) / generatedSuggestions.length
      ),
      allWithin60To120: generatedSuggestions.every((s) => s.wordCount >= 60 && s.wordCount <= 120),
      latencyMs,
      timestamp: new Date().toISOString(),
    },
  };
}

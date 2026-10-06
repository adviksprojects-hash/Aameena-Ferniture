/**
 * Opening sentence templates and perspective generators
 * for Aameena Furniture Humanized AI Review Engine.
 * Supports both Context-Aware (Case 1) and Rating-Only Showroom (Case 2).
 */

export const REVIEW_OPENINGS = {
  // ============================================================
  // CASE 1: CONTEXT-AWARE OPENINGS (Specific furniture item / collection)
  // ============================================================
  contextAware: {
    en: [
      (item) => `We recently purchased our ${item} from Aameena Furniture in Solapur.`,
      (item) => `Visited last week to look for a ${item} and finalized our order right away.`,
      (item) => `Got our ${item} delivered a few days back, and we have been using it daily.`,
      (item) => `Finally found the right ${item} after checking multiple furniture shops in town.`,
      (item) => `After comparing several stores across Solapur, we chose Aameena for our ${item}.`,
      (item) => `This was our first purchase from them for a ${item}, and the process was smooth.`,
      (item) => `Had a good experience picking out our ${item} directly from their workshop.`,
      (item) => `My parents bought this ${item} for our living space after inspecting the timber.`,
      (item) => `I ordered a ${item} tailored to our room measurements.`,
      (item) => `We renovated our home recently and selected this ${item} as the center piece.`,
      (item) => `Looked around for a genuine solid wood ${item} and stopped by Aameena.`,
      (item) => `Decided on their ${item} based on a local friend's recommendation.`,
    ],
    hi: [
      (item) => `हमने हाल ही में सोलापुर की आमीना फर्नीचर से ${item} खरीदा।`,
      (item) => `घर के लिए ${item} ढूंढते हुए पिछले हफ्ते इनके शोरूम गए थे।`,
      (item) => `कुछ दिन पहले हमारे घर ${item} की डिलीवरी हुई और सामान बहुत सही लगा।`,
      (item) => `सोलापुर में कई जगह देखने के बाद आखिरकार हमें मनपसंद ${item} यहां मिला।`,
      (item) => `बाजार में कई दुकानों से तुलना करने के बाद हमने ${item} के लिए इन्हें चुना।`,
      (item) => `इनके यहां से ${item} की यह हमारी पहली खरीदारी थी और अनुभव अच्छा रहा।`,
      (item) => `वर्कशॉप में खुद जाकर कारीगरी देखने के बाद हमने ${item} की बुकिंग की।`,
      (item) => `माता-पिता ने लकड़ी की मजबूती जांचने के बाद यह ${item} पसंद किया।`,
      (item) => `घर के कमरों के साइज के हिसाब से हमने यह ${item} तैयार करवाया।`,
      (item) => `घर का रिनोवेशन चल रहा था, उसी दौरान इस ${item} की खरीदारी की।`,
    ],
    mr: [
      (item) => `आम्ही नुकतीच सोलापूरच्या आमीना फर्निचरमधून ${item} खरेदी केली.`,
      (item) => `गेल्या आठवड्यात ${item} पाहण्यासाठी यांच्या शोरूमला भेट दिली आणि काम लगेच पसंत पडले.`,
      (item) => `आमची ${item} काही दिवसांपूर्वी घरपोच मिळाली, प्रत्यक्ष वापरताना समाधान वाटते.`,
      (item) => `सोलापूर बाजारात फिरल्यानंतर अखेर आम्हाला हवी तशी ${item} येथे सापडली.`,
      (item) => `इतर दुकानांशी तुलना केल्यानंतर लाकडाचा दर्जा पाहून आम्ही ${item} ची निवड केली.`,
      (item) => `आमीना फर्निचरमधून ${item} घेण्याचा आमचा हा पहिलाच अनुभव होता आणि तो चांगला ठरला.`,
      (item) => `त्यांच्या कारखान्यात जाऊन लाकूड आणि काम पाहून आम्ही ही ${item} ठरवली.`,
      (item) => `घरच्या ज्येष्ठांनी लाकडाची खात्री करून ही ${item} घरात आणण्याचा निर्णय घेतला.`,
      (item) => `खोलीच्या मापाप्रमाणे आम्ही ही ${item} तयार करून घेतली.`,
      (item) => `घराचे नूतनीकरण करताना आम्ही या ${item} ची खास निवड केली.`,
    ],
  },

  // ============================================================
  // CASE 2: RATING-ONLY SHOWROOM OPENINGS (No product / category invented)
  // ============================================================
  showroomOnly: {
    en: [
      () => `Visited Aameena Furniture's Solapur showroom last week to check their solid wood collection.`,
      () => `Had a pleasant experience browsing through their furniture display in Solapur.`,
      () => `Stopped by their workshop to understand their woodwork quality and pricing.`,
      () => `After hearing good things from neighbors, we dropped into their store to look around.`,
      () => `Spent an hour exploring their hardwood range and interacting with the craft team.`,
      () => `Visited their Solapur outlet to compare timber options and get a feel for their work.`,
      () => `Checked out their collection in Solapur; straightforward dealing without pushy sales tactics.`,
      () => `Walked into their showroom recently and was impressed by the transparency regarding materials.`,
      () => `Had a very honest consultation regarding home furnishing options at their store.`,
      () => `First time visiting their Solapur setup and found the staff knowledgeable and patient.`,
    ],
    hi: [
      () => `पिछले हफ्ते सोलापुर में आमीना फर्नीचर के शोरूम जाकर इनका काम देखा।`,
      () => `दुकान में जाकर लकड़ी का कलेक्शन देखने का अनुभव काफी अच्छा रहा।`,
      () => `सोलापुर वर्कशॉप में जाकर इनकी कारीगरी और लकड़ी की क्वालिटी समझी।`,
      () => `दोस्तों की सलाह पर हम इनकी दुकान में फर्नीचर देखने पहुंचे थे।`,
      () => `दुकान पर काफी समय बिताया और स्टाफ से अलग-अलग वैरायटी के बारे में जानकारी ली।`,
      () => `सोलापुर की इस दुकान पर जाकर लगा कि यहां काम में ईमानदारी है।`,
      () => `बिना किसी दिखावे के सीधा और सच्चा काम देखने को मिला।`,
      () => `स्टाफ ने बिना किसी दबाव के सभी सवालों के जवाब तसल्ली से दिए।`,
    ],
    mr: [
      () => `गेल्या आठवड्यात सोलापूरच्या आमीना फर्निचर शोरूमला भेट देऊन त्यांचे लाकडी काम पाहिले.`,
      () => `दुकानात प्रत्यक्ष जाऊन फर्निचरचे नमुने आणि व्हरायटी पाहण्याचा अनुभव चांगला राहिला.`,
      () => `सोलापूरमधील त्यांच्या वर्कशॉपला भेट देऊन लाकडाचा दर्जा आणि जोडणीचे काम तपासले.`,
      () => `परिचितांच्या सांगण्यावरून आम्ही यांच्या दुकानात चौकशीसाठी गेलो होतो.`,
      () => `शोरूममध्ये फिरताना कर्मचाऱ्यांनी लाकडाबद्दल दिलेली माहिती खूप मार्गदर्शक ठरली.`,
      () => `सोलापुरात प्रामाणिकपणे लाकडी काम करणाऱ्या दुकानांपैकी हे एक वाटले.`,
      () => `कुठलाही बडेजाव न करता ग्राहकाला समजून घेऊन काम समजावून सांगितले.`,
      () => `पहिल्याच भेटीत तिथली पारदर्शकता आणि स्वच्छता मनाला भावली.`,
    ],
  },
};

/**
 * @file autoReplyGenerator.js
 * Automated Owner Response Generator for Aameena Furniture.
 *
 * Generates concise, warm, professional responses from the business owner/care team
 * tailored to any type of customer review (positive, neutral, negative):
 * - Short length (1-2 sentences)
 * - Directly addresses reviewer by name: "Thank you for your review, {name}!"
 * - Sincerely appreciates them for their feedback and support
 *
 * Supports English (en), Marathi (mr), and Hindi (hi).
 */

export function generateAutoOwnerReply({
  authorName = "Valued Patron",
  rating = 5,
  language = "en",
  productName = "",
} = {}) {
  const cleanName = String(authorName || "Valued Patron").trim();
  const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

  // Marathi (मराठी)
  if (language === "mr") {
    if (numRating >= 4) {
      return `आपला अभिप्राय दिल्याबद्दल धन्यवाद, ${cleanName}! आमीना फर्निचरवर विश्वास दाखवल्याबद्दल आणि आपल्या बहुमोल प्रतिसादाबद्दल आम्ही आपले मनापासून आभारी आहोत.`;
    } else if (numRating === 3) {
      return `आपला अभिप्राय दिल्याबद्दल धन्यवाद, ${cleanName}! आपल्या बहुमोल प्रतिसादाबद्दल आम्ही आभारी आहोत आणि आमची सोलापूर टीम सदैव आपल्या सेवेसाठी तत्पर आहे.`;
    } else {
      return `आपला अभिप्राय दिल्याबद्दल धन्यवाद, ${cleanName}. आम्ही आपल्या प्रतिसादाची कदर करतो आणि आपल्या समस्येचे निरसन करण्यासाठी आमची टीम सदैव तयार आहे.`;
    }
  }

  // Hindi (हिन्दी)
  if (language === "hi") {
    if (numRating >= 4) {
      return `समीक्षा साझा करने के लिए धन्यवाद, ${cleanName}! आमीना फर्नीचर पर आपके भरोसे और बहुमूल्य फीडबैक की हम दिल से सराहना करते हैं।`;
    } else if (numRating === 3) {
      return `अपनी समीक्षा साझा करने के लिए धन्यवाद, ${cleanName}! आपके बहुमूल्य फीडबैक की हम सराहना करते हैं और किसी भी सहायता के लिए हमारी टीम सदैव उपलब्ध है।`;
    } else {
      return `अपनी समीक्षा साझा करने के लिए धन्यवाद, ${cleanName}। हम आपके फीडबैक की सराहना करते हैं और आपकी किसी भी समस्या के समाधान के लिए हमारी टीम सदैव तत्पर है।`;
    }
  }

  // English (Default - Universal & Gracious for all ratings)
  if (numRating >= 4) {
    return `Thank you for your review, ${cleanName}! We truly appreciate your feedback and support for Aameena Furniture.`;
  } else if (numRating === 3) {
    return `Thank you for your review, ${cleanName}! We truly appreciate your valuable feedback, and our team is always here to assist you.`;
  } else {
    return `Thank you for your review, ${cleanName}. We appreciate you sharing your feedback, and our Solapur team is here to help resolve any concerns.`;
  }
}

/**
 * Creates structured owner response metadata for DB storage
 */
export function createAutoOwnerReplyData({
  authorName,
  rating = 5,
  language = "en",
  productName = "",
  responderName = "Aameena Furniture Care Team",
} = {}) {
  const replyText = generateAutoOwnerReply({
    authorName,
    rating,
    language,
    productName,
  });

  const now = new Date();

  return {
    ownerReply: replyText,
    ownerReplyDate: now,
    ownerReplyBy: responderName,
    ownerReplyRole: "OWNER",
    ownerReplyUpdatedAt: now,
    ownerReplyHistory: [
      {
        reply: replyText,
        repliedBy: `${responderName} (Automated)`,
        repliedAt: now.toISOString(),
        role: "OWNER",
      },
    ],
  };
}

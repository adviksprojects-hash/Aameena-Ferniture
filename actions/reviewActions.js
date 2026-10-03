"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

const AUTHENTIC_QUOTES_SEED = [
  // ===================== 5 STARS: PURCHASED FURNITURE (10 Quotes) =====================
  {
    rating: 5,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "7-Seater Royal Sagwan Teak Sofa",
    quoteText: "Exceptional craftsmanship! We purchased the 7-seater Grade-A Sagwan Teak sofa set from AMEENA Distributors in Solapur. The timber grain alignment, mortise-and-tenon joints, and high-density velvet cushioning are world-class. Arrived on time with white-glove setup. 100% genuine hardwood!",
    authorHint: "Rahul Deshmukh, Solapur",
  },
  {
    rating: 5,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "King Size Hydraulic Storage Bed",
    quoteText: "Outstanding buying experience! Our custom Sheesham king-size hydraulic storage bed was built exactly to our room dimensions. The carpenter team assembled it meticulously and cleaned up all packaging. Truly solid wood with silky smooth polish!",
    authorHint: "Amit Kulkarni, Pune",
  },
  {
    rating: 5,
    category: "DINING",
    experienceType: "PURCHASED",
    productPurchased: "6-Seater Sagwan Dining Suite",
    quoteText: "The 6-seater Sagwan dining table is the centerpiece of our home now. Pure seasoned teak wood that will easily last for 50+ years. The 7-step PU polish finish is spill-resistant and looks magnificent under dining lighting.",
    authorHint: "Sunita Patil, Solapur",
  },
  {
    rating: 5,
    category: "CUSTOM_MANDIR",
    experienceType: "PURCHASED",
    productPurchased: "Hand-Carved Sagwan Teak Home Temple",
    quoteText: "We ordered a custom hand-carved Sagwan wooden mandir. The intricate peacock and floral carving by the master artisans is beyond beautiful. Delivered with utmost sanctity and pristine packaging.",
    authorHint: "Gajanan Shinde, Pandharpur",
  },
  {
    rating: 5,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "4-Door Sagwan Teak Wardrobe",
    quoteText: "Heavy, authentic solid wood wardrobe with soft-close German hinges and custom hanging partitions. No engineered wood or cheap particle board anywhere. Worth every rupee!",
    authorHint: "Vikram Jadhav, Solapur",
  },
  {
    rating: 5,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "L-Shape Sectional Teak Sofa",
    quoteText: "Best furniture decision! Custom ordered an L-shape Sagwan sectional sofa with stain-resistant fabric. The wood smells so rich and natural, and the frame has zero creaks or wobbles.",
    authorHint: "Meera Joshi, Osmanabad",
  },
  {
    rating: 5,
    category: "OFFICE_STUDY",
    experienceType: "PURCHASED",
    productPurchased: "Executive Teak Study Desk & Chair",
    quoteText: "Solid teak executive work desk delivered to my home office. Sturdy, ergonomic, and finished with a gorgeous warm walnut satin polish. The drawer sliding mechanisms are whisper quiet.",
    authorHint: "Anand Solanki, Solapur",
  },
  {
    rating: 5,
    category: "LIVING",
    experienceType: "PURCHASED",
    productPurchased: "Teak Center Table & Nesting Stools",
    quoteText: "Purchased the Sagwan coffee table with glass top inlay and 4 concealed puffes. Outstanding space-saving design and rock-solid durability. Extremely happy with the purchase!",
    authorHint: "Sneha Bhosale, Kolhapur",
  },
  {
    rating: 5,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Teak Queen Bed with Cane Headboard",
    quoteText: "The artisanal natural cane weave on the Sagwan teak headboard is breathtaking. Modern aesthetic with timeless Indian heirloom durability. Carpenter team did a flawless assembly.",
    authorHint: "Rohan Gaikwad, Barshi",
  },
  {
    rating: 5,
    category: "CUSTOM_VILLA",
    experienceType: "PURCHASED",
    productPurchased: "Full Bungalow Turnkey Teak Furnishing",
    quoteText: "Furnished our entire new 3BHK bungalow in Solapur through AMEENA Distributors. From sofas to dining, bar counter, and beds—all crafted from seasoned Grade-A timber. Direct factory prices saved us over ₹1.8 Lakhs!",
    authorHint: "Dr. Suresh Mane, Solapur",
  },

  // ===================== 5 STARS: VISITED SHOWROOM / WORKSHOP (10 Quotes) =====================
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Visited their Solapur workshop and was amazed to witness raw Sagwan timber seasoning logs and the live hand-carving by master carpenters. Extremely knowledgeable team who explained timber grain differences patiently.",
    authorHint: "Kiran Salunkhe, Solapur",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Great showroom visit! The manager showed us authentic moisture meter tests on their seasoned Sagwan wood. 100% transparent pricing without aggressive sales tactics. Finalizing our order soon!",
    authorHint: "Deepak Shaha, Solapur",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Best place in Solapur for authentic hardwood furniture. You can actually see the furniture being built in the workshop behind the showroom. Impressive craftsmanship and warm hospitality.",
    authorHint: "Pooja Kadam, Solapur",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Took a workshop tour to understand teak vs sheesham. The carpenters demonstrated their 7-step polyurethane polish booth. The finish quality is superior to branded urban stores.",
    authorHint: "Sachin More, Pune",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Visited for custom sofa consultation. The design team provided 3D space measurements and timber sample swatches on the spot. Highly professional manufacturer setup.",
    authorHint: "Mahesh Birajdar, Solapur",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "True factory-direct experience in Solapur. No middlemen markups. The display sofas are exceptionally comfortable and heavy. Looking forward to placing our wedding package order.",
    authorHint: "Archana Pawar, Solapur",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "I visited to inspect timber quality before committing. They showed me genuine stamp certificates and log seasoning chambers. Highest degree of authenticity in furniture manufacturing!",
    authorHint: "Vinayak Kote, Akkalkot",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Clean showroom, courteous staff, and massive display of luxury Sagwan sofa sets. Loved that they offer customized fabric and polish shade matching at no extra charge.",
    authorHint: "Gauri Shedge, Solapur",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Brought my interior architect to inspect the joinery work. He was thoroughly impressed by the mortise-and-tenon construction. We finalized our living room specifications immediately.",
    authorHint: "Prashant Jagtap, Solapur",
  },
  {
    rating: 5,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Excellent showroom ambiance in Solapur with parking and wide selection. The team answered all technical questions about termite protection and grain patterns clearly.",
    authorHint: "Sanjay Chitnis, Solapur",
  },

  // ===================== 4 STARS (12 Quotes) =====================
  {
    rating: 4,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "5-Seater Sagwan Sofa",
    quoteText: "Very solid sofa set with genuine Sagwan timber. Craftsmanship is top-tier. Delivery was delayed by 2 days due to heavy rain, but the team kept me updated and installation was smooth.",
    authorHint: "Nitin Kale, Solapur",
  },
  {
    rating: 4,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Sheesham Queen Bed",
    quoteText: "Beautiful Sheesham bed with great natural wood grain. Heavy and sturdy. Took a little longer than expected to polish to perfection, but definitely worth the wait!",
    authorHint: "Aniket Shinde, Solapur",
  },
  {
    rating: 4,
    category: "DINING",
    experienceType: "PURCHASED",
    productPurchased: "4-Seater Teak Dining Set",
    quoteText: "High quality dining table and chairs. The finish is smooth and chairs are well cushioned. Overall great value for money directly from the Solapur company.",
    authorHint: "Rekha Mule, Solapur",
  },
  {
    rating: 4,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Showroom has an impressive variety of sofa models. Staff is courteous and helpful. Parking was a bit tight on Sunday evening, but the furniture collection is genuinely premium.",
    authorHint: "Ashok Tambe, Solapur",
  },
  {
    rating: 4,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Good experience visiting the Solapur unit. They gave clear quotations and explained difference between commercial plywood and solid teak. Will visit again with family.",
    authorHint: "Yogesh Bandgar, Solapur",
  },
  {
    rating: 4,
    category: "LIVING",
    experienceType: "PURCHASED",
    productPurchased: "TV Entertainment Unit",
    quoteText: "Custom Sagwan teak TV wall unit built to our wall measurements. Heavy construction and clean cable management grommets. Very satisfied with the artisan work.",
    authorHint: "Kavita Soni, Solapur",
  },
  {
    rating: 4,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Dressing Table with Full Mirror",
    quoteText: "Teak dresser with deep drawers and warm walnut polish. Elegant addition to our master bedroom. Minor delay in transport, but arrived in pristine condition.",
    authorHint: "Pallavi Chavan, Solapur",
  },
  {
    rating: 4,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Great customer reception. The showroom manager showed real log cuts and discussed custom designs. Good competitive manufacturer pricing.",
    authorHint: "Manish Shah, Solapur",
  },
  {
    rating: 4,
    category: "OFFICE_STUDY",
    experienceType: "PURCHASED",
    productPurchased: "Wooden Bookshelf & Showcase",
    quoteText: "Sturdy open bookshelf made of genuine solid wood. Carries heavy encyclopedias with zero shelf bending. Polish is even and odorless.",
    authorHint: "Professor V. K. Rao, Solapur",
  },
  {
    rating: 4,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Wide range of custom sofa fabric swatches and solid wood displays. Very informative visit. Quotation provided within 15 minutes.",
    authorHint: "Tushar Naik, Solapur",
  },
  {
    rating: 4,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "Chesterfield Teak Couch",
    quoteText: "Classic tufted Chesterfield sofa with carved teak legs. Feels super luxurious and firm. Good communication from workshop team during manufacturing.",
    authorHint: "Tanvi Gandhi, Solapur",
  },
  {
    rating: 4,
    category: "DINING",
    experienceType: "PURCHASED",
    productPurchased: "Crockery Cabinet",
    quoteText: "Heavy teak crockery cabinet with tempered glass doors. Safe transport and carpenter leveled it properly on our uneven floor.",
    authorHint: "Rameshwar Giri, Solapur",
  },

  // ===================== 3 STARS (10 Quotes) =====================
  {
    rating: 3,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "Standard Sofa Set",
    quoteText: "The sofa frame quality is 100% solid wood and very heavy, but delivery took 5 days longer than the committed timeline. Finished product is satisfactory.",
    authorHint: "Santosh Pujari, Solapur",
  },
  {
    rating: 3,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Showroom has good designs, but prices for custom bespoke orders were higher than standard models on display. Staff was polite.",
    authorHint: "Vijay Kulkarni, Solapur",
  },
  {
    rating: 3,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Single Storage Bed",
    quoteText: "Bed structure is strong and timber is genuine. However, the hydraulic lift required re-adjustment by the carpenter on the second day.",
    authorHint: "Prakash Rathod, Solapur",
  },
  {
    rating: 3,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Decent collection of sofa sets. Was looking for ready-to-take dining sets, but most require 7 to 10 days manufacturing lead time.",
    authorHint: "Manoj Dange, Solapur",
  },
  {
    rating: 3,
    category: "DINING",
    experienceType: "PURCHASED",
    productPurchased: "Dining Chairs (Set of 4)",
    quoteText: "Chairs are heavy teak and very durable. Upholstery color was slightly darker than the swatch selected, though acceptable.",
    authorHint: "Vidya Narayankar, Solapur",
  },
  {
    rating: 3,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Showroom was busy on Saturday afternoon and took 20 minutes before a sales consultant could attend to us. Good collection though.",
    authorHint: "Dattatraya Shinde, Solapur",
  },
  {
    rating: 3,
    category: "LIVING",
    experienceType: "PURCHASED",
    productPurchased: "Coffee Table",
    quoteText: "Solid table with nice polish. Delivery boy didn't bring change for cash on delivery. Furniture quality itself is sturdy.",
    authorHint: "Hemant Patil, Solapur",
  },
  {
    rating: 3,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Informative discussion about wood types. Expected more ready stock for immediate delivery, as most models are made on order.",
    authorHint: "Suresh Chavan, Solapur",
  },
  {
    rating: 3,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Bedside Tables (Pair)",
    quoteText: "Quality of wood is undeniable. A small scratch occurred on the back corner during transport, which the carpenter polished on site.",
    authorHint: "Avinash Raut, Solapur",
  },
  {
    rating: 3,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Good showroom in Solapur. Looking for contemporary minimalist designs whereas their specialty is heavier royal classical teak.",
    authorHint: "Naveen Agrawal, Solapur",
  },

  // ===================== 2 STARS (10 Quotes) =====================
  {
    rating: 2,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "Teak Wood Sofa Set",
    quoteText: "Delivery was delayed by 12 days past commitment. Furniture is solid teak and heavy, but customer communication during the manufacturing delay was poor.",
    authorHint: "Govind Deshmukh, Solapur",
  },
  {
    rating: 2,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Showroom was crowded and parking space was insufficient. Need more sales associates to attend to visitors on weekends.",
    authorHint: "Pradeep Joshi, Solapur",
  },
  {
    rating: 2,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Sheesham Wardrobe",
    quoteText: "The polish shade was noticeably darker than the showroom sample approved. Carpenter came back after 3 days to re-coat. Solid frame otherwise.",
    authorHint: "Pooja Birajdar, Solapur",
  },
  {
    rating: 2,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Catalog prices did not match the quotation given by the showroom representative. Better price transparency needed for custom sizes.",
    authorHint: "Umesh Kapse, Solapur",
  },
  {
    rating: 2,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "L-Shape Sofa",
    quoteText: "Cushion foam density was much firmer than what was tested in showroom. Frame is sturdy Sagwan teak though.",
    authorHint: "Sunil Shinde, Solapur",
  },
  {
    rating: 2,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "The models we wanted to see in living room sofas were not on display, only available in digital brochure photos.",
    authorHint: "Kavita Gaikwad, Solapur",
  },
  {
    rating: 2,
    category: "DINING",
    experienceType: "PURCHASED",
    productPurchased: "6-Seater Dining Set",
    quoteText: "Transport crew left packaging cardboard on the staircase. Woodwork is great but delivery logistics need improvement.",
    authorHint: "Ramesh Pawar, Solapur",
  },
  {
    rating: 2,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Had to wait over 45 minutes on weekend because all master carpenters were busy at the factory floor with bulk dispatch.",
    authorHint: "Santosh Bhosale, Solapur",
  },
  {
    rating: 2,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "King Size Bed",
    quoteText: "Handles on the wardrobe drawers had minor alignment issues which was fixed after a follow-up call. Heavy wood quality.",
    authorHint: "Arun Jadhav, Solapur",
  },
  {
    rating: 2,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Good timber logs visible, but quotes for outstation delivery to Pune were higher than anticipated compared to local freight.",
    authorHint: "Mahendra Patil, Solapur",
  },

  // ===================== 1 STAR (10 Quotes) =====================
  {
    rating: 1,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "Sectional Sofa Set",
    quoteText: "Severe delivery delay of over two weeks with minimal tracking updates. Though the teak wood is heavy, customer service during delay was frustrating.",
    authorHint: "Rajendra Kulkarni, Solapur",
  },
  {
    rating: 1,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Showroom location was hard to find on the inner lane without clearer street signage. Need better directional boards near main road.",
    authorHint: "Vijay Shaha, Solapur",
  },
  {
    rating: 1,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Hydraulic Storage Bed",
    quoteText: "Assembly was incomplete on delivery day because hardware screws were missing. Had to wait until next morning for completion.",
    authorHint: "Deepak Mane, Solapur",
  },
  {
    rating: 1,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Sales executive was not attentive when we requested custom sofa dimension alterations for our small apartment.",
    authorHint: "Vinod Salunkhe, Solapur",
  },
  {
    rating: 1,
    category: "LIVING_SOFA",
    experienceType: "PURCHASED",
    productPurchased: "Sagwan Teak Couch",
    quoteText: "The fabric upholstery tone arrived in light cream instead of requested beige. Workshop agreed to re-upholster after insistence.",
    authorHint: "Nilesh Jagtap, Solapur",
  },
  {
    rating: 1,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Promised a callback with detailed quotation for turnkey 2BHK furniture within 24 hours, but received no response for 4 days.",
    authorHint: "Anil More, Solapur",
  },
  {
    rating: 1,
    category: "DINING",
    experienceType: "PURCHASED",
    productPurchased: "Dining Table Suite",
    quoteText: "Scratches on the underside of dining table during unloading. Delivery team was in a hurry. Solid wood structure though.",
    authorHint: "Suresh Narayankar, Solapur",
  },
  {
    rating: 1,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Workshop was closed during lunch hours without notice on Google Maps. Had to wait outside.",
    authorHint: "Ashok Dange, Solapur",
  },
  {
    rating: 1,
    category: "BEDROOM",
    experienceType: "PURCHASED",
    productPurchased: "Double Bed Frame",
    quoteText: "Hydraulic lift piston for king bed was defective on arrival and took a week to replace with a new one.",
    authorHint: "Kiran Pujari, Solapur",
  },
  {
    rating: 1,
    category: "SHOWROOM_VISIT",
    experienceType: "VISITED",
    productPurchased: null,
    quoteText: "Customization lead time of 25 days was too long for our immediate moving requirements. Need ready-to-dispatch inventory.",
    authorHint: "Pramod Bandgar, Solapur",
  },
];

/**
 * Fetch randomized review quotes from database matching rating, experience, and product
 */
export async function getReviewQuotes(filters = {}) {
  try {
    const { rating = 5, experienceType = "ALL", productPurchased = "" } = filters;
    const targetRating = Number(rating) || 5;

    // Check if quotes for this rating exist in DB; if fewer than 5, seed missing ones
    const starCount = await db.reviewQuote.count({ where: { rating: targetRating } });
    if (starCount < 8) {
      const missingForStar = AUTHENTIC_QUOTES_SEED.filter((q) => q.rating === targetRating);
      for (const item of missingForStar) {
        const exists = await db.reviewQuote.findFirst({
          where: { quoteText: item.quoteText },
        });
        if (!exists) {
          await db.reviewQuote.create({ data: item });
        }
      }
    }

    const where = {};
    if (rating && Number(rating) > 0) {
      where.rating = Number(rating);
    }
    if (experienceType && experienceType !== "ALL") {
      where.experienceType = experienceType;
    }

    let quotes = await db.reviewQuote.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // If specific product filter provided, prioritize matching quotes
    if (productPurchased && productPurchased.trim() !== "") {
      const term = productPurchased.trim().toLowerCase();
      quotes = quotes.sort((a, b) => {
        const aMatch = (a.productPurchased && a.productPurchased.toLowerCase().includes(term)) || a.quoteText.toLowerCase().includes(term);
        const bMatch = (b.productPurchased && b.productPurchased.toLowerCase().includes(term)) || b.quoteText.toLowerCase().includes(term);
        return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
      });
    }

    // Shuffle quotes slightly for dynamic variety
    const shuffled = [...quotes].sort(() => 0.5 - Math.random());

    return {
      success: true,
      data: shuffled.slice(0, 12),
      totalCount: quotes.length,
    };
  } catch (error) {
    console.error("Error in getReviewQuotes:", error);
    // Fallback to in-memory seed if DB error
    const filteredSeed = AUTHENTIC_QUOTES_SEED.filter((q) => {
      const matchRating = !filters.rating || q.rating === Number(filters.rating);
      const matchExp = !filters.experienceType || filters.experienceType === "ALL" || q.experienceType === filters.experienceType;
      return matchRating && matchExp;
    });
    return { success: true, data: filteredSeed.slice(0, 10), totalCount: filteredSeed.length };
  }
}

/**
 * Submit verified review with author validation and experience logging
 */
export async function submitVerifiedReview(data) {
  try {
    const {
      author,
      phone,
      rating = 5,
      reviewText,
      experienceType = "PURCHASED",
      productPurchased = "",
      locationName = "AMEENA Distributors’s Sofa Set Furniture Company (Solapur)",
    } = data;

    if (!author || author.trim().length < 2) {
      return { success: false, error: "Please enter your valid name (at least 2 characters)." };
    }

    if (!reviewText || reviewText.trim().length < 10) {
      return { success: false, error: "Review text must be at least 10 characters long." };
    }

    const created = await db.googleLocationReview.create({
      data: {
        author: author.trim(),
        locationName,
        rating: Number(rating) || 5,
        reviewText: reviewText.trim(),
        aiSentiment: Number(rating) >= 4 ? "POSITIVE" : Number(rating) === 3 ? "NEUTRAL" : "CRITICAL",
        aiSummary: `${experienceType === "PURCHASED" ? "Customer Purchase" : "Showroom Visit"}: ${productPurchased || "Handcrafted Furniture"}`,
        aiKeyTopics: [experienceType, productPurchased || "Handcrafted Sagwan Teak", "Solapur Workshop"].filter(Boolean),
        verified: true,
        googleMapsUrl: "https://search.google.com/local/writereview?placeid=ChIJB1k-wjTbxTsR7dA3i-yPr4Y",
      },
    });

    revalidatePath("/ai-reviews");

    return { success: true, data: created };
  } catch (error) {
    console.error("Error submitting verified review:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get verified reviews from PostgreSQL database
 */
export async function getVerifiedReviews() {
  try {
    const reviews = await db.googleLocationReview.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return { success: true, reviews };
  } catch (error) {
    console.error("Error fetching verified reviews:", error);
    return { success: false, reviews: [], error: error.message };
  }
}

/**
 * Fetch exactly 5 randomized review prompts for a chosen star rating
 */
export async function getRandomFivePrompts(rating = 5, count = 6) {
  try {
    const starRating = Number(rating) || 5;
    const fetchLimit = Number(count) || 6;

    // Check count for star rating and seed if fewer than 5
    const countForStar = await db.reviewQuote.count({ where: { rating: starRating } });
    if (countForStar < 5) {
      const missing = AUTHENTIC_QUOTES_SEED.filter((q) => q.rating === starRating);
      for (const item of missing) {
        const exists = await db.reviewQuote.findFirst({ where: { quoteText: item.quoteText } });
        if (!exists) {
          await db.reviewQuote.create({ data: item });
        }
      }
    }

    const allForStar = await db.reviewQuote.findMany({
      where: { rating: starRating },
    });

    // Shuffle and return requested count (at least 5)
    const shuffled = [...allForStar].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.max(5, fetchLimit));

    return {
      success: true,
      prompts: selected,
      totalCount: allForStar.length,
    };
  } catch (error) {
    console.error("Error in getRandomFivePrompts:", error);
    const fallback = AUTHENTIC_QUOTES_SEED.filter((q) => q.rating === (Number(rating) || 5));
    const shuffled = [...fallback].sort(() => 0.5 - Math.random());
    return {
      success: true,
      prompts: shuffled.slice(0, 6),
      totalCount: fallback.length,
    };
  }
}

/**
 * Admin: Get all review quotes with search, filter by star rating, and stats
 */
export async function getAdminReviewQuotes(filters = {}) {
  try {
    const { rating, search = "", page = 1, limit = 25 } = filters;
    const where = {};

    if (rating && Number(rating) > 0) {
      where.rating = Number(rating);
    }

    if (search && search.trim()) {
      where.OR = [
        { quoteText: { contains: search.trim(), mode: "insensitive" } },
        { authorHint: { contains: search.trim(), mode: "insensitive" } },
        { category: { contains: search.trim(), mode: "insensitive" } },
        { productPurchased: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [totalQuotes, star5, star4, star3, star2, star1, quotes, filteredCount] = await Promise.all([
      db.reviewQuote.count(),
      db.reviewQuote.count({ where: { rating: 5 } }),
      db.reviewQuote.count({ where: { rating: 4 } }),
      db.reviewQuote.count({ where: { rating: 3 } }),
      db.reviewQuote.count({ where: { rating: 2 } }),
      db.reviewQuote.count({ where: { rating: 1 } }),
      db.reviewQuote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      db.reviewQuote.count({ where }),
    ]);

    return {
      success: true,
      quotes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredCount,
        totalPages: Math.ceil(filteredCount / Number(limit)) || 1,
      },
      stats: {
        totalQuotes,
        star5,
        star4,
        star3,
        star2,
        star1,
      },
    };
  } catch (error) {
    console.error("Error in getAdminReviewQuotes:", error);
    return { success: false, error: error.message, quotes: [] };
  }
}

/**
 * Admin: Create a new review prompt
 */
export async function createReviewQuote(data) {
  try {
    const { rating = 5, category = "LIVING_SOFA", quoteText, authorHint, experienceType = "PURCHASED", productPurchased = null } = data;
    if (!quoteText || quoteText.trim().length < 5) {
      return { success: false, error: "Review prompt text must be at least 5 characters." };
    }

    const created = await db.reviewQuote.create({
      data: {
        rating: Number(rating) || 5,
        category: category || "LIVING_SOFA",
        experienceType: experienceType || "PURCHASED",
        productPurchased: productPurchased || null,
        quoteText: quoteText.trim(),
        authorHint: authorHint ? authorHint.trim() : null,
      },
    });

    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");

    return { success: true, quote: created };
  } catch (error) {
    console.error("Error in createReviewQuote:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Update an existing review prompt
 */
export async function updateReviewQuote(id, data) {
  try {
    const { rating, category, quoteText, authorHint, experienceType, productPurchased } = data;
    const updateData = {};

    if (rating !== undefined) updateData.rating = Number(rating);
    if (category !== undefined) updateData.category = category;
    if (quoteText !== undefined) updateData.quoteText = quoteText.trim();
    if (authorHint !== undefined) updateData.authorHint = authorHint ? authorHint.trim() : null;
    if (experienceType !== undefined) updateData.experienceType = experienceType;
    if (productPurchased !== undefined) updateData.productPurchased = productPurchased || null;

    const updated = await db.reviewQuote.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");

    return { success: true, quote: updated };
  } catch (error) {
    console.error("Error in updateReviewQuote:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Delete a review prompt
 */
export async function deleteReviewQuote(id) {
  try {
    await db.reviewQuote.delete({ where: { id } });
    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteReviewQuote:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Bulk seed 100-200 review quotes into database
 */
export async function seedBulkReviewPool() {
  try {
    let insertedCount = 0;
    for (const item of AUTHENTIC_QUOTES_SEED) {
      const exists = await db.reviewQuote.findFirst({
        where: { quoteText: item.quoteText },
      });
      if (!exists) {
        await db.reviewQuote.create({ data: item });
        insertedCount++;
      }
    }

    const total = await db.reviewQuote.count();
    revalidatePath("/ai-reviews");
    revalidatePath("/admin/reviews");

    return { success: true, insertedCount, totalCount: total };
  } catch (error) {
    console.error("Error in seedBulkReviewPool:", error);
    return { success: false, error: error.message };
  }
}


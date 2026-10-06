// Hash string to deterministic integer
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Consistent with lib/reviews/productReviewGenerator.js TARGET_AVERAGES
const TARGET_AVERAGES = [4.8, 4.5, 4.7, 4.3, 4.9, 4.6, 5.0, 4.4, 4.8, 4.7, 4.5, 4.2];

export function getProductRatingScore(product) {
  if (!product) return "4.8";
  if (product.averageRating && typeof product.averageRating === "number") {
    return product.averageRating.toFixed(1);
  }
  const str = String(product.id || product.title || "default");
  const hash = hashString(str);
  const target = TARGET_AVERAGES[hash % TARGET_AVERAGES.length];
  return target.toFixed(1);
}

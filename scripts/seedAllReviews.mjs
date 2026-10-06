import dotenv from "dotenv";
dotenv.config();

import { db } from "../lib/prisma.js";
import { seedTailoredProductReviews } from "../lib/reviews/productReviewGenerator.js";

async function main() {
  console.log("Cleaning any test artifacts...");
  await db.customerReviewSubmission.deleteMany({
    where: {
      reviewerName: { in: ["wdasff", "qwergthjk"] },
    },
  });

  console.log("Fetching all products from DB...");
  const products = await db.product.findMany();
  console.log(`Found ${products.length} products in DB.`);

  for (const prod of products) {
    console.log(`\nChecking / Seeding product: "${prod.title}" (ID: ${prod.id})`);
    const created = await seedTailoredProductReviews(prod);
    console.log(`-> Created ${created.length} reviews for "${prod.title}".`);

    // Fetch review stats
    const reviews = await db.customerReviewSubmission.findMany({
      where: {
        OR: [
          { productId: prod.id },
          { productName: { equals: prod.title, mode: "insensitive" } },
        ],
        status: { notIn: ["DELETED", "SPAM", "ARCHIVED"] },
      },
    });

    const avg = reviews.length > 0 
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "N/A";
    const reviewers = reviews.map(r => `${r.reviewerName} (${r.rating}★)`).join(", ");
    console.log(`   Total Reviews: ${reviews.length} | Avg Rating: ${avg}★ | Reviewers: ${reviewers}`);
  }

  console.log("\nFinished seeding all products.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding reviews:", err);
  process.exit(1);
});

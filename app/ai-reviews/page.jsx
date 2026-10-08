import ReviewHeader from "@/components/reviews/ReviewHeader";
import ReviewWizard from "@/components/reviews/ReviewWizard";
import ReviewFooter from "@/components/reviews/ReviewFooter";
import CustomerReviewsSection from "@/components/reviews/CustomerReviewsSection";
import { ReviewRepository } from "@/lib/reviews/google/repository/reviewRepository.js";

export const metadata = {
  title: "Customer Reviews & Craftsmanship Feedback | Aameena Furniture Solapur",
  description:
    "Read trusted reviews from our customers and share your verified craftsmanship feedback for Sagwan teak wood furniture from Aameena Furniture in Solapur.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AiReviewsPage() {
  // Fetch initial database-driven reviews and stats
  const [reviews, stats] = await Promise.all([
    ReviewRepository.fetchReviews().catch(() => []),
    ReviewRepository.getReviewStats().catch(() => null),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-4 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* 1. Header & AI Review Generator Wizard */}
        <div className="space-y-8">
          <ReviewHeader />
          <ReviewWizard />
        </div>

        {/* 2. Public Customer Reviews Feed (Consolidated Single Page) */}
        <CustomerReviewsSection initialReviews={reviews} initialStats={stats} />

        {/* 3. Footer */}
        <ReviewFooter />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";

/**
 * Public Reviews Redirect (Phase 8.5.1)
 * The entire public review experience is now unified exclusively at /ai-reviews.
 */
export default function ReviewsPage() {
  redirect("/ai-reviews");
}

"use client";

import ReviewCard from "../ReviewCard";

export default function ReviewSuggestionCard({
  suggestion,
  isSelected = false,
  onSelect,
  onDoubleClick,
  onCopySuccess,
  onCopyError,
}) {
  if (!suggestion) return null;

  return (
    <ReviewCard
      review={suggestion.review || suggestion.quoteText}
      rating={suggestion.rating || 5}
      language={suggestion.language || "en"}
      estimatedLength={suggestion.estimatedLength || "Standard"}
      tone={suggestion.tone || "Very Happy"}
      isSelected={isSelected}
      onSelect={onSelect}
      onDoubleClick={onDoubleClick}
      onCopySuccess={onCopySuccess}
      onCopyError={onCopyError}
    />
  );
}

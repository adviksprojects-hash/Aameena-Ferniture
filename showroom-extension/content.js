// Aameena Furniture Showroom Auto-Fill Content Script
console.log("Aameena Furniture Showroom Helper active on Google Maps/Reviews.");

async function autoFillReview() {
  try {
    // Read text from clipboard (requires clipboardRead permission)
    const reviewText = await navigator.clipboard.readText();
    if (!reviewText) {
      console.log("No review text found in clipboard.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // 15 seconds

    const pollTimer = setInterval(() => {
      attempts++;
      // Search for Google Maps review textarea or editable div
      const textarea =
        document.querySelector('textarea[aria-label*="review" i]') ||
        document.querySelector('textarea[name="review" i]') ||
        document.querySelector('textarea') ||
        document.querySelector('div[contenteditable="true"][role="textbox"]');

      if (textarea) {
        clearInterval(pollTimer);

        if (textarea.tagName.toLowerCase() === "textarea") {
          textarea.value = reviewText;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          textarea.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          textarea.innerText = reviewText;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // Try to select 5th star if present
        const stars = document.querySelectorAll('button[aria-label*="star" i], div[role="radio"][aria-label*="star" i]');
        if (stars.length >= 5) {
          stars[4].click();
        }

        // Focus submit button
        const submitBtn = Array.from(document.querySelectorAll('button')).find(
          b => b.innerText && (b.innerText.includes("Post") || b.innerText.includes("Submit") || b.innerText.includes("Publish"))
        );
        if (submitBtn) {
          submitBtn.focus();
        }

        console.log("✅ Successfully auto-filled Aameena Furniture review into Google review box!");
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollTimer);
      }
    }, 500);
  } catch (err) {
    console.warn("Could not read clipboard automatically:", err);
  }
}

// Trigger auto-fill when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoFillReview);
} else {
  autoFillReview();
}

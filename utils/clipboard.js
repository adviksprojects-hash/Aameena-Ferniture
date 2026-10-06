/**
 * Reusable universal clipboard utility supporting modern Clipboard API with fallback.
 * Strictly copies text without any automated paste or side-effects.
 */

export async function copyToClipboard(text) {
  if (typeof window === "undefined" || !text) {
    return { success: false, error: "Window or text not available" };
  }

  // 1. Try modern navigator.clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, attempting execCommand fallback:", err);
    }
  }

  // 2. Fallback to document.execCommand('copy') for older browsers / iframes
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.style.opacity = "0";
    textArea.setAttribute("readonly", "");
    textArea.setAttribute("aria-hidden", "true");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    }
    return { success: false, error: "execCommand returned false" };
  } catch (err) {
    console.error("Clipboard copy failed via all methods:", err);
    return { success: false, error: err.message || "Failed to copy to clipboard" };
  }
}

/**
 * Backward compatibility wrapper returning boolean
 */
export async function copyToClipboardUniversal(text) {
  const result = await copyToClipboard(text);
  return result.success;
}

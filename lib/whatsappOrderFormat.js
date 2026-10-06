/**
 * Centralized WhatsApp Order Messaging Utility for Aameena Furniture
 * Formats rich, itemized messages detailing Item 1, Item 2 separately with
 * customer contact, delivery destination, pricing, and factory dispatch details.
 */

export const OWNER_WHATSAPP_NUMBER = "918600570542";
export const OFFICIAL_CALL_NUMBER = "+91 86692 33747";
export const OFFICIAL_WHATSAPP_NUMBER = "+91 86005 70542";

/**
 * Format itemized WhatsApp message for an order.
 * Works seamlessly with Cart items or database OrderItems.
 * Uses high-compatibility Unicode emojis supported across all platforms
 * to prevent the "" Unicode replacement character from appearing.
 */
export function formatOrderWhatsAppMessage({
  orderNumber = "PENDING",
  trackingNumber = "",
  customerName = "Valued Customer",
  customerPhone = "",
  customerEmail = "",
  shippingAddress = "",
  city = "Solapur",
  postalCode = "",
  totalAmount = 0,
  status = "CONFIRMED",
  productionStage = "INQUIRY_RECEIVED",
  customerNotes = "",
  items = [],
  senderRole = "customer", // "customer" | "admin" | "manager"
  customNote = "",
}) {
  const formattedItems = (items || []).map((item, index) => {
    const title = item.title || item.Product?.title || "Handcrafted Luxury Furniture";
    const qty = item.quantity || 1;
    const wood = item.woodType || item.Product?.woodType || "Grade-A Sagwan Teak";
    const finish = item.finishType || item.Product?.finishType || "Natural Teak Honey Polish";
    const unitPrice = Number(item.price || item.Product?.price || 0);
    const subtotal = unitPrice * qty;

    return `*${index + 1}. ${title}*\n   • Quantity: ${qty}\n   • Timber: ${wood}\n   • Polish: ${finish}\n   • Unit Price: ₹${unitPrice.toLocaleString("en-IN")}\n   • Item Total: ₹${subtotal.toLocaleString("en-IN")}`;
  }).join("\n\n");

  const formattedStage = (productionStage || "INQUIRY_RECEIVED")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (senderRole === "admin" || senderRole === "manager") {
    // Factory update sent to customer
    let msg = `*AAMEENA FURNITURE MANUFACTURER, SOLAPUR*\n`;
    msg += `*Official Crafting & Dispatch Update*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Namaste ${customerName}!\n\n`;
    msg += `Your handcrafted teak furniture order *#${orderNumber}* has been updated.\n\n`;
    msg += `📍 *Current Stage:* ${formattedStage}\n`;
    if (trackingNumber) msg += `🚚 *Workshop Tracking ID:* ${trackingNumber}\n`;
    msg += `📍 *Delivery Destination:* ${shippingAddress}, ${city}${postalCode ? " - " + postalCode : ""}\n\n`;
    msg += `🪑 *Ordered Furniture Items (${items.length || 1}):*\n`;
    msg += `${formattedItems || "   • Handcrafted Solid Wood Furniture"}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *Total Order Amount:* ₹${Number(totalAmount).toLocaleString("en-IN")}\n`;
    if (customNote && customNote.trim()) {
      msg += `🔔 *Workshop Note:* ${customNote.trim()}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `You can track your order live anytime at: https://aameenafurniture.com/orders\n`;
    msg += `📍 Solapur Central Workshop: Near Old Poona Naka, Ring Road, Solapur.`;
    return msg;
  }

  // Customer sending order confirmation to owner / manager
  let msg = `*AAMEENA FURNITURE - NEW ORDER CONFIRMATION*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Namaste! I have placed an order with Aameena Furniture:\n\n`;
  msg += `📦 *Order Number:* ${orderNumber}\n`;
  if (trackingNumber) msg += `🚚 *Tracking ID:* ${trackingNumber}\n`;
  msg += `✅ *Status:* ${status} (${formattedStage})\n\n`;

  msg += `👤 *Customer Details:*\n`;
  msg += `• Name: ${customerName}\n`;
  if (customerPhone) msg += `• Phone: ${customerPhone}\n`;
  if (customerEmail) msg += `• Email: ${customerEmail}\n`;
  msg += `\n`;

  msg += `📍 *Delivery Destination (Where Ordered From):*\n`;
  msg += `• Address: ${shippingAddress}\n`;
  msg += `• City / Postal: ${city}${postalCode ? " - " + postalCode : ""}\n\n`;

  msg += `🪑 *ORDERED ITEMS (${items.length}):*\n`;
  msg += `${formattedItems || "   • Handcrafted Sagwan Teak Furniture"}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Total Order Value:* ₹${Number(totalAmount).toLocaleString("en-IN")}\n`;
  if (customerNotes && customerNotes.trim()) {
    msg += `📝 *Special Requests / Notes:* ${customerNotes.trim()}\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Please confirm order receipt and let me know the estimated manufacturing & dispatch schedule. Thank you!`;

  return msg;
}

/**
 * Returns a direct WhatsApp URL targeting the owner / workshop desk.
 * Uses api.whatsapp.com/send to prevent wa.me redirect proxy from mangling 4-byte UTF-8 emojis into .
 */
export function getOwnerWhatsAppUrl(orderDetails) {
  const text = formatOrderWhatsAppMessage({ ...orderDetails, senderRole: "customer" });
  return `https://api.whatsapp.com/send?phone=${OWNER_WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
}

/**
 * Returns a direct WhatsApp URL targeting a customer's phone.
 * Uses api.whatsapp.com/send to prevent wa.me redirect proxy from mangling 4-byte UTF-8 emojis into .
 */
export function getCustomerWhatsAppUrl(customerPhone, orderDetails, customNote = "") {
  const cleanPhone = (customerPhone || "").replace(/\D/g, "");
  const phoneWithCode = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
  const text = formatOrderWhatsAppMessage({ ...orderDetails, senderRole: "manager", customNote });
  return `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(text)}`;
}

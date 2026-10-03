/**
 * Universal Form Validation Utilities
 * Returns consistent { valid: boolean, error: string | null, value?: any }
 */

export function validatePhone(phone) {
  if (!phone || String(phone).trim() === "") {
    return { valid: false, error: "Mobile number is required.", phone: "" };
  }
  let cleanPhone = String(phone).replace(/[\s\-\(\)\+]/g, "");
  if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return {
      valid: false,
      error: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).",
      phone: cleanPhone,
    };
  }
  return { valid: true, error: null, phone: cleanPhone };
}

export function validateEmail(email, required = true) {
  if (!email || String(email).trim() === "") {
    if (required) {
      return { valid: false, error: "Email address is required.", email: "" };
    }
    return { valid: true, error: null, email: "" };
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      valid: false,
      error: "Please enter a valid email address (e.g. name@domain.com).",
      email: cleanEmail,
    };
  }
  return { valid: true, error: null, email: cleanEmail };
}

export function validateName(name, field = "Name") {
  if (!name || String(name).trim() === "") {
    return { valid: false, error: `${field} is required.`, name: "" };
  }
  const trimmed = String(name).trim();
  if (trimmed.length < 2) {
    return { valid: false, error: `${field} must be at least 2 characters long.`, name: trimmed };
  }
  if (!/^[a-zA-Z\s\.\'\-]+$/.test(trimmed)) {
    return { valid: false, error: `${field} can only contain letters and spaces.`, name: trimmed };
  }
  return { valid: true, error: null, name: trimmed };
}

export function validateAmount(amount, field = "Amount") {
  if (amount === undefined || amount === null || String(amount).trim() === "") {
    return { valid: false, error: `${field} is required.`, amount: 0 };
  }
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `${field} must be a positive number greater than 0.`, amount: num };
  }
  return { valid: true, error: null, amount: num };
}

export function validatePincode(pin) {
  if (!pin || String(pin).trim() === "") {
    return { valid: false, error: "Pincode is required.", pincode: "" };
  }
  const cleanPin = String(pin).trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return { valid: false, error: "Please enter a valid 6-digit Indian PIN code.", pincode: cleanPin };
  }
  return { valid: true, error: null, pincode: cleanPin };
}

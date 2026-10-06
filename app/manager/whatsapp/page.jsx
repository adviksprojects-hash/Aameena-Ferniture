"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle2, MapPin, Sparkles, Phone, User, ExternalLink, RefreshCw } from "lucide-react";
import { validatePhone } from "@/lib/validation";
import SearchableSelect from "@/components/SearchableSelect";

export default function ManagerWhatsAppPage() {
  const [selectedLocation, setSelectedLocation] = useState("solapur");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("dispatch");
  const [customMessage, setCustomMessage] = useState(
    "Hello! Your handcrafted solid wood furniture piece is currently out for white-glove doorstep delivery. Our delivery team will contact you shortly for room placement."
  );
  const [sentStatus, setSentStatus] = useState(false);

  const MANUFACTURER_LOCATIONS = [
    {
      id: "solapur",
      name: "AMEENA Distributors’s Sofa Set Furniture Company - Solapur Facility",
      phone: "+91 86692 33747",
      city: "Solapur",
    },
  ];

  const TEMPLATES = [
    {
      id: "dispatch",
      label: "🚚 Order In-Transit & Delivery Alert",
      text: "Hello {Customer}! Your custom solid wood furniture from Aameena Furniture Manufacturer ({Location}) is out for white-glove doorstep delivery. Our installation crew will assist with placement and unboxing.",
    },
    {
      id: "inspection",
      label: "✨ Custom Furniture Ready for Inspection",
      text: "Greetings {Customer}! We are excited to inform you that your custom furniture order at Aameena Furniture Manufacturer ({Location}) has completed 7-step polishing and passed quality inspection. You are welcome to inspect before final dispatch.",
    },
    {
      id: "timber",
      label: "🪵 Timber Seasoning & Carving Update",
      text: "Dear {Customer}, master artisans at Aameena Furniture Manufacturer ({Location}) have selected seasoned Grade-A Sagwan Teak for your project. Structural joinery and mortise framing are now underway.",
    },
    {
      id: "review",
      label: "⭐ Google Location Review Request",
      text: "Dear {Customer}, thank you for choosing Aameena Furniture Manufacturer ({Location})! If you loved our craftsmanship and service, we would appreciate a quick 5-star review: https://search.google.com/local/writereview?placeid=ChIJB1k-wjTbxTsR7dA3i-yPr4Y",
    },
    {
      id: "custom",
      label: "💬 100% Custom Alert Message",
      text: "",
    },
  ];

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (tmpl && tmpl.text) {
      const loc = MANUFACTURER_LOCATIONS.find((l) => l.id === selectedLocation)?.name || "Solapur Facility";
      const populated = tmpl.text
        .replace(/{Customer}/g, customerName || "Valued Client")
        .replace(/{Location}/g, loc);
      setCustomMessage(populated);
    }
  };

  // Compile full message with location branding
  const getCompiledMessage = () => {
    const loc = MANUFACTURER_LOCATIONS.find((l) => l.id === selectedLocation)?.name || "Solapur Facility";
    return (
      `*AAMEENA FURNITURE MANUFACTURER*\n` +
      `📍 *Location:* ${loc}\n` +
      (orderNumber ? `📦 *Order ID:* #${orderNumber}\n` : "") +
      `\n${customMessage}\n\n` +
      `Official Helpline (Calling): +91 86692 33747 | WhatsApp: +91 86005 70542\n` +
      `Visit: http://localhost:3000`
    );
  };

  const handleSendAlert = (e) => {
    e.preventDefault();
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error);
      return;
    }
    setPhoneError(null);

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const compiled = getCompiledMessage();

    // Properly redirect to WhatsApp Web / App
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(compiled)}`, "_blank");

    setSentStatus(true);
    setTimeout(() => setSentStatus(false), 5000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/80 shadow-sm">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-800">
          Customer Communication & Logistics
        </span>
        <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">
          Furniture Manufacturer WhatsApp Alerts
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Send customized SMS and WhatsApp updates keeping the facility location and direct order details intact.
        </p>
      </div>

      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/70 shadow-sm space-y-6">
        <form onSubmit={handleSendAlert} className="space-y-5 text-xs">
          
          {/* 1. Manufacturer Location Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-800" />
              <span>Select Furniture Manufacturer Unit (Preserved in Alert):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {MANUFACTURER_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc.id);
                      handleTemplateChange(selectedTemplate);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-950 text-white border-amber-950 shadow-sm ring-2 ring-amber-500/50"
                        : "bg-amber-50/50 border-amber-200 text-slate-800 hover:bg-amber-100"
                    }`}
                  >
                    <span className="font-bold block text-xs">{loc.city} Unit</span>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-amber-200" : "text-slate-500"}`}>
                      {loc.name.split("-")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Name:</label>
              <input
                type="text"
                placeholder="e.g. Vikram Malhotra"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Phone Number *:</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9820112345"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError(null);
                }}
                className={`w-full p-3 rounded-xl bg-amber-50/50 border text-slate-900 font-medium ${
                  phoneError ? "border-red-500 ring-1 ring-red-500" : "border-amber-200"
                }`}
              />
              {phoneError && <p className="text-[10px] text-red-600 font-semibold mt-1">{phoneError}</p>}
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Order # (Optional):</label>
              <input
                type="text"
                placeholder="e.g. AF-ORD-849201"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* 3. Notification Template Selector */}
          <SearchableSelect
            label="Select Notification Purpose / Preset"
            options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
            value={selectedTemplate}
            onChange={(val) => handleTemplateChange(val)}
            allowOther={true}
            otherPlaceholder="Enter custom notification title..."
          />

          {/* 4. Custom SMS / Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 uppercase">Custom Message Content (Fully Editable):</label>
              <span className="text-[10px] text-slate-400">Feel free to personalize words below</span>
            </div>
            <textarea
              rows="4"
              required
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your custom message here..."
              className="w-full p-3.5 rounded-xl bg-white border border-amber-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-700 shadow-sm"
            ></textarea>
          </div>

          {/* 5. Live Message Preview */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 uppercase text-[11px] block">Live WhatsApp Message Preview:</span>
            <pre className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-sans text-xs whitespace-pre-wrap leading-relaxed">
              {getCompiledMessage()}
            </pre>
          </div>

          {/* 6. Send & Redirect Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Alert & Open WhatsApp Web / App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </form>

        {sentStatus && (
          <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="block">WhatsApp alert dispatched successfully!</span>
              <span className="text-[10px] font-normal text-emerald-700">
                Opened conversation for phone: {phone}.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

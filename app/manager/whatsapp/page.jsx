"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ManagerWhatsAppPage() {
  const [phone, setPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("dispatch");
  const [sentStatus, setSentStatus] = useState(false);

  const handleSendAlert = (e) => {
    e.preventDefault();
    setSentStatus(true);
    setTimeout(() => setSentStatus(false), 4000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-800">Customer Communication</span>
        <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">Manager WhatsApp Dispatch Alerts</h1>
        <p className="text-xs text-slate-600 mt-1">Send quick order updates and tracking links directly to customer WhatsApp.</p>
      </div>

      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-amber-200/70 shadow-sm space-y-4">
        <form onSubmit={handleSendAlert} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase">Customer Phone Number:</label>
            <input
              type="tel" required
              placeholder="e.g. +91 98765 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase">Select WhatsApp Notification Template:</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-900 font-medium"
            >
              <option value="dispatch">🚚 Order In-Transit & Delivery Alert</option>
              <option value="ready">✨ Custom Furniture Ready for Inspection</option>
              <option value="review">⭐ Google Location Review Request</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send WhatsApp Alert Now</span>
          </button>
        </form>

        {sentStatus && (
          <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp alert sent successfully to {phone}!</span>
          </div>
        )}
      </div>

    </div>
  );
}

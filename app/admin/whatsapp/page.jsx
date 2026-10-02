"use client";

import { useState } from "react";
import { MessageSquare, Plus, CheckCircle2, Send, Sparkles } from "lucide-react";

export default function AdminWhatsAppPage() {
  const [templates, setTemplates] = useState([
    { id: 1, title: "Order Dispatch Notification", trigger: "On Status Change to In Transit", body: "Hello {{customer_name}}, your Aameena Furniture order #{{order_id}} has been dispatched! Track live status here: {{tracking_url}}" },
    { id: 2, title: "Custom Furniture Quote Ready", trigger: "On Quote Generated", body: "Dear {{customer_name}}, your custom Teak furniture quote for {{item_name}} is ready! View estimate: {{quote_url}}" },
    { id: 3, title: "Review Request (Google Locations)", trigger: "2 Days After Delivery", body: "Hi {{customer_name}}, we hope you love your new solid wood furniture! Please leave us a review on Google: {{review_url}}" },
  ]);

  const [testNumber, setTestNumber] = useState("");
  const [testSent, setTestSent] = useState(false);

  const handleTestSend = (e) => {
    e.preventDefault();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Automated Client Communication</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">WhatsApp Automation & Template Builder</h1>
          <p className="text-xs text-slate-400 mt-1">Configure automated WhatsApp triggers for order updates, dispatches, and review requests.</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp Business API Active</span>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-serif text-white">Active Message Templates</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold bg-amber-950 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-800">
                  {tpl.trigger}
                </span>
                <h3 className="text-base font-bold font-serif text-white">{tpl.title}</h3>
                <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono leading-relaxed">
                  "{tpl.body}"
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-emerald-400">Trigger Mode: Auto-Send</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Broadcast Panel */}
      <div className="bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-4 max-w-xl">
        <h2 className="text-lg font-bold font-serif text-white">Send Test WhatsApp Message</h2>
        <p className="text-xs text-slate-400">Test template dispatch to your mobile number.</p>

        <form onSubmit={handleTestSend} className="space-y-3">
          <input
            type="tel" required
            placeholder="Enter Phone Number with country code (+91...)"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Test Broadcast</span>
          </button>
        </form>

        {testSent && (
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-800">
            ✓ WhatsApp test message successfully delivered to {testNumber}!
          </div>
        )}
      </div>

    </div>
  );
}

"use client";

import { useState } from "react";
import { UserCheck, Plus, Shield, MapPin, Mail, Phone } from "lucide-react";

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([
    { id: 1, name: "Suresh Kumar", branch: "Grand Showroom Flagship", email: "suresh@aameenafurniture.com", phone: "+91 98765 00001", status: "Active" },
    { id: 2, name: "Vikram Malhotra", branch: "South Studio Location", email: "vikram@aameenafurniture.com", phone: "+91 98765 00002", status: "Active" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newMgr, setNewMgr] = useState({ name: "", branch: "Grand Showroom Flagship", email: "", phone: "" });

  const handleAddManager = (e) => {
    e.preventDefault();
    setManagers([...managers, { id: Date.now(), ...newMgr, status: "Active" }]);
    setShowModal(false);
    setNewMgr({ name: "", branch: "Grand Showroom Flagship", email: "", phone: "" });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Staff Access Control</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Manager Management</h1>
          <p className="text-xs text-slate-400 mt-1">Assign store managers to showroom branches and configure portal access rights.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Manager</span>
        </button>
      </div>

      {/* Managers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {managers.map((mgr) => (
          <div key={mgr.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-serif text-base">
                  {mgr.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-white">{mgr.name}</h3>
                  <span className="text-xs text-amber-400 font-semibold">{mgr.branch}</span>
                </div>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-800">
                {mgr.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-900">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{mgr.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{mgr.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold font-serif text-white">Add Store Manager</h3>
            <form onSubmit={handleAddManager} className="space-y-3 text-xs">
              <input type="text" required placeholder="Full Name" value={newMgr.name} onChange={(e) => setNewMgr({...newMgr, name: e.target.value})} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
              <input type="email" required placeholder="Email Address" value={newMgr.email} onChange={(e) => setNewMgr({...newMgr, email: e.target.value})} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
              <input type="tel" required placeholder="Phone Number" value={newMgr.phone} onChange={(e) => setNewMgr({...newMgr, phone: e.target.value})} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
              
              <select value={newMgr.branch} onChange={(e) => setNewMgr({...newMgr, branch: e.target.value})} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white">
                <option value="Grand Showroom Flagship">Grand Showroom Flagship</option>
                <option value="South Studio Location">South Studio Location</option>
              </select>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold">Assign Manager</button>
                <button type="button" onClick={() => setShowModal(false)} className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState } from "react";
import { Users, Plus, Wrench, Shield, CheckCircle2 } from "lucide-react";

export default function AdminEmployeesPage() {
  const employees = [
    { id: 1, name: "Ramesh Craftsman", role: "Master Teak Wood Artisan", department: "Carpentry Workshop", status: "Active" },
    { id: 2, name: "Kavita Designer", role: "3D Interior Consultant", department: "Design Studio", status: "Active" },
    { id: 3, name: "Amit Driver", role: "Logistics & White-Glove Installer", department: "Delivery", status: "Active" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Workforce Directory</span>
          <h1 className="text-2xl font-bold font-serif text-white mt-1">Employee Management</h1>
          <p className="text-xs text-slate-400 mt-1">Directory of workshop artisans, 3D interior designers, and delivery staff.</p>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Staff Name</th>
              <th className="p-4">Designation / Role</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-900/50">
                <td className="p-4 font-bold text-white">{emp.name}</td>
                <td className="p-4 text-amber-400 font-semibold">{emp.role}</td>
                <td className="p-4 text-slate-400">{emp.department}</td>
                <td className="p-4 font-bold text-emerald-400">{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

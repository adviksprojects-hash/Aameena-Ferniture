"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft, LogOut, RefreshCw, KeyRound, UserCheck } from "lucide-react";
import { getCurrentUserRole } from "@/actions/authActions";

/**
 * RoleGuard Component
 * Protects Admin and Manager routes ensuring only authenticated users with matching roles can access them.
 *
 * @param {string} requiredRole - "ADMIN" | "MANAGER"
 * @param {React.ReactNode} children - The protected layout and pages
 */
export default function RoleGuard({ requiredRole = "ADMIN", children }) {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const [authStatus, setAuthStatus] = useState("loading"); // "loading" | "unauthenticated" | "unauthorized" | "authorized"
  const [dbUser, setDbUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        if (isMounted) setAuthStatus("unauthenticated");
        return;
      }

      try {
        setAuthStatus("loading");
        const res = await getCurrentUserRole();

        if (!isMounted) return;

        if (res.authenticated && res.role) {
          setDbUser(res.user);
          setUserRole(res.role);

          if (requiredRole === "ADMIN") {
            if (res.role === "ADMIN") {
              setAuthStatus("authorized");
            } else {
              setAuthStatus("unauthorized");
            }
          } else if (requiredRole === "MANAGER") {
            if (res.role === "MANAGER" || res.role === "ADMIN") {
              setAuthStatus("authorized");
            } else {
              setAuthStatus("unauthorized");
            }
          }
        } else {
          setAuthStatus("unauthorized");
        }
      } catch (err) {
        console.error("Role verification error:", err);
        if (isMounted) setAuthStatus("unauthorized");
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, requiredRole]);

  // 1. Loading Verification Screen
  if (!isLoaded || authStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-amber-400">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-serif text-white">
              Verifying {requiredRole === "ADMIN" ? "Administrator" : "Showroom Manager"} Access
            </h2>
            <p className="text-xs text-slate-400">
              Authenticating role permissions against Aameena Furniture security records...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated (Sign In Required)
  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/80 inline-block">
              Staff Portal Restricted
            </span>
            <h1 className="text-2xl font-bold font-serif text-white">
              {requiredRole === "ADMIN" ? "Administrator Sign In Required" : "Store Manager Sign In Required"}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This area is strictly restricted to authorized {requiredRole === "ADMIN" ? "executive administrators" : "operations managers"} of Aameena Furniture. Please sign in with your official account to proceed.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <SignInButton mode="modal">
              <button className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" />
                <span>Sign In with Staff Account</span>
              </button>
            </SignInButton>

            <Link
              href="/"
              className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized (Signed In but Insufficient Role)
  if (authStatus === "unauthorized") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-widest text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-800 inline-block">
              Access Denied
            </span>
            <h1 className="text-2xl font-bold font-serif text-white">
              Insufficient Privileges
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are signed in as <span className="text-slate-200 font-semibold">{clerkUser?.primaryEmailAddress?.emailAddress}</span>, but your account has the role of <strong className="text-amber-400 uppercase">[{userRole || "USER"}]</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Only accounts with <span className="text-amber-300 font-semibold">{requiredRole}</span> role can access this section. Please contact your system administrator if you believe this is an error.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <SignOutButton redirectUrl="/sign-in">
              <button className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer">
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>Switch Staff Account (Sign Out)</span>
              </button>
            </SignOutButton>

            <Link
              href="/"
              className="w-full py-3 px-6 rounded-2xl bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-amber-800/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized — Render protected content
  return <>{children}</>;
}

"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { getCurrentUserRole } from "@/actions/authActions";

export default function HeaderAuth() {
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
    if (isSignedIn) {
      // Trigger background sync to ensure user record is created/updated in DB
      getCurrentUserRole().catch(() => {});
    }
  }, [isSignedIn]);

  if (!mounted || !isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-900/40 animate-pulse" />
    );
  }

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox:
              "size-8 sm:size-9 ring-2 ring-amber-500/80 shadow-md transition-transform hover:scale-105",
          },
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <SignInButton mode="modal">
        <button className="sign-in-btn text-xs font-semibold text-amber-200 hover:text-white transition-colors px-2 sm:px-3 py-1.5 cursor-pointer whitespace-nowrap">
          Sign In
        </button>
      </SignInButton>

      <SignUpButton mode="modal">
        <button className="sign-up-btn hidden sm:inline-flex text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shadow-md hover:shadow-amber-500/20 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  );
}

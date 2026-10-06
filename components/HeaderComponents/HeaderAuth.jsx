"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function HeaderAuth() {
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

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
              "w-9 h-9 ring-2 ring-amber-500/80 shadow-md transition-transform hover:scale-105",
          },
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <SignInButton mode="modal">
        <button className="hidden sm:inline-block text-xs font-semibold text-amber-200 hover:text-white transition-colors px-3 py-2 cursor-pointer">
          Sign In
        </button>
      </SignInButton>

      <SignUpButton mode="modal">
        <button className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 px-4 py-2 rounded-full transition-all shadow-md hover:shadow-amber-500/20 transform hover:-translate-y-0.5 cursor-pointer">
          Book Consultation
        </button>
      </SignUpButton>
    </div>
  );
}

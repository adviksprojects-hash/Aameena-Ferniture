"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger on route change
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(75), 120);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, searchParams]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

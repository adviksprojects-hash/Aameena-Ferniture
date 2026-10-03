"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '@/data/HeaderData/HeaderData';
import { cn } from '@/lib/utils';
import { Shield, Briefcase } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function HeaderClient() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Navigation — segmented pill control */}
            <nav className={cn(
                "hidden xl:flex items-center gap-1 rounded-full border border-amber-800/60 bg-amber-900/40 p-1.5 backdrop-blur-md"
            )}>
                {navLinks.map((link) => {
                    const isActive = pathname === link.url;
                    return (
                        <Link
                            key={link.id}
                            href={link.url}
                            className={cn(
                                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap",
                                isActive 
                                    ? "bg-amber-500 text-amber-950 shadow-md font-semibold"
                                    : "text-amber-200/90 hover:text-white hover:bg-amber-800/50"
                            )}
                        >
                            {link.title}
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile / Tablet Menu Toggle */}
            <button
                className={cn(
                    "xl:hidden relative size-10 rounded-full text-amber-200 hover:text-white bg-amber-900/60 border border-amber-800/60 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                )}
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-panel"
            >
                <span
                    className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                        }`}
                />
                <span
                    className={`absolute h-0.5 w-5 bg-current transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                        }`}
                />
                <span
                    className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                        }`}
                />
            </button>

            {/* Mobile Navigation Panel */}
            {isMobileMenuOpen && (
                <div
                    id="mobile-nav-panel"
                    className={cn(
                        "xl:hidden absolute inset-x-3 top-full mt-2 rounded-2xl border border-amber-800/60 bg-amber-950/95 p-3 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1 max-h-[85vh] overflow-y-auto"
                    )}
                >
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.url;
                            return (
                                <Link
                                    key={link.id}
                                    href={link.url}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                                        isActive
                                            ? "bg-amber-500 text-amber-950 font-bold"
                                            : "text-amber-100 hover:bg-amber-900/60"
                                    )}
                                >
                                    {link.title}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-2 mt-2 border-t border-amber-900/60 flex flex-col gap-2">
                        <div className="flex items-center justify-between px-2 pt-1">
                            <span className="text-xs uppercase font-semibold tracking-wider text-amber-400">Theme</span>
                            <ThemeSwitcher />
                        </div>

                        <div className="text-xs uppercase font-semibold tracking-wider text-amber-400 px-2 pt-2">Dashboards</div>
                        <Link 
                            href="/manager" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold bg-amber-900/60 text-amber-200 flex items-center gap-2 hover:bg-amber-800"
                        >
                            <Briefcase className="w-4 h-4 text-amber-400" />
                            Manager Dashboard
                        </Link>
                        <Link 
                            href="/admin" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold bg-amber-600 text-amber-950 flex items-center gap-2 hover:bg-amber-500"
                        >
                            <Shield className="w-4 h-4" />
                            Admin Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
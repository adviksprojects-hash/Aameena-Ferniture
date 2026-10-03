import Link from 'next/link';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import HeaderClient from './HeaderClient';
import { Shield, Briefcase, Sofa } from 'lucide-react';

export default function Header() {

    return (
        <header className="sticky top-0 z-50 w-full bg-amber-950/90 backdrop-blur-md border-b border-amber-900/40 text-amber-50 shadow-lg">
            <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">

                {/* Brand / Logo */}
                <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight text-amber-50 flex items-center gap-2 group">
                    <div className="bg-gradient-to-tr from-amber-600 to-amber-500 p-2 rounded-xl text-amber-950 shadow-md group-hover:scale-105 transition-transform">
                        <Sofa className="w-5 h-5" />
                    </div>
                    <span>Aameena <span className="text-amber-400 font-serif italic">Furniture</span></span>
                </Link>

                {/* Navigation Links */}
                <HeaderClient />

                {/* Quick Portal Switcher & Auth */}
                <div className="flex items-center gap-3">
                    {/* Portal Switcher dropdown / buttons */}
                    <div className="hidden lg:flex items-center gap-2 bg-amber-900/50 p-1 rounded-full border border-amber-800/60 text-xs">
                        <Link 
                            href="/manager" 
                            className="px-3 py-1.5 rounded-full hover:bg-amber-800/80 text-amber-200 hover:text-white transition-colors flex items-center gap-1 font-medium"
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            Manager
                        </Link>
                        <Link 
                            href="/admin" 
                            className="px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-500 text-amber-950 font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                            <Shield className="w-3.5 h-3.5" />
                            Admin
                        </Link>
                    </div>

                    {/* Authentication */}
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="hidden sm:inline-block text-xs font-semibold text-amber-200 hover:text-white transition-colors px-3 py-2">
                                Sign In
                            </button>
                        </SignInButton>

                        <SignUpButton mode="modal">
                            <button className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 px-4 py-2 rounded-full transition-all shadow-md hover:shadow-amber-500/20 transform hover:-translate-y-0.5">
                                Book Consultation
                            </button>
                        </SignUpButton>
                    </Show>

                    <Show when="signed-in">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 ring-2 ring-amber-500/80 shadow-md transition-transform hover:scale-105"
                                }
                            }}
                        />
                    </Show>

                </div>

            </div>
        </header>
    );
}
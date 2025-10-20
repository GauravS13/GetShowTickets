"use client";

import logo from "@/images/logo.png";
import { cn } from "@/lib/utils";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "glass-effect shadow-lg border-b border-primary/20"
          : "bg-background/95 backdrop-blur-sm border-b border-border/50"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <Image
              src={logo} // Update path to your logo
              alt="Logo"
              width={100}
              height={40}
              className="w-24 md:w-28 h-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:flex-1 justify-center px-6">
            <div className="w-full max-w-2xl">
              <SearchBar />
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link href="/seller">
                  <button className="bg-gradient-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-glow hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95">
                    Sell Tickets
                  </button>
                </Link>

                <Link href="/tickets">
                  <button className="glass-effect text-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent/10 hover:shadow-glow hover:shadow-primary/10 transition-all duration-300 hover:scale-105 active:scale-95">
                    My Tickets
                  </button>
                </Link>

                <div className="ml-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300 hover:scale-105",
                      },
                    }}
                  />
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="glass-effect text-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent/10 hover:shadow-glow hover:shadow-primary/10 transition-all duration-300 hover:scale-105 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300",
                  },
                }}
              />
            </SignedIn>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-full glass-effect text-foreground hover:bg-accent/10 hover:shadow-glow hover:shadow-primary/10 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search - Always visible below header */}
        <div className="lg:hidden mt-3 mb-1">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 glass-effect border-b border-primary/20 shadow-lg animate-slide-up">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <SignedIn>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/seller" className="col-span-1">
                  <button className="w-full bg-gradient-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold hover:shadow-glow hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95">
                    Sell Tickets
                  </button>
                </Link>

                <Link href="/tickets" className="col-span-1">
                  <button className="w-full glass-effect text-foreground px-4 py-3 rounded-xl text-sm font-semibold hover:bg-accent/10 hover:shadow-glow hover:shadow-primary/10 transition-all duration-300 hover:scale-105 active:scale-95">
                    My Tickets
                  </button>
                </Link>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full bg-gradient-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold hover:shadow-glow hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <div className="pt-4 border-t border-border/50 mt-2">
              <nav className="flex flex-col gap-3">
                <Link
                  href="/events"
                  className="text-muted-foreground hover:text-primary py-2 transition-colors duration-300 hover:translate-x-1"
                >
                  All Events
                </Link>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary py-2 transition-colors duration-300 hover:translate-x-1"
                >
                  Categories
                </Link>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-primary py-2 transition-colors duration-300 hover:translate-x-1"
                >
                  Help & Support
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

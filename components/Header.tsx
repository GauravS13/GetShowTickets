"use client";

import { cn } from "@/lib/utils";
import logo from "@/public/logo.svg";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Gamepad2, Menu, Music, Theater, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LocationSelector from "./LocationSelector";
import SearchBar from "./SearchBar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border/50"
          : "bg-background/90 backdrop-blur-sm border-b border-border/30"
      )}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="block">
              <Image
                src={logo}
                alt="Get Show Tickets Logo"
                width={120}
                height={48}
                className="w-30 h-auto object-contain"
                priority
                quality={100}
              />
            </Link>
          </div>

          {/* Location Selector - Desktop */}
          <div className="hidden lg:block">
            <LocationSelector 
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
            />
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex lg:flex-1 justify-center px-6">
            <div className="w-full max-w-xl">
              <SearchBar />
            </div>
          </div>

          {/* Category Navigation - Desktop */}
          <div className="hidden xl:flex items-center gap-1">
            <Link href="/category/comedy" className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200">
              Comedy
            </Link>
            <Link href="/category/music" className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200">
              Music
            </Link>
            <Link href="/category/sports" className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200">
              Sports
            </Link>
            <Link href="/category/theater" className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200">
              Theater
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <SignedIn>
              <div className="flex items-center gap-3">
                <Link href="/seller">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
                    Sell Tickets
                  </button>
                </Link>

                <Link href="/tickets">
                  <button className="text-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                    My Tickets
                  </button>
                </Link>

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 rounded-full",
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
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
                    avatarBox: "h-8 w-8 rounded-full",
                  },
                }}
              />
            </SignedIn>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full text-foreground hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Search and Location - Always visible below header */}
        <div className="lg:hidden mt-2 space-y-2">
          <SearchBar />
          <LocationSelector 
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border/50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <SignedIn>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/seller">
                    <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
                      Sell Tickets
                    </button>
                  </Link>

                  <Link href="/tickets">
                    <button className="w-full text-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                      My Tickets
                    </button>
                  </Link>
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              {/* Category Navigation - Mobile */}
              <div className="pt-3 border-t border-border/50">
                <h3 className="text-sm font-medium text-foreground mb-2">Categories</h3>
                <nav className="grid grid-cols-2 gap-2">
                  {[
                    { href: "/category/comedy", label: "Comedy", icon: Calendar },
                    { href: "/category/music", label: "Music", icon: Music },
                    { href: "/category/sports", label: "Sports", icon: Gamepad2 },
                    { href: "/category/theater", label: "Theater", icon: Theater }
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="pt-3 border-t border-border/50">
                <nav className="flex flex-col gap-2">
                  {[
                    { href: "/events", label: "All Events" },
                    { href: "/help", label: "Help & Support" }
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground py-1 transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

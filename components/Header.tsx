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
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b"
          : "bg-white border-b"
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
                  <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Sell Tickets
                  </button>
                </Link>

                <Link href="/tickets">
                  <button className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                    My Tickets
                  </button>
                </Link>

                <div className="ml-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "h-9 w-9 rounded-full ring-2 ring-blue-100 hover:ring-blue-200 transition-all",
                      },
                    }}
                  />
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white text-gray-800 px-5 py-2 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
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
                    avatarBox: "h-8 w-8 rounded-full ring-2 ring-blue-100",
                  },
                }}
              />
            </SignedIn>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <SignedIn>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/seller" className="col-span-1">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md">
                    Sell Tickets
                  </button>
                </Link>

                <Link href="/tickets" className="col-span-1">
                  <button className="w-full bg-white text-gray-800 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm">
                    My Tickets
                  </button>
                </Link>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <div className="pt-2 border-t mt-2">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/events"
                  className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  All Events
                </Link>
                <Link
                  href="/categories"
                  className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  Categories
                </Link>
                <Link
                  href="/help"
                  className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
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

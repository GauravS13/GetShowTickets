"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";

// Create a client-only version of the SearchBar
const ClientSearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      setShowMobileOverlay(false);
      inputRef.current?.blur();
    }
  };

  // Clear search input
  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Handle mobile focus
  const handleFocus = () => {
    setIsFocused(true);
    if (isMobile) {
      setShowMobileOverlay(true);
    }
  };

  // Handle mobile blur
  const handleBlur = () => {
    setIsFocused(false);
    if (isMobile) {
      setTimeout(() => setShowMobileOverlay(false), 200);
    }
  };

  return (
    <>
      <div className="relative w-full">
        <form 
          onSubmit={handleSearch} 
          className="relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search for events, venues, artists..."
            autoComplete="off"
            className={cn(
              "w-full py-2.5 px-4 pl-10 rounded-full border transition-all duration-200",
              "focus:outline-none focus:ring-1 focus:ring-primary/20",
              "placeholder:text-muted-foreground text-foreground bg-background/50",
              isFocused
                ? "border-primary/50 shadow-sm"
                : "border-border/50 hover:border-primary/30"
            )}
          />

          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50 transition-colors duration-200"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {showMobileOverlay && isMobile && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowMobileOverlay(false);
              inputRef.current?.blur();
            }}
          >
            <motion.div
              className="absolute top-20 left-4 right-4"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-effect-strong rounded-2xl p-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Search for events, venues, artists...
                </div>
                <div className="text-xs text-muted-foreground/70">
                  Type and press Enter to search
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Server-side fallback component
const ServerSearchBar = () => {
  return (
    <div className="relative w-full">
      <div className="w-full py-3 px-4 pl-12 bg-background/80 backdrop-blur-sm rounded-full border-2 border-border/50 shadow-sm">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-primary text-primary-foreground">
          Search
        </div>
      </div>
    </div>
  );
};

// Dynamically import the client component with no SSR
const DynamicSearchBar = dynamic(() => Promise.resolve(ClientSearchBar), {
  ssr: false,
  loading: () => <ServerSearchBar />
});

// Main SearchBar component
export default function SearchBar() {
  return <DynamicSearchBar />;
}

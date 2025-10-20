"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";

// Create a client-only version of the SearchBar
const ClientSearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Clear search input
  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for events, venues, artists..."
          autoComplete="off"
          className={cn(
            "w-full py-3 px-4 pl-12 bg-background/80 backdrop-blur-sm rounded-full border-2 transition-all duration-300",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-glow focus:shadow-primary/10",
            "placeholder:text-muted-foreground text-foreground",
            isFocused
              ? "border-primary shadow-glow shadow-primary/10"
              : "border-border/50 shadow-sm hover:border-primary/40 hover:shadow-md"
          )}
        />

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>

        {/* Clear button - always rendered but conditionally visible */}
        <button
          type="button"
          onClick={clearSearch}
          className={cn(
            "absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-accent/10 transition-all duration-300 hover:scale-110",
            query ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          type="submit"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
            "bg-gradient-primary text-primary-foreground",
            "hover:shadow-glow hover:shadow-primary/25 hover:scale-105 active:scale-95"
          )}
        >
          Search
        </button>
      </form>
    </div>
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

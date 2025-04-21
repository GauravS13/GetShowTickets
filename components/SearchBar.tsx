"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set mounted state to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

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
            "w-full py-2.5 px-4 pl-11 bg-white rounded-full border transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent",
            "placeholder:text-gray-400 text-gray-800",
            isFocused
              ? "border-blue-300 shadow-md"
              : "border-gray-200 shadow-sm hover:border-gray-300"
          )}
        />

        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        {/* Only render the clear button on the client side after hydration */}
        {mounted && query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
            "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
            "hover:from-blue-700 hover:to-blue-600 shadow-sm hover:shadow-md"
          )}
        >
          Search
        </button>
      </form>
    </div>
  );
}

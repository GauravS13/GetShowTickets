"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import EventCarousel from "./EventCarousel";

interface CategorySectionProps {
  category: string;
  title: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function CategorySection({ 
  category, 
  title, 
  limit = 6,
  showViewAll = true,
  className = ""
}: CategorySectionProps) {
  const events = useQuery(api.events.getByCategory, { category });
  const categoryCount = useQuery(api.events.getCategoriesWithCount);

  if (!events) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted/20 rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted/20 rounded animate-pulse" />
          </div>
          {showViewAll && (
            <div className="h-10 w-24 bg-muted/20 rounded animate-pulse" />
          )}
        </div>
        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-80 h-96 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const categoryInfo = categoryCount?.find(c => c.category === category);
  const displayEvents = events.slice(0, limit);
  const hasMoreEvents = events.length > limit;

  if (displayEvents.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-4 ${className} card-container-responsive`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        
        {showViewAll && hasMoreEvents && (
          <Link href={`/category/${category}`}>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
              View All
            </button>
          </Link>
        )}
      </div>

      <EventCarousel 
        events={displayEvents.map(event => ({ _id: event._id }))}
        showNavigation={true}
      />

      {/* Mobile view all button */}
      {showViewAll && hasMoreEvents && (
        <div className="flex justify-center lg:hidden">
          <Link href={`/category/${category}`}>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
              View All {categoryInfo?.count || events.length} Events
            </button>
          </Link>
        </div>
      )}
    </section>
  );
}

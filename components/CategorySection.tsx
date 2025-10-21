"use client";

import { EventWithAvailability } from "@/types/event";
import Link from "next/link";
import EventCarousel from "./EventCarousel";

interface CategorySectionProps {
  events: EventWithAvailability[]; // Events with availability data
  title: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function CategorySection({ 
  events, 
  title, 
  limit = 6,
  showViewAll = true,
  className = ""
}: CategorySectionProps) {
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
          <Link href={`/category/${events[0]?.category || 'events'}`}>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
              View All
            </button>
          </Link>
        )}
      </div>

      <EventCarousel 
        events={displayEvents}
        showNavigation={true}
      />

      {/* Mobile view all button */}
      {showViewAll && hasMoreEvents && (
        <div className="flex justify-center lg:hidden">
          <Link href={`/category/${events[0]?.category || 'events'}`}>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
              View All {events.length} Events
            </button>
          </Link>
        </div>
      )}
    </section>
  );
}

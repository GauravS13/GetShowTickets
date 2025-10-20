"use client";

import CategorySection from "@/components/CategorySection";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Home() {
  
  // Fetch data
  const featuredEvents = useQuery(api.events.getFeaturedEvents);
  const comedyEvents = useQuery(api.events.getByCategory, { category: "comedy" });
  const musicEvents = useQuery(api.events.getByCategory, { category: "music" });
  const sportsEvents = useQuery(api.events.getByCategory, { category: "sports" });
  const theaterEvents = useQuery(api.events.getByCategory, { category: "theater" });
  const activitiesEvents = useQuery(api.events.getByCategory, { category: "activities" });


  return (
    <div className="min-h-screen bg-background">
      {/* Compact Top Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Discover Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find and book tickets for the most exciting events across India
            </p>
          </div>
        </div>
      </section>

      {/* Category Sections - District.in Style */}
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Best in Comedy */}
          {comedyEvents && comedyEvents.length > 0 && (
            <section>
              <CategorySection
                category="comedy"
                title="Best in Comedy"
                limit={6}
              />
            </section>
          )}

          {/* India's Top Events */}
          {featuredEvents && featuredEvents.length > 0 && (
            <section>
              <CategorySection
                category="featured"
                title="India's Top Events"
                limit={6}
              />
            </section>
          )}

          {/* Music Events */}
          {musicEvents && musicEvents.length > 0 && (
            <section>
              <CategorySection
                category="music"
                title="Music Events"
                limit={6}
              />
            </section>
          )}

          {/* Sports Events */}
          {sportsEvents && sportsEvents.length > 0 && (
            <section>
              <CategorySection
                category="sports"
                title="Sports Mania"
                limit={6}
              />
            </section>
          )}

          {/* Theater Events */}
          {theaterEvents && theaterEvents.length > 0 && (
            <section>
              <CategorySection
                category="theater"
                title="Theater & Shows"
                limit={6}
              />
            </section>
          )}

          {/* Activities */}
          {activitiesEvents && activitiesEvents.length > 0 && (
            <section>
              <CategorySection
                category="activities"
                title="Activities & More"
                limit={6}
              />
            </section>
          )}

          {/* Happening this week */}
          <section>
            <CategorySection
              category="comedy"
              title="Happening this week"
              limit={4}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

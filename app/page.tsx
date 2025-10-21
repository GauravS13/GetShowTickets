"use client";

import CategorySection from "@/components/CategorySection";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

export default function Home() {
  const { user } = useUser();
  
  // Single consolidated query for all home page data
  const homePageData = useQuery(api.events.getHomePageData, { 
    userId: user?.id 
  });

  // Show loading state for initial render
  if (!homePageData) {
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

        {/* Loading skeleton */}
        <div className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-8 w-48 bg-muted/20 rounded animate-pulse" />
                <div className="flex gap-6">
                  {Array.from({ length: 3 }).map((_, cardIndex) => (
                    <div key={cardIndex} className="w-80 h-96 bg-muted/20 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { featured, comedy, music, sports, theater, activities } = homePageData;

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
          {/* Above the fold - Priority sections */}
          {/* Best in Comedy - First priority */}
          {comedy.length > 0 && (
            <section>
              <CategorySection
                events={comedy}
                title="Best in Comedy"
                limit={6}
              />
            </section>
          )}

          {/* India's Top Events - Second priority */}
          {featured.length > 0 && (
            <section>
              <CategorySection
                events={featured}
                title="India's Top Events"
                limit={6}
              />
            </section>
          )}

          {/* Below the fold - Lower priority sections */}
          {/* Music Events */}
          {music.length > 0 && (
            <section>
              <CategorySection
                events={music}
                title="Music Events"
                limit={6}
              />
            </section>
          )}

          {/* Sports Events */}
          {sports.length > 0 && (
            <section>
              <CategorySection
                events={sports}
                title="Sports Mania"
                limit={6}
              />
            </section>
          )}

          {/* Theater Events */}
          {theater.length > 0 && (
            <section>
              <CategorySection
                events={theater}
                title="Theater & Shows"
                limit={6}
              />
            </section>
          )}

          {/* Activities */}
          {activities.length > 0 && (
            <section>
              <CategorySection
                events={activities}
                title="Activities & More"
                limit={6}
              />
            </section>
          )}

          {/* Happening this week - reuse comedy events */}
          {comedy.length > 0 && (
            <section>
              <CategorySection
                events={comedy}
                title="Happening this week"
                limit={4}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

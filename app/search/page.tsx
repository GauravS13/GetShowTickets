"use client";

import EventCard from "@/components/EventCard";
import EventCarousel from "@/components/EventCarousel";
import FilterBar from "@/components/FilterBar";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Calendar, Search, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { user } = useUser();
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("grid");
  
  const searchResults = useQuery(api.events.searchWithAvailability, { searchTerm: query, userId: user?.id });
  const categories = useQuery(api.events.getCategoriesWithCount);

  // Group results by category
  const groupedResults = useMemo(() => {
    if (!searchResults) return {};
    
    return searchResults.reduce((acc, event) => {
      const category = event.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(event);
      return acc;
    }, {} as Record<string, typeof searchResults>);
  }, [searchResults]);

  const handleFiltersChange = (newFilters: { category?: string; city?: string; minPrice?: number; maxPrice?: number; startDate?: number; endDate?: number; }) => {
    // Handle filters change if needed in the future
    console.log("Filters changed:", newFilters);
  };

  if (!searchResults) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Search className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Search Results
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              {query ? `Results for "${query}"` : "Discover amazing events"}
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{searchResults.length} Events Found</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{Object.keys(groupedResults).length} Categories</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <FilterBar onFiltersChange={handleFiltersChange} />
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "grid" 
                  ? "bg-primary text-primary-foreground" 
                  : "glass-effect hover:bg-accent/10 text-foreground"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Grid View
            </motion.button>
            <motion.button
              onClick={() => setViewMode("carousel")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "carousel" 
                  ? "bg-primary text-primary-foreground" 
                  : "glass-effect hover:bg-accent/10 text-foreground"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Carousel View
            </motion.button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 pb-12">
        {searchResults.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              No events found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse all events
            </p>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Grouped Results by Category */}
            {Object.entries(groupedResults).map(([category, events], categoryIndex) => (
              <motion.section
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground capitalize">
                      {category} Events
                    </h2>
                    <p className="text-muted-foreground">
                      {events.length} {events.length === 1 ? 'event' : 'events'} found
                    </p>
                  </div>
                </div>

                {viewMode === "carousel" ? (
                  <EventCarousel
                    events={events}
                    showNavigation={true}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <EventCard eventId={event._id} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            ))}

            {/* People Also Searched For */}
            {categories && categories.length > 0 && (
              <motion.section
                className="mt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Popular Categories
                </h2>
                <div className="flex flex-wrap gap-3">
                  {categories.slice(0, 6).map((category) => (
                    <motion.a
                      key={category.category}
                      href={`/category/${category.category}`}
                      className="px-4 py-2 rounded-full glass-effect hover:bg-accent/10 text-foreground transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.category} ({category.count})
                    </motion.a>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

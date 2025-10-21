"use client";

import EventCard from "@/components/EventCard";
import EventCarousel from "@/components/EventCarousel";
import FilterBar from "@/components/FilterBar";
import LocationSelector from "@/components/LocationSelector";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";
import { use, useMemo, useState } from "react";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CATEGORY_INFO = {
  comedy: {
    title: "Comedy Events",
    description: "Laugh out loud with the best comedians and stand-up shows",
    icon: "😂",
    color: "text-yellow-500"
  },
  music: {
    title: "Music Events", 
    description: "Experience live music from your favorite artists and bands",
    icon: "🎵",
    color: "text-purple-500"
  },
  sports: {
    title: "Sports Events",
    description: "Cheer for your favorite teams and athletes",
    icon: "⚽",
    color: "text-green-500"
  },
  theater: {
    title: "Theater & Shows",
    description: "Immerse yourself in captivating performances and productions",
    icon: "🎭",
    color: "text-blue-500"
  },
  activities: {
    title: "Activities & More",
    description: "Discover unique experiences and fun activities",
    icon: "🎪",
    color: "text-pink-500"
  }
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const category = resolvedParams.slug as string;
  const { user } = useUser();
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO] || {
    title: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Discover amazing ${category} events`,
    icon: "🎉",
    color: "text-primary"
  };

  // Fetch events
  const events = useQuery(api.events.getByCategoryWithAvailability, { category, userId: user?.id });
  const categoryStats = useQuery(api.events.getCategoriesWithCount);
  const cityStats = useQuery(api.events.getAvailableCities);

  // Filter events by city
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (selectedCity === "All Cities") return events;
    return events.filter(event => event.city === selectedCity);
  }, [events, selectedCity]);

  // Separate upcoming and past events
  const upcomingEvents = filteredEvents.filter(event => event.eventDate > Date.now());
  const pastEvents = filteredEvents.filter(event => event.eventDate <= Date.now());

  const handleFiltersChange = (newFilters: { category?: string; city?: string; minPrice?: number; maxPrice?: number; startDate?: number; endDate?: number; }) => {
    // Handle filters change if needed in the future
    console.log("Filters changed:", newFilters);
  };

  if (!events) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const currentCategoryStats = categoryStats?.find(c => c.category === category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-6 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Button>

            {/* Category Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">{categoryInfo.icon}</span>
                <h1 className={`text-4xl md:text-5xl font-bold ${categoryInfo.color}`}>
                  {categoryInfo.title}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                {categoryInfo.description}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{currentCategoryStats?.count || 0} Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{cityStats?.length || 0} Cities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Location and View Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
              <LocationSelector 
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
              />
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "carousel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("carousel")}
                >
                  Carousel
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <FilterBar onFiltersChange={handleFiltersChange} />
      </div>

      {/* Events Content */}
      <div className="container mx-auto px-4 pb-12">
        {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">{categoryInfo.icon}</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              No {categoryInfo.title} Found
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedCity !== "All Cities" 
                ? `No ${category} events found in ${selectedCity}. Try selecting a different city.`
                : `No ${category} events available at the moment. Check back later!`
              }
            </p>
            <Button onClick={() => setSelectedCity("All Cities")}>
              View All Cities
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Events */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Upcoming Events ({upcomingEvents.length})
                </h2>
              </div>

              {viewMode === "carousel" ? (
                <EventCarousel 
                  events={upcomingEvents}
                  showNavigation={true}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event, index) => (
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

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Past Events ({pastEvents.length})
                  </h2>
                </div>

                {viewMode === "carousel" ? (
                  <EventCarousel
                    events={pastEvents}
                    showNavigation={true}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastEvents.map((event, index) => (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import EventCard from "@/components/EventCard";
import EventCarousel from "@/components/EventCarousel";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";

interface LocationPageProps {
  params: Promise<{
    city: string;
  }>;
}

const CITY_INFO = {
  "new-york": {
    name: "New York",
    description: "The city that never sleeps - discover amazing events in NYC",
    icon: "🗽",
    color: "text-blue-500"
  },
  "london": {
    name: "London", 
    description: "Experience the best of British culture and entertainment",
    icon: "🇬🇧",
    color: "text-red-500"
  },
  "delhi": {
    name: "Delhi",
    description: "The heart of India - vibrant events and cultural experiences",
    icon: "🇮🇳",
    color: "text-orange-500"
  },
  "noida": {
    name: "Noida",
    description: "Modern city with exciting events and entertainment",
    icon: "🏙️",
    color: "text-green-500"
  },
  "gurugram": {
    name: "Gurugram",
    description: "Business hub with diverse entertainment options",
    icon: "🏢",
    color: "text-purple-500"
  },
  "las-vegas": {
    name: "Las Vegas",
    description: "Entertainment capital of the world",
    icon: "🎰",
    color: "text-pink-500"
  }
};

export default function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = use(params);
  const city = resolvedParams.city as string;
  const { user } = useUser();
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const cityInfo = CITY_INFO[city as keyof typeof CITY_INFO] || {
    name: city.charAt(0).toUpperCase() + city.slice(1),
    description: `Discover amazing events in ${city}`,
    icon: "📍",
    color: "text-primary"
  };

  // Fetch events
  const events = useQuery(api.events.getByLocationWithAvailability, { city: cityInfo.name, userId: user?.id });
  const cityStats = useQuery(api.events.getAvailableCities);
  const categoryStats = useQuery(api.events.getCategoriesWithCount);

  // Group events by category
  const groupedEvents = useMemo(() => {
    if (!events) return {};
    
    return events.reduce((acc, event) => {
      const category = event.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(event);
      return acc;
    }, {} as Record<string, typeof events>);
  }, [events]);

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

  const currentCityStats = cityStats?.find(c => c.city === cityInfo.name);

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

            {/* City Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">{cityInfo.icon}</span>
                <h1 className={`text-4xl md:text-5xl font-bold ${cityInfo.color}`}>
                  {cityInfo.name}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                {cityInfo.description}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{currentCityStats?.count || 0} Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{Object.keys(groupedEvents).length} Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex justify-center">
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
        {events.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">{cityInfo.icon}</div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              No Events in {cityInfo.name}
            </h3>
            <p className="text-muted-foreground mb-6">
              No events found in {cityInfo.name} at the moment. Check back later!
            </p>
            <Link href="/">
              <Button>Browse All Events</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Category Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-fit glass-effect-enhanced">
                  <TabsTrigger value="all" className="capitalize">
                    All Events ({events.length})
                  </TabsTrigger>
                  {Object.keys(groupedEvents).slice(0, 3).map((category) => (
                    <TabsTrigger 
                      key={category}
                      value={category} 
                      className="capitalize"
                    >
                      {category} ({groupedEvents[category].length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* All Events Tab */}
              <TabsContent value="all">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
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
                </motion.div>
              </TabsContent>

              {/* Category Tabs */}
              {Object.entries(groupedEvents).slice(0, 3).map(([category, categoryEvents]) => (
                <TabsContent key={category} value={category}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {viewMode === "carousel" ? (
                      <EventCarousel 
                        events={categoryEvents}
                        showNavigation={true}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryEvents.map((event, index) => (
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
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Popular Categories */}
            {categoryStats && categoryStats.length > 0 && (
              <motion.section
                className="mt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Popular Categories in {cityInfo.name}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {categoryStats.slice(0, 6).map((category) => (
                    <motion.a
                      key={category.category}
                      href={`/category/${category.category}?city=${cityInfo.name}`}
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

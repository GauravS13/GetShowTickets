"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Ticket } from "lucide-react";
import EventCard from "./EventCard";

// Shadcn UI components
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "./ui/spinner";

export default function EventList() {
  // Fetch all events
  const events = useQuery(api.events.get);

  if (!events) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Separate events into upcoming and past based on the current time
  const upcomingEvents = events
    .filter((event) => event.eventDate > Date.now())
    .sort((a, b) => a.eventDate - b.eventDate);

  const pastEvents = events
    .filter((event) => event.eventDate <= Date.now())
    .sort((a, b) => b.eventDate - a.eventDate);

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Animated Hero Section */}
      <div className="text-center mb-12 animate-slide-up">
        <h1 className="text-display text-gradient-primary mb-6">
          Discover Events
        </h1>
        <p className="text-hero text-muted-foreground max-w-2xl mx-auto">
          Find and book tickets for the most exciting events. Experience the energy of live entertainment.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="w-24 h-1 bg-gradient-entertainment rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Tabs for Upcoming and Past Events */}
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 w-fit">
            <TabsTrigger value="upcoming" className="capitalize cursor-pointer">
              Upcoming Events ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="capitalize cursor-pointer">
              Past Events ({pastEvents.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event._id} 
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EventCard eventId={event._id} />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-2xl p-16 text-center animate-scale-in">
              <div className="animate-float">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No upcoming events
              </h3>
              <p className="text-muted-foreground">Please check back later for new events</p>
            </div>
          )}
        </TabsContent>

        {/* Past Events Tab */}
        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event, index) => (
                <div 
                  key={event._id} 
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EventCard eventId={event._id} />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-2xl p-16 text-center animate-scale-in">
              <div className="animate-float">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No past events
              </h3>
              <p className="text-muted-foreground">
                All events are yet to happen!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Optional Separator if needed */}
      <Separator className="mt-12" />
    </div>
  );
}

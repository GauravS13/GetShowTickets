"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Ticket } from "lucide-react";
import EventCard from "./EventCard";

// Shadcn UI components
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
    <div className="max-w-7xl mx-auto">

      {/* Tabs for Upcoming and Past Events */}
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 w-fit glass-effect-enhanced">
            <TabsTrigger 
              value="upcoming" 
              className="capitalize cursor-pointer focus-visible-glow"
            >
              Upcoming Events ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="capitalize cursor-pointer focus-visible-glow"
            >
              Past Events ({pastEvents.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} eventId={event._id} />
              ))}
            </div>
          ) : (
            <div className="glass-effect-enhanced rounded-2xl p-16 text-center">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
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
              {pastEvents.map((event) => (
                <EventCard key={event._id} eventId={event._id} />
              ))}
            </div>
          ) : (
            <div className="glass-effect-enhanced rounded-2xl p-16 text-center">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
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
    </div>
  );
}

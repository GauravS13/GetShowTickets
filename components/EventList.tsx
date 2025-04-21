"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Ticket } from "lucide-react";
import EventCard from "./EventCard";

// Shadcn UI components
import { Card } from "@/components/ui/card";
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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <Card className="mb-8 border-none shadow-none">
        <div className="flex flex-col md:flex-row items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Discover Events
            </h1>
            <p className="mt-2 text-gray-600">
              Find and book tickets for the most exciting events.
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs for Upcoming and Past Events */}
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6 grid grid-cols-2 gap-2">
          <TabsTrigger value="upcoming" className="capitalize cursor-pointer">
            Upcoming Events ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="capitalize cursor-pointer">
            Past Events ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} eventId={event._id} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No upcoming events
              </h3>
              <p className="text-gray-600 mt-1">Please check back later</p>
            </div>
          )}
        </TabsContent>

        {/* Past Events Tab */}
        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event._id} eventId={event._id} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No past events
              </h3>
              <p className="text-gray-600 mt-1">
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

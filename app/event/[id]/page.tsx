"use client";

import EventCard from "@/components/EventCard";
import JoinQueue from "@/components/JoinQueue";
// import JoinQueue from "@/components/JoinQueue";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function EventPage() {
  const { user } = useUser();
  const params = useParams();
  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });
  const availability = useQuery(api.events.getEventAvailability, {
    eventId: params.id as Id<"events">,
  });
  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="gradient-border overflow-hidden animate-scale-in">
          {imageUrl && (
            <div className="aspect-[21/9] relative w-full overflow-hidden">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
            </div>
          )}

          <div className="p-8 bg-card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Event Details */}
              <div className="space-y-8">
                <div className="animate-slide-up">
                  <h1 className="text-display text-gradient-primary mb-6">
                    {event.name}
                  </h1>
                  <p className="text-hero text-muted-foreground leading-relaxed">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <div className="glass-effect p-6 rounded-xl border border-primary/20 hover:shadow-glow hover:shadow-primary/10 transition-all duration-300">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <CalendarDays className="w-5 h-5 mr-3 text-primary" />
                      <span className="text-sm font-semibold">Date</span>
                    </div>
                    <p className="text-foreground font-medium">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="glass-effect p-6 rounded-xl border border-secondary/20 hover:shadow-glow-secondary hover:shadow-secondary/10 transition-all duration-300">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-5 h-5 mr-3 text-secondary" />
                      <span className="text-sm font-semibold">Location</span>
                    </div>
                    <p className="text-foreground font-medium">{event.location}</p>
                  </div>

                  <div className="glass-effect p-6 rounded-xl border border-accent/20 hover:shadow-glow-accent hover:shadow-accent/10 transition-all duration-300">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Ticket className="w-5 h-5 mr-3 text-accent" />
                      <span className="text-sm font-semibold">Price</span>
                    </div>
                    <p className="text-foreground font-bold text-lg">£{event.price.toFixed(2)}</p>
                  </div>

                  <div className="glass-effect p-6 rounded-xl border border-pink/20 hover:shadow-glow hover:shadow-pink/10 transition-all duration-300">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Users className="w-5 h-5 mr-3 text-pink" />
                      <span className="text-sm font-semibold">Availability</span>
                    </div>
                    <p className="text-foreground font-medium">
                      {availability.totalTickets - availability.purchasedCount}{" "}
                      / {availability.totalTickets} left
                    </p>
                  </div>
                </div>

                {/* Additional Event Information */}
                <div className="glass-effect border border-primary/20 rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <h3 className="text-lg font-semibold text-gradient-primary mb-4">
                    Event Information
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Please arrive 30 minutes before the event starts
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      Tickets are non-refundable
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      Age restriction: 18+
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Ticket Purchase Card */}
              <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
                <div className="sticky top-8 space-y-6">
                  <EventCard eventId={params.id as Id<"events">} />

                  {user ? (
                    <JoinQueue
                      eventId={params.id as Id<"events">}
                      userId={user.id}
                    />
                  ) : (
                    <SignInButton>
                      <Button variant="gradient" size="lg" className="w-full">
                        Sign in to join the queue
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
    CalendarDays,
    Check,
    LoaderCircle,
    MapPin,
    Ticket,
    Users,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import JoinQueue from "./JoinQueue";
import PurchaseTicket from "./PurchaseTicket";

interface StickyBookingCardProps {
  eventId: Id<"events">;
  event: {
    _id: Id<"events">;
    name: string;
    price: number;
    eventDate: number;
    location: string;
    userId: string;
  };
}

export default function StickyBookingCard({ eventId, event }: StickyBookingCardProps) {
  const { user } = useUser();
  const router = useRouter();

  // Load data using Convex queries
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId: user?.id ?? "",
  });
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });

  // Format date and time
  const eventDateTime = new Date(event.eventDate).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Show loading spinner while data is loading
  if (!availability) {
    return (
      <div className="w-full max-w-sm">
        <Card className="sticky top-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <LoaderCircle className="w-6 h-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event.userId;
  const isSoldOut = availability.purchasedCount >= availability.totalTickets;

  // Don't show booking options for past events
  if (isPastEvent) {
    return (
      <div className="w-full max-w-sm">
        <Card className="sticky top-6 shadow-lg">
          <CardHeader className="pb-4">
            <div className="space-y-3">
              {/* Price Display */}
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  £{event.price.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Starts from</div>
              </div>

              {/* Event Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span>{eventDateTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              <Separator />

              {/* Past Event Message */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">
                  This event has ended
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tickets are no longer available
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Renders the section indicating the ticket queue status
  const renderQueueStatus = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;

    if (isSoldOut) {
      return (
        <div className="flex items-center gap-3 p-3 rounded-xl glass-effect border border-destructive/20">
          <Ticket className="w-5 h-5 text-destructive" />
          <span className="text-destructive text-sm font-medium">Event is sold out</span>
        </div>
      );
    }

    if (queuePosition.position === 2) {
      return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-4 rounded-xl glass-effect border border-accent/30 energy-pulse">
          <div className="flex items-center gap-3">
            <LoaderCircle className="w-5 h-5 text-accent animate-spin" />
            <span className="text-accent font-semibold text-sm">
              You&apos;re next in line! (#{queuePosition.position})
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 rounded-xl glass-effect border border-primary/20">
        <div className="flex items-center gap-3">
          <LoaderCircle className="w-4 h-4 animate-spin text-primary" />
          <span className="text-primary text-sm font-medium">Queue position</span>
        </div>
        <Badge variant="purple" className="text-primary-foreground">
          #{queuePosition.position}
        </Badge>
      </div>
    );
  };

  // Renders the ticket status section based on user and queue state
  const renderTicketStatus = () => {
    if (!user) {
      return (
        <SignInButton mode="modal">
          <Button
            variant="default"
            size="lg"
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Ticket className="w-5 h-5" />
            {isSoldOut ? "Sign In to Join Queue" : "Sign In to Buy Tickets"}
          </Button>
        </SignInButton>
      );
    }

    if (isEventOwner) {
      return (
        <Button
          variant="outline"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/seller/events/${eventId}/edit`);
          }}
          className="w-full justify-center gap-2 py-3 px-6"
        >
          Edit Event
        </Button>
      );
    }

    if (userTicket) {
      return (
        <div className="flex flex-col gap-3 p-4 rounded-xl glass-effect border border-green-500/20">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-semibold text-sm">
              You have a ticket!
            </span>
          </div>
          <Button
            variant="default"
            size="lg"
            onClick={() => router.push(`/tickets/${userTicket._id}`)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6"
          >
            View Your Ticket
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {queuePosition?.status === "offered" && (
          <PurchaseTicket eventId={eventId} />
        )}
        {renderQueueStatus()}
        {queuePosition?.status === "expired" && (
          <div className="flex items-center gap-3 p-3 rounded-xl glass-effect border border-destructive/20">
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-semibold text-sm">
              Offer expired
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm">
      <Card className="sticky top-6 shadow-lg">
        <CardHeader className="pb-4">
          <div className="space-y-3">
            {/* Price Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                £{event.price.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Starts from</div>
            </div>

            {/* Event Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                <span>{eventDateTime}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {availability.totalTickets - availability.purchasedCount}
                </span>
                <span className="text-muted-foreground">
                  / {availability.totalTickets}
                </span>
              </div>
            </div>

            {!isPastEvent && availability.activeOffers > 0 && (
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"} buying
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {renderTicketStatus()}
        </CardContent>
      </Card>

      {/* Join Queue Component - Only show for future events */}
      {user && !isEventOwner && !isPastEvent && (
        <div className="mt-4">
          <JoinQueue eventId={eventId} userId={user.id} />
        </div>
      )}
    </div>
  );
}

"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
    CalendarDays,
    Check,
    CircleArrowRight,
    LoaderCircle,
    MapPin,
    PencilIcon,
    StarIcon,
    Ticket,
    XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PurchaseTicket from "./PurchaseTicket";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Main Event Card component
export default function EventCard({ eventId }: { eventId: Id<"events"> }) {
  const { user } = useUser();
  const router = useRouter();

  // Load data using Convex queries
  const event = useQuery(api.events.getById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId: user?.id ?? "",
  });
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });
  const imageUrl = useStorageUrl(event?.imageStorageId);

  if (!event || !availability) {
    return null;
  }

  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event?.userId;

  // Renders the section indicating the ticket queue status
  const renderQueueStatus = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;

    if (availability.purchasedCount >= availability.totalTickets) {
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
            <CircleArrowRight className="w-5 h-5 text-accent" />
            <span className="text-accent font-semibold text-sm">
              You&apos;re next in line! (#{queuePosition.position})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin text-accent" />
            <span className="text-accent text-xs font-medium">Waiting for ticket</span>
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
    if (!user) return null;

    if (isEventOwner) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/seller/events/${eventId}/edit`);
          }}
          className="w-full justify-center gap-2 mt-2"
        >
          <PencilIcon className="w-4 h-4" />
          Edit Event
        </Button>
      );
    }

    if (userTicket) {
      return (
        <div className="flex flex-col gap-3 p-4 rounded-xl glass-effect border border-green-500/20 mt-2">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-semibold text-sm">
              You have a ticket!
            </span>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => router.push(`/tickets/${userTicket._id}`)}
            className="w-full"
          >
            View Your Ticket
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-2 space-y-2">
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
    <Card
      variant={isPastEvent ? "default" : "gradient"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`/event/${eventId}`);
      }}
      className={`cursor-pointer transition-all duration-500 hover:scale-105 ${
        isPastEvent ? "opacity-75 hover:opacity-100" : "hover-lift"
      }`}
    >
      <CardHeader className="relative">
        {imageUrl && (
          <div className="relative w-full h-52 overflow-hidden">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-start gap-2">
              <CardTitle className="text-xl font-bold text-foreground">{event.name}</CardTitle>
            </div>
            {isPastEvent && (
              <Badge
                variant="outline"
                className="text-xs"
              >
                Past Event
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={isPastEvent ? "outline" : "energy"}
              className="px-3 py-1 text-sm font-semibold"
            >
              £{event.price.toFixed(2)}
            </Badge>
            {isEventOwner && (
              <Badge variant="purple" className="flex items-center gap-1">
                <StarIcon className="w-3 h-3" />
                Your Event
              </Badge>
            )}
            {availability.purchasedCount >= availability.totalTickets && (
              <Badge
                variant="destructive"
                className="px-3 py-1 text-xs font-medium"
              >
                Sold Out
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3 text-muted-foreground text-sm">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">{event.location}</span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-secondary" />
            <span className="font-medium">
              {new Date(event.eventDate).toLocaleDateString()}{" "}
              {isPastEvent && "(Ended)"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Ticket className="w-4 h-4 text-accent" />
            <span className="font-medium">
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} available
              {!isPastEvent && availability.activeOffers > 0 && (
                <Badge variant="live" className="ml-2 text-xs">
                  {availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"}{" "}
                  buying
                </Badge>
              )}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      </CardContent>

      <CardFooter className="p-4">{renderTicketStatus()}</CardFooter>
    </Card>
  );
}

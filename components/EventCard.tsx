"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
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
        <div className="flex items-center gap-2 p-2 rounded border border-destructive/20 bg-destructive/5">
          <Ticket className="w-3 h-3 text-destructive" />
          <span className="text-destructive text-xs font-medium">Event is sold out</span>
        </div>
      );
    }

    if (queuePosition.position === 2) {
      return (
        <div className="flex items-center justify-between gap-2 p-2 rounded border border-accent/30 bg-accent/5">
          <div className="flex items-center gap-2">
            <CircleArrowRight className="w-3 h-3 text-accent" />
            <span className="text-accent font-medium text-xs">
              You&apos;re next in line! (#{queuePosition.position})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LoaderCircle className="w-3 h-3 animate-spin text-accent" />
            <span className="text-accent text-xs font-medium">Waiting</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-2 rounded border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2">
          <LoaderCircle className="w-3 h-3 animate-spin text-primary" />
          <span className="text-primary text-xs font-medium">Queue position</span>
        </div>
        <Badge variant="secondary" className="text-xs">
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
          className="w-full justify-center gap-2"
        >
          <PencilIcon className="w-3 h-3" />
          Edit Event
        </Button>
      );
    }

    if (userTicket) {
      return (
        <div className="flex items-center gap-1.5 p-2 rounded border border-green-500/20 bg-green-50">
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-green-700 font-medium text-xs">
            You have a ticket!
          </span>
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
          <div className="flex items-center gap-1.5 p-2 rounded border border-destructive/20 bg-destructive/5">
            <XCircle className="w-3 h-3 text-destructive" />
            <span className="text-destructive text-xs font-medium">
              Offer expired
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.01,
        y: -2,
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 40,
        mass: 0.8 
      }}
    >
      <Card
        variant={isPastEvent ? "default" : "default"}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          router.push(`/event/${eventId}`);
        }}
        className={`cursor-pointer transition-all duration-200 ${
          isPastEvent ? "opacity-75 hover:opacity-100" : ""
        }`}
      >
      <CardHeader className="relative p-0">
        {imageUrl && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-300"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">{event.name}</CardTitle>
            {isPastEvent && (
              <Badge
                variant="outline"
                className="text-xs"
              >
                Past Event
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={isPastEvent ? "outline" : "default"}
              className="px-2 py-1 text-sm font-semibold"
            >
              £{event.price.toFixed(2)}
            </Badge>
            {isEventOwner && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <StarIcon className="w-3 h-3" />
                Your Event
              </Badge>
            )}
            {availability.purchasedCount >= availability.totalTickets && (
              <Badge
                variant="destructive"
                className="px-2 py-1 text-xs font-medium"
              >
                Sold Out
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-muted-foreground text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span className="font-medium">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3 h-3" />
            <span className="font-medium">
              {new Date(event.eventDate).toLocaleDateString()}{" "}
              {isPastEvent && "(Ended)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="w-3 h-3" />
            <span className="font-medium">
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} available
              {!isPastEvent && availability.activeOffers > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"}{" "}
                  buying
                </Badge>
              )}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      </CardContent>

      <CardFooter className="p-4">{renderTicketStatus()}</CardFooter>
      </Card>
    </motion.div>
  );
}

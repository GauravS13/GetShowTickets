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
    MapPin,
    StarIcon,
    Ticket,
    XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PurchaseTicket from "./PurchaseTicket";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Compact Event Card component for carousels
export default function EventCardCompact({ eventId }: { eventId: Id<"events"> }) {
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
    return (
      <Card className="w-80 h-96 glass-effect animate-pulse">
        <CardHeader className="h-48 bg-muted/20 rounded-t-xl" />
        <CardContent className="p-4 space-y-3">
          <div className="h-4 bg-muted/20 rounded w-3/4" />
          <div className="h-3 bg-muted/20 rounded w-1/2" />
          <div className="h-3 bg-muted/20 rounded w-2/3" />
        </CardContent>
      </Card>
    );
  }

  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event?.userId;

  // Renders the ticket status section
  const renderTicketStatus = () => {
    if (!user) return null;

    if (isEventOwner) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs">
          <StarIcon className="w-3 h-3" />
          Your Event
        </Badge>
      );
    }

    if (userTicket) {
      return (
        <div className="flex items-center gap-1.5 p-1.5 rounded border border-green-500/20 bg-green-50">
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-green-700 font-medium text-xs">
            You have a ticket!
          </span>
        </div>
      );
    }

    if (queuePosition?.status === "offered") {
      return <PurchaseTicket eventId={eventId} />;
    }

    if (queuePosition?.status === "waiting") {
      return (
        <div className="flex items-center gap-1.5 p-1.5 rounded border border-primary/20 bg-primary/5">
          <Ticket className="w-3 h-3 text-primary" />
          <span className="text-primary text-xs font-medium">
            Queue #{queuePosition.position}
          </span>
        </div>
      );
    }

    if (queuePosition?.status === "expired") {
      return (
        <div className="flex items-center gap-1.5 p-1.5 rounded border border-destructive/20 bg-destructive/5">
          <XCircle className="w-3 h-3 text-destructive" />
          <span className="text-destructive text-xs font-medium">
            Offer expired
          </span>
        </div>
      );
    }

    return null;
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
        variant={isPastEvent ? "default" : "perspective"}
        onClick={() => router.push(`/event/${eventId}`)}
        className={`cursor-pointer transition-all duration-200 w-64 sm:w-72 lg:w-80 min-h-[320px] flex flex-col flex-shrink-0 ${
          isPastEvent ? "opacity-75 hover:opacity-100" : ""
        }`}
      >
        <CardHeader className="relative p-0">
          {imageUrl ? (
            <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-300"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="w-full h-40 bg-muted/20 rounded-t-lg flex items-center justify-center">
              <Ticket className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant={isPastEvent ? "outline" : "default"}
              className="px-2 py-1 text-xs font-medium bg-background/90 text-foreground"
            >
              £{event.price.toFixed(2)}
            </Badge>
          </div>

          {/* Category badge */}
          {event.category && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs px-2 py-1 capitalize">
                {event.category}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground line-clamp-2 leading-tight">
              {event.name}
            </CardTitle>
            {isPastEvent && (
              <Badge variant="outline" className="text-xs w-fit">
                Past Event
              </Badge>
            )}
          </div>

          <div className="space-y-1 text-muted-foreground text-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" />
              <span>
                {new Date(event.eventDate).toLocaleDateString()}
                {isPastEvent && " (Ended)"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ticket className="w-3 h-3" />
              <span>
                {availability.totalTickets - availability.purchasedCount} /{" "}
                {availability.totalTickets} available
                {!isPastEvent && availability.activeOffers > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {availability.activeOffers} buying
                  </Badge>
                )}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground text-xs line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {renderTicketStatus()}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

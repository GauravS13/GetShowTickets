"use client";

import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
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

import { EventWithAvailability } from "@/types/event";

// Compact Event Card component for carousels
export default function EventCardCompact({ event }: { event: EventWithAvailability }) {
  const { user } = useUser();
  const router = useRouter();

  // Extract data from the passed event object (no additional queries needed)
  const { availability, userTicket, queuePosition } = event;
  const imageUrl = useStorageUrl(event?.imageStorageId);

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
      return <PurchaseTicket eventId={event._id} />;
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
    <div className="group">
      <Card
        variant={isPastEvent ? "default" : "perspective"}
        onClick={() => router.push(`/event/${event._id}`)}
        className={`cursor-pointer transition-all duration-200 w-64 sm:w-72 lg:w-80 min-h-[320px] flex flex-col flex-shrink-0 hover:scale-[1.02] hover:-translate-y-1 ${
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
                loading="lazy"
                sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                quality={75}
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
    </div>
  );
}

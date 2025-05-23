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
        <div className="flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-gray-50">
          <Ticket className="w-5 h-5 text-gray-400" />
          <span className="text-gray-600 text-sm">Event is sold out</span>
        </div>
      );
    }

    if (queuePosition.position === 2) {
      return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2 p-3 rounded-md border border-amber-100 bg-amber-50">
          <div className="flex items-center gap-2">
            <CircleArrowRight className="w-5 h-5 text-amber-500" />
            <span className="text-amber-700 font-medium text-sm">
              You&apos;re next in line! (#{queuePosition.position})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LoaderCircle className="w-4 h-4 animate-spin text-amber-500" />
            <span className="text-amber-600 text-xs">Waiting for ticket</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-2 rounded-md border border-blue-100 bg-blue-50">
        <div className="flex items-center gap-2">
          <LoaderCircle className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-blue-700 text-sm">Queue position</span>
        </div>
        <Badge variant="secondary" className="text-blue-700">
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
        <div className="flex flex-col gap-2 p-3 rounded-md border border-green-100 bg-green-50 mt-2">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium text-sm">
              You have a ticket!
            </span>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/tickets/${userTicket._id}`)}
            className="shadow-sm"
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
          <div className="flex items-center gap-2 p-2 rounded-md border border-red-100 bg-red-50">
            <XCircle className="w-5 h-5 text-red-700" />
            <span className="text-red-700 font-medium text-sm">
              Offer expired
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`/event/${eventId}`);
      }}
      className={`cursor-pointer transition-shadow duration-300 hover:shadow-xl ${
        isPastEvent ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      <CardHeader className="relative">
        {imageUrl && (
          <div className="relative w-full h-48">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className="object-cover rounded-t-md"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <CardTitle className="text-xl font-bold">{event.name}</CardTitle>
            </div>
            {isPastEvent && (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-800 text-xs"
              >
                Past Event
              </Badge>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="secondary"
              className={`px-3 py-1 text-sm font-semibold ${
                isPastEvent
                  ? "bg-gray-200 text-gray-500"
                  : "bg-green-100 text-green-700"
              }`}
            >
              £{event.price.toFixed(2)}
            </Badge>
            {isEventOwner && (
              <Badge className="bg-blue-600 text-white flex items-center gap-1">
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

        <div className="space-y-3 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>
              {new Date(event.eventDate).toLocaleDateString()}{" "}
              {isPastEvent && "(Ended)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            <span>
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} available
              {!isPastEvent && availability.activeOffers > 0 && (
                <span className="text-amber-600 text-xs ml-2">
                  ({availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"}{" "}
                  buying)
                </span>
              )}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2">
          {event.description}
        </p>
      </CardContent>

      <CardFooter className="p-4">{renderTicketStatus()}</CardFooter>
    </Card>
  );
}

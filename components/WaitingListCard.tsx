"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { AlertCircle, Calendar, Clock, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WaitingListCardProps {
  waitingListEntry: {
    _id: string;
    eventId: string;
    status: "waiting" | "offered" | "purchased" | "expired";
    offerExpiresAt?: number;
    event: {
      _id: string;
      name: string;
      description: string;
      location: string;
      city?: string;
      eventDate: number;
      price: number;
      imageStorageId?: string;
      category?: string;
    } | null;
  };
  queuePosition?: number;
}

export default function WaitingListCard({ waitingListEntry, queuePosition }: WaitingListCardProps) {
  const router = useRouter();
  const imageUrl = useStorageUrl(waitingListEntry.event?.imageStorageId as Id<"_storage"> | undefined);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Calculate time left for offers
  useEffect(() => {
    if (waitingListEntry.status === "offered" && waitingListEntry.offerExpiresAt) {
      const updateTimer = () => {
        const now = Date.now();
        const expiresAt = waitingListEntry.offerExpiresAt!;
        const timeLeftMs = expiresAt - now;

        if (timeLeftMs <= 0) {
          setTimeLeft("Expired");
          return;
        }

        const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [waitingListEntry.status, waitingListEntry.offerExpiresAt]);

  if (!waitingListEntry.event) {
    return null;
  }

  const eventDate = new Date(waitingListEntry.event.eventDate);
  const isPastEvent = waitingListEntry.event.eventDate < Date.now();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-50 border-yellow-500 text-yellow-700";
      case "offered":
        return "bg-green-50 border-green-500 text-green-700";
      case "purchased":
        return "bg-blue-50 border-blue-500 text-blue-700";
      case "expired":
        return "bg-red-50 border-red-500 text-red-700";
      default:
        return "bg-gray-50 border-gray-500 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "In Queue";
      case "offered":
        return "Offer Available";
      case "purchased":
        return "Purchased";
      case "expired":
        return "Offer Expired";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Users className="w-4 h-4" />;
      case "offered":
        return <Ticket className="w-4 h-4" />;
      case "purchased":
        return <Calendar className="w-4 h-4" />;
      case "expired":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${
      waitingListEntry.status === "offered" ? "ring-2 ring-green-500/20" : ""
    }`}>
      <CardHeader className="relative p-0">
        {imageUrl ? (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={imageUrl}
              alt={waitingListEntry.event.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full h-48 bg-muted/20 rounded-t-lg flex items-center justify-center">
            <Ticket className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`px-2 py-1 text-xs font-medium flex items-center gap-1 ${getStatusColor(waitingListEntry.status)}`}
          >
            {getStatusIcon(waitingListEntry.status)}
            {getStatusText(waitingListEntry.status)}
          </Badge>
        </div>

        {/* Category Badge */}
        {waitingListEntry.event.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs px-2 py-1 capitalize">
              {waitingListEntry.event.category}
            </Badge>
          </div>
        )}

        {/* Queue Position */}
        {queuePosition && waitingListEntry.status === "waiting" && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="default" className="bg-primary/90 text-primary-foreground">
              Position #{queuePosition}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Event Title */}
        <div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {waitingListEntry.event.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {waitingListEntry.event.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="line-clamp-1">
              {waitingListEntry.event.location}
              {waitingListEntry.event.city && `, ${waitingListEntry.event.city}`}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 text-sm">
            <Ticket className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              £{waitingListEntry.event.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status-specific content */}
        {waitingListEntry.status === "offered" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
              <AlertCircle className="w-4 h-4" />
              Ticket Available!
            </div>
            <p className="text-sm text-green-600 mb-3">
              You have a ticket offer. Act quickly before it expires!
            </p>
            {timeLeft && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Clock className="w-4 h-4" />
                <span>Expires in: {timeLeft}</span>
              </div>
            )}
          </div>
        )}

        {waitingListEntry.status === "waiting" && queuePosition && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-700 font-medium mb-1">
              <Users className="w-4 h-4" />
              In Queue
            </div>
            <p className="text-sm text-yellow-600">
              You&apos;re #{queuePosition} in line. We&apos;ll notify you when tickets become available.
            </p>
          </div>
        )}

        {waitingListEntry.status === "expired" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
              <AlertCircle className="w-4 h-4" />
              Offer Expired
            </div>
            <p className="text-sm text-red-600">
              Your ticket offer has expired. You can join the queue again if tickets become available.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {isPastEvent ? "Event has passed" : "Event upcoming"}
          </div>

          <div className="flex items-center gap-2">
            {waitingListEntry.status === "offered" && (
              <Button
                size="sm"
                onClick={() => router.push(`/event/${waitingListEntry.eventId}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                Purchase Now
              </Button>
            )}

            {waitingListEntry.status === "waiting" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/event/${waitingListEntry.eventId}`)}
              >
                View Event
              </Button>
            )}

            {waitingListEntry.status === "expired" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/event/${waitingListEntry.eventId}`)}
              >
                Join Queue Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

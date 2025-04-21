"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Metrics } from "@/convex/events";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Banknote, CalendarDays, Edit, InfoIcon, Ticket } from "lucide-react";
import CancelEventButton from "./ui/CancelEventButton";

export default function SellerEventList() {
  const { user } = useUser();
  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });
  if (!events) return null;

  const upcomingEvents = events.filter((e) => e.eventDate > Date.now());
  const pastEvents = events.filter((e) => e.eventDate <= Date.now());

  return (
    <div className="space-y-12">
      <EventSection title="Upcoming Events" events={upcomingEvents} />
      {pastEvents.length > 0 && (
        <EventSection title="Past Events" events={pastEvents} />
      )}
    </div>
  );
}

function EventSection({
  title,
  events,
}: {
  title: string;
  events: (Doc<"events"> & { metrics: Metrics })[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {events.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <SellerEventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No {title.toLowerCase()}.</p>
      )}
    </section>
  );
}

function SellerEventCard({
  event,
}: {
  event: Doc<"events"> & { metrics: Metrics };
}) {
  const imageUrl = useStorageUrl(event.imageStorageId);
  const isPastEvent = event.eventDate < Date.now();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0 relative h-48">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {event.is_cancelled && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            Cancelled
          </Badge>
        )}
        {!isPastEvent && !event.is_cancelled && (
          <Badge variant="outline" className="absolute top-3 left-3">
            Active
          </Badge>
        )}
        {isPastEvent && !event.is_cancelled && (
          <Badge variant="secondary" className="absolute top-3 left-3">
            Ended
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-semibold truncate">{event.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Metric
            icon={Ticket}
            label={event.is_cancelled ? "Tickets Refunded" : "Tickets Sold"}
            value={
              event.is_cancelled
                ? String(event.metrics.refundedTickets)
                : `${event.metrics.soldTickets}/${event.totalTickets}`
            }
          />

          <Metric
            icon={Banknote}
            label={event.is_cancelled ? "Amount Refunded" : "Revenue"}
            value={`£${
              event.is_cancelled
                ? event.metrics.refundedTickets * event.price
                : event.metrics.revenue
            }`}
          />

          <Metric
            icon={CalendarDays}
            label="Date"
            value={new Date(event.eventDate).toLocaleDateString()}
          />

          <Metric
            icon={InfoIcon}
            label="Status"
            value={
              event.is_cancelled
                ? "Cancelled"
                : isPastEvent
                  ? "Ended"
                  : "Active"
            }
          />
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-end gap-2 p-4">
        {!isPastEvent && !event.is_cancelled && (
          <>
            <Link href={`/seller/events/${event._id}/edit`} passHref>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
            <CancelEventButton eventId={event._id} />
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-gray-500" />
      <div className="text-sm">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}

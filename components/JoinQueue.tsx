"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { AlertCircle, Clock, OctagonXIcon, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

interface JoinQueueProps {
  eventId: Id<"events">;
  userId: string;
}

export default function JoinQueue({ eventId, userId }: JoinQueueProps) {
  const joinWaitingList = useMutation(api.events.joinWaitingList);

  // Data fetching
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId,
  });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const event = useQuery(api.events.getById, { eventId });

  // Show spinner if queries are still loading
  if (queuePosition === undefined || availability === undefined || !event) {
    return <Spinner />;
  }

  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = userId === event.userId;
  const isSoldOut = availability.purchasedCount >= availability.totalTickets;

  // const hasExpiredOrNoQueue =
  //   !queuePosition ||
  //   queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
  //   (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
  //     queuePosition.offerExpiresAt &&
  //     queuePosition.offerExpiresAt <= Date.now());

  const canShowCard =
    !userTicket &&
    !isEventOwner &&
    !isPastEvent;

  // Handler
  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({ eventId, userId });
      if (result.success) {
        toast.success("You've joined the waiting list.");
      }
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too many times")
      ) {
        toast.error(error.data, { description: "Slow down there!" });
      } else {
        toast.error("Failed to join the queue. Please try again later.");
        console.error("Join queue error:", error);
      }
    }
  };

  if (!canShowCard) return null;

  return (
    <Card className="w-full max-w-xl mx-auto mt-6 shadow-lg rounded-2xl">
      <CardContent className="space-y-4 p-6">
        {/* Alerts */}
        {isEventOwner && (
          <Alert variant="destructive" className="flex items-center gap-4">
            <OctagonXIcon className="w-5 h-5" />
            <div>
              <AlertTitle>Not Allowed</AlertTitle>
              <AlertDescription>
                You cannot purchase a ticket for your own event.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {isPastEvent && (
          <Alert className="flex items-center gap-4 bg-muted text-muted-foreground">
            <Clock className="w-5 h-5" />
            <div>
              <AlertTitle>Event Ended</AlertTitle>
              <AlertDescription>This event has already ended.</AlertDescription>
            </div>
          </Alert>
        )}

        {isSoldOut && !isPastEvent && (
          <Alert className="flex items-center gap-4 bg-yellow-50 text-yellow-900 border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <AlertTitle>Sold Out</AlertTitle>
              <AlertDescription>
                Sorry, this event is sold out.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Button to join waiting list if conditions are met */}
        {canShowCard && (
          <Button
            onClick={handleJoinQueue}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Ticket className="w-5 h-5 mr-2" />
            {isSoldOut ? "Join Waiting List" : "Buy Ticket"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

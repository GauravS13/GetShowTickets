/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

// import { createStripeCheckoutSession } from "@/app/actions/createStripeCheckoutSession";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";

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
import ReleaseTicket from "./ReleaseTicket";

export default function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {
  const { user } = useUser();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });

  const [timeRemaining, setTimeRemaining] = useState("");
  // eslint@typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Expired");
        return;
      }
      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      if (minutes > 0) {
        setTimeRemaining(
          `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${
            seconds === 1 ? "" : "s"
          }`
        );
      } else {
        setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);

  //   const handlePurchase = async () => {
  //     if (!user) return;

  //     try {
  //       setIsLoading(true);
  //       const { sessionUrl } = await createStripeCheckoutSession({ eventId });
  //       if (sessionUrl) {
  //         router.push(sessionUrl);
  //       }
  //     } catch (error) {
  //       console.error("Error creating checkout session:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  if (!user || !queuePosition || queuePosition.status !== "offered") {
    return null;
  }

  return (
    <Card className="border border-amber-200 shadow-md">
      <CardHeader className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Ticket Reserved
          </CardTitle>
          <p className="text-sm text-gray-500">
            Expires in{" "}
            <Badge variant="outline" className="px-2 py-1">
              {timeRemaining}
            </Badge>
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
        A ticket has been reserved for you. Complete your purchase before the
        timer expires to secure your spot at this event.
      </CardContent>

      <CardFooter className="flex flex-col gap-4 p-4">
        <Button
          //   onClick={handlePurchase}
          disabled={isExpired || isLoading}
          className="w-full text-lg font-bold cursor-pointer"
        >
          {isLoading
            ? "Redirecting to checkout..."
            : "Purchase Your Ticket Now →"}
        </Button>
        <Separator />
        <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
      </CardFooter>
    </Card>
  );
}

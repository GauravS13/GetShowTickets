"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2, XCircle } from "lucide-react";
import { useState } from "react";

interface ReleaseTicketProps {
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}

export default function ReleaseTicket({
  eventId,
  waitingListId,
}: ReleaseTicketProps) {
  const [isReleasing, setIsReleasing] = useState(false);
  const releaseTicket = useMutation(api.waitingList.releaseTicket);

  const handleConfirmRelease = async () => {
    try {
      setIsReleasing(true);
      await releaseTicket({ eventId, waitingListId });
    } catch (error) {
      console.error("Error releasing ticket:", error);
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full flex items-center justify-center gap-2 text-base cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
          }}
          disabled={isReleasing}
        >
          {isReleasing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Releasing...
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" /> Release Ticket Offer
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Releasing your reserved ticket will remove you from the current
            offer queue. You may not get another offer soon.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isReleasing}
            onClick={(e) => e.stopPropagation() }
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleConfirmRelease();
              }}
              disabled={isReleasing}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
            >
              {isReleasing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Yes, release it
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

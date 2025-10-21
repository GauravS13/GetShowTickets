"use client";

import TicketDetail from "@/components/TicketDetail";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { AlertCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface TicketPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default function TicketPage({ params }: TicketPageProps) {
  const { user } = useUser();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.ticketId as Id<"tickets">;

  const ticket = useQuery(api.tickets.getTicketById, {
    ticketId,
  });

  // Show loading state
  if (ticket === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    );
  }

  // Show not found if ticket doesn't exist
  if (ticket === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The ticket you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  // Check if user owns this ticket
  if (user && ticket.userId !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have permission to view this ticket.
          </p>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  // Show sign in required
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your ticket.
          </p>
        </div>
      </div>
    );
  }

  return <TicketDetail ticket={ticket} />;
}

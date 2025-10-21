"use client";

import TicketCard from "@/components/TicketCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WaitingListCard from "@/components/WaitingListCard";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Calendar, Clock, Search, Ticket, Users } from "lucide-react";
import { useMemo, useState } from "react";

export default function TicketsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tickets");

  // Fetch user data
  const tickets = useQuery(api.events.getUserTickets, {
    userId: user?.id ?? "",
  });
  const waitingList = useQuery(api.events.getUserWaitingList, {
    userId: user?.id ?? "",
  });

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    if (!tickets) return { upcoming: [], past: [] };

    const filtered = tickets.filter((ticket) => {
      if (!ticket.event) return false;
      const matchesSearch = ticket.event.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const now = Date.now();
    const upcoming = filtered
      .filter((ticket) => ticket.event && ticket.event.eventDate > now)
      .sort((a, b) => a.event!.eventDate - b.event!.eventDate);
    
    const past = filtered
      .filter((ticket) => ticket.event && ticket.event.eventDate <= now)
      .sort((a, b) => b.event!.eventDate - a.event!.eventDate);

    return { upcoming, past };
  }, [tickets, searchQuery]);

  // Filter waiting list
  const filteredWaitingList = useMemo(() => {
    if (!waitingList) return [];

    return waitingList.filter((entry) => {
      if (!entry.event) return false;
      const matchesSearch = entry.event.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [waitingList, searchQuery]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">
            Please sign in to view your tickets and waiting list.
          </p>
        </div>
      </div>
    );
  }

  if (tickets === undefined || waitingList === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  const totalTickets = tickets.length;
  const totalWaitingList = waitingList.length;
  const upcomingTickets = filteredTickets.upcoming.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            Manage your event tickets and waiting list entries
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{totalTickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">{upcomingTickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waiting List</p>
                <p className="text-2xl font-bold text-yellow-600">{totalWaitingList}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              My Tickets ({totalTickets})
            </TabsTrigger>
            <TabsTrigger value="waiting" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Waiting List ({totalWaitingList})
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {/* Upcoming Tickets */}
            {filteredTickets.upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Upcoming Events</h2>
                  <Badge variant="secondary">{filteredTickets.upcoming.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTickets.upcoming.map((ticket) => (
                    <TicketCard
                      key={ticket._id}
                      ticket={ticket}
                      variant="upcoming"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Tickets */}
            {filteredTickets.past.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Past Events</h2>
                  <Badge variant="outline">{filteredTickets.past.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTickets.past.map((ticket) => (
                    <TicketCard
                      key={ticket._id}
                      ticket={ticket}
                      variant="past"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for Tickets */}
            {totalTickets === 0 && (
              <div className="text-center py-16">
                <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring events and purchase your first ticket!
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Browse Events
                </Button>
              </div>
            )}

            {/* No Results */}
            {totalTickets > 0 && filteredTickets.upcoming.length === 0 && filteredTickets.past.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </TabsContent>

          {/* Waiting List Tab */}
          <TabsContent value="waiting" className="space-y-6">
            {filteredWaitingList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWaitingList.map((entry) => (
                  <WaitingListCard
                    key={entry._id}
                    waitingListEntry={entry}
                    queuePosition={Math.floor(Math.random() * 50) + 1} // TODO: Get actual queue position
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {totalWaitingList === 0 ? "No waiting list entries" : "No entries found"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {totalWaitingList === 0 
                    ? "Join waiting lists for sold-out events to get notified when tickets become available."
                    : "Try adjusting your search terms"
                  }
                </p>
                {totalWaitingList === 0 && (
                  <Button onClick={() => window.location.href = "/"}>
                    Browse Events
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

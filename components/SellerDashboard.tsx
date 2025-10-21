"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CalendarDays, MapPin, Plus, UserCheck } from "lucide-react";
import { Spinner } from "./ui/spinner";

export default function SellerDashboard() {
  const { user } = useUser();

  // 1️⃣ Fetch your own events to show stats:
  const allEvents = useQuery(api.events.get);
  const myEvents = allEvents?.filter((e) => e.userId === user?.id) || [];
  const upcoming = myEvents.filter((e) => e.eventDate > Date.now()).length;
  const past = myEvents.filter((e) => e.eventDate <= Date.now()).length;

  // 3️⃣ Loading states:
  if (!user || allEvents === undefined) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Dashboard Header */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <CardTitle className="text-2xl">Seller Dashboard</CardTitle>
          <CardDescription className="mt-1">
            Manage your events and payment settings
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Events Management */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                My Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Created</p>
                  <p className="text-xl font-bold">{myEvents.length}</p>
                </div>
                <div className="space-x-2">
                  <Badge variant="outline">Upcoming: {upcoming}</Badge>
                  <Badge variant="outline">Past: {past}</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="sm" className="flex-1">
                  <Link
                    href="/seller/new-event"
                    className="flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Create Event
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm" className="flex-1">
                  <Link
                    href="/seller/events"
                    className="flex items-center justify-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4" /> View My Events
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm" className="flex-1">
                  <Link
                    href="/seller/venues"
                    className="flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" /> Manage Venues
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

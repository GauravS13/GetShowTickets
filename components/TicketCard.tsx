"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { Calendar, Clock, Download, Eye, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface TicketCardProps {
  ticket: {
    _id: string;
    eventId: string;
    purchasedAt: number;
    status: "valid" | "used" | "refunded" | "cancelled";
    amount?: number;
    seatRef?: {
      sectionId: string;
      row: string;
      seatNumber: string;
    };
    ticketType?: string;
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
  variant?: "upcoming" | "past";
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter();
  const imageUrl = useStorageUrl(ticket.event?.imageStorageId as Id<"_storage"> | undefined);
  
  if (!ticket.event) {
    return null;
  }
  
  const eventDate = new Date(ticket.event.eventDate);
  const purchaseDate = new Date(ticket.purchasedAt);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-50 border-green-500 text-green-700";
      case "used":
        return "bg-gray-50 border-gray-500 text-gray-700";
      case "cancelled":
        return "bg-red-50 border-red-500 text-red-700";
      case "refunded":
        return "bg-blue-50 border-blue-500 text-blue-700";
      default:
        return "bg-gray-50 border-gray-500 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid":
        return "Valid";
      case "used":
        return "Used";
      case "cancelled":
        return "Cancelled";
      case "refunded":
        return "Refunded";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="relative p-0">
        {imageUrl ? (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={imageUrl}
              alt={ticket.event.name}
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
            className={`px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}
          >
            {getStatusText(ticket.status)}
          </Badge>
        </div>

        {/* Category Badge */}
        {ticket.event.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs px-2 py-1 capitalize">
              {ticket.event.category}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Event Title */}
        <div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {ticket.event.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {ticket.event.description}
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
              {ticket.event.location}
              {ticket.event.city && `, ${ticket.event.city}`}
            </span>
          </div>

          {/* Seat Information */}
          {ticket.seatRef && (
            <div className="flex items-center gap-2 text-sm">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span>
                {ticket.seatRef.sectionId} - Row {ticket.seatRef.row}, Seat {ticket.seatRef.seatNumber}
              </span>
            </div>
          )}

          {/* Purchase Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Purchased on {purchaseDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              £{ticket.amount?.toFixed(2) || ticket.event.price.toFixed(2)}
            </span>
            {ticket.ticketType && (
              <Badge variant="outline" className="text-xs">
                {ticket.ticketType}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/tickets/${ticket._id}`);
              }}
              className="gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
            
            {ticket.status === "valid" && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement PDF download
                }}
                className="gap-1"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

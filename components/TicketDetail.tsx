"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import {
    ArrowLeft,
    Calendar,
    Check,
    Copy,
    Download,
    MapPin,
    QrCode,
    Share2,
    Ticket
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface TicketDetailProps {
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
    };
    qrData: string;
  };
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  const router = useRouter();
  const imageUrl = useStorageUrl(ticket.event.imageStorageId as Id<"_storage"> | undefined);
  const [copied, setCopied] = useState(false);
  const [qrRendered, setQrRendered] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const eventDate = new Date(ticket.event.eventDate);
  const purchaseDate = new Date(ticket.purchasedAt);
  const isPastEvent = ticket.event.eventDate < Date.now();

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

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Ticket-${ticket._id}`,
  });

  useEffect(() => {
    // Ensure QR code is rendered
    setQrRendered(true);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ticket for ${ticket.event.name}`,
          text: `I have a ticket for ${ticket.event.name} on ${eventDate.toLocaleDateString()}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(ticket._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCalendar = () => {
    const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ticket.event.name)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(ticket.event.description)}&location=${encodeURIComponent(ticket.event.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ticket Details</h1>
            <p className="text-muted-foreground">Your ticket for {ticket.event.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Display */}
          <div className="lg:col-span-2">
            <Card ref={ticketRef} className="overflow-hidden print:shadow-none print:border-2 print:border-black">
              {/* Event Banner */}
              <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={ticket.event.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Ticket className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge
                    className={`px-3 py-1 text-sm font-medium ${getStatusColor(ticket.status)}`}
                  >
                    {getStatusText(ticket.status)}
                  </Badge>
                </div>

                {/* Event Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white print:text-black">
                  <h2 className="text-2xl font-bold mb-1 print:text-black">{ticket.event.name}</h2>
                  <p className="text-white/90 line-clamp-2 print:text-black">{ticket.event.description}</p>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Event Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {eventDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ticket.event.location}</p>
                      {ticket.event.city && (
                        <p className="text-sm text-muted-foreground">{ticket.event.city}</p>
                      )}
                    </div>
                  </div>

                  {/* Seat Information */}
                  {ticket.seatRef && (
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {ticket.seatRef.sectionId} - Row {ticket.seatRef.row}, Seat {ticket.seatRef.seatNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">Seat Assignment</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Booking Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Booking Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Booking ID</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{ticket._id}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyTicketId}
                          className="h-6 w-6 p-0 print:hidden"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">
                        {purchaseDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Amount Paid</p>
                      <p className="font-medium text-lg">
                        £{ticket.amount?.toFixed(2) || ticket.event.price.toFixed(2)}
                      </p>
                    </div>

                    {ticket.ticketType && (
                      <div>
                        <p className="text-sm text-muted-foreground">Ticket Type</p>
                        <Badge variant="outline">{ticket.ticketType}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code and Actions */}
          <div className="space-y-6">
            {/* QR Code */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  <h3 className="font-semibold">Entry QR Code</h3>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 inline-block print:border-black print:border-2 print:bg-white">
                  {qrRendered && (
                    <QRCodeCanvas
                      value={ticket.qrData}
                      size={200}
                      level="M"
                      includeMargin={true}
                      className="print:block print:opacity-100"
                      style={{ 
                        display: 'block',
                        maxWidth: '200px',
                        height: 'auto'
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 print:text-black">
                  Show this QR code at the event entrance
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {ticket.status === "valid" && (
                  <>
                    <Button
                      onClick={handlePrint}
                      className="w-full gap-2 print:hidden"
                      variant="outline"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>

                    <Button
                      onClick={handleShare}
                      className="w-full gap-2 print:hidden"
                      variant="outline"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Ticket
                    </Button>

                    <Button
                      onClick={handleAddToCalendar}
                      className="w-full gap-2 print:hidden"
                      variant="outline"
                    >
                      <Calendar className="w-4 h-4" />
                      Add to Calendar
                    </Button>
                  </>
                )}

                <Button
                  onClick={() => router.push(`/event/${ticket.eventId}`)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Ticket className="w-4 h-4" />
                  View Event
                </Button>

                {copied && (
                  <div className="text-center text-sm text-green-600">
                    Copied to clipboard!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-sm">Important Notes</h3>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Arrive at least 30 minutes before the event starts</p>
                <p>• Keep your ticket safe and don&apos;t share the QR code</p>
                <p>• Contact support if you have any issues</p>
                {isPastEvent && (
                  <p className="text-amber-600 font-medium">
                    • This event has already passed
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

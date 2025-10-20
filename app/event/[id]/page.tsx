"use client";

import EventCarousel from "@/components/EventCarousel";
import StickyBookingCard from "@/components/StickyBookingCard";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    Clock,
    Globe,
    MapPin,
    Share2,
    StarIcon,
    Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventPage({ params }: EventPageProps) {
  const { user } = useUser();
  const router = useRouter();

  const resolvedParams = use(params);
  const eventId = resolvedParams.id as Id<"events">;

  // Load data using Convex queries
  const event = useQuery(api.events.getById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const imageUrl = useStorageUrl(event?.imageStorageId);
  
  // Fetch similar events
  const similarEvents = useQuery(api.events.getByCategory, { 
    category: event?.category || "" 
  });

  // Show loading spinner while data is loading
  if (!event || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event?.userId;

  // Format date and time
  const eventDateTime = new Date(event.eventDate).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="hero-banner">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="hero-overlay" />
        
        {/* Share Button */}
        <div className="hero-share">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: event.name,
                  text: event.description,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="bg-black/20 hover:bg-black/40 text-white border-white/20"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-badges">
            {event.category && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {event.category}
              </Badge>
            )}
            {event.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/30">
                {tag}
              </Badge>
            ))}
            {isEventOwner && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <StarIcon className="w-3 h-3 mr-1" />
                Your Event
              </Badge>
            )}
            {isPastEvent && (
              <Badge variant="destructive" className="bg-red-500/20 text-white border-red-500/30">
                Past Event
              </Badge>
            )}
          </div>
          <h1 className="hero-title">{event.name}</h1>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-4">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight className="separator" />
          {event.category && (
            <>
              <Link href={`/category/${event.category}`} className="capitalize">
                {event.category}
              </Link>
              <ChevronRight className="separator" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-xs">
            {event.name}
          </span>
        </nav>

        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="event-details-grid">
        {/* Left Column - Event Content */}
        <div className="event-content">
          {/* Event Info */}
          <div className="event-info-card">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{eventDateTime}</div>
                  {isPastEvent && <div className="text-sm text-muted-foreground">(Ended)</div>}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div className="font-medium">{event.location}</div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div className="font-medium">
                  {availability.totalTickets - availability.purchasedCount} / {availability.totalTickets} available
                  {!isPastEvent && availability.activeOffers > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {availability.activeOffers} {availability.activeOffers === 1 ? "person" : "people"} buying
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="about-section">
            <h3>About this event</h3>
            <p>{event.description}</p>
          </div>

          {/* Event Guide */}
          {(event.language || event.duration || event.ageRestriction) && (
            <div className="event-guide">
              <h3>Event Guide</h3>
              <div className="space-y-2">
                {event.language && (
                  <div className="guide-item">
                    <Globe className="icon" />
                    <div className="content">
                      <div className="label">Language</div>
                      <div className="value">{event.language}</div>
                    </div>
                  </div>
                )}
                {event.duration && (
                  <div className="guide-item">
                    <Clock className="icon" />
                    <div className="content">
                      <div className="label">Duration</div>
                      <div className="value">{event.duration}</div>
                    </div>
                  </div>
                )}
                {event.ageRestriction && (
                  <div className="guide-item">
                    <Users className="icon" />
                    <div className="content">
                      <div className="label">Tickets Needed For</div>
                      <div className="value">{event.ageRestriction}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Venue Section */}
          <div className="venue-section">
            <h3>Venue</h3>
            <div className="venue-address">{event.location}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
                window.open(mapsUrl, '_blank');
              }}
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </Button>
          </div>
        </div>

        {/* Right Column - Sticky Booking */}
        <div className="event-booking">
          <StickyBookingCard eventId={eventId} event={event} />
        </div>
      </div>

      {/* Similar Events Section */}
      {similarEvents && similarEvents.length > 1 && (
        <section className="mt-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                More {event.category || 'Similar'} Events
              </h2>
              <p className="text-muted-foreground text-sm">
                Discover other amazing {event.category || 'similar'} events you might enjoy
              </p>
            </div>

            <EventCarousel 
              events={similarEvents
                .filter(similarEvent => similarEvent._id !== eventId)
                .slice(0, 6)
                .map(event => ({ _id: event._id }))
              }
              showNavigation={true}
            />

            <div className="text-center mt-6">
              {event.category && (
                <Link href={`/category/${event.category}`}>
                  <Button variant="outline" className="gap-2">
                    View All {event.category} Events
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
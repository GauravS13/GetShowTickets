import { Id } from "@/convex/_generated/dataModel";

// Base event type from schema
export interface BaseEvent {
  _id: Id<"events">;
  name: string;
  description: string;
  location: string;
  city?: string;
  category?: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  venueId?: Id<"venues">;
  seatingPlanId?: Id<"seatingPlans">;
  userId: string;
  imageStorageId?: Id<"_storage">;
  is_cancelled?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  language?: string;
  duration?: string;
  ageRestriction?: string;
}

// Availability information
export interface EventAvailability {
  isSoldOut: boolean;
  totalTickets: number;
  purchasedCount: number;
  activeOffers: number;
  remainingTickets: number;
}

// User ticket information
export interface UserTicket {
  _id: Id<"tickets">;
  eventId: Id<"events">;
  userId: string;
  purchasedAt: number;
  status: "valid" | "used" | "refunded" | "cancelled";
  paymentIntentId?: string;
  amount?: number;
  seatRef?: {
    sectionId: string;
    row: string;
    seatNumber: string;
  };
  ticketType?: string;
}

// Queue position information
export interface QueuePosition {
  _id: Id<"waitingList">;
  eventId: Id<"events">;
  userId: string;
  status: "waiting" | "offered" | "expired";
  position?: number;
  offerExpiresAt?: number;
}

// Event with availability data (returned by getHomePageData)
export interface EventWithAvailability extends BaseEvent {
  availability: EventAvailability;
  userTicket: UserTicket | null;
  queuePosition: QueuePosition | null;
}

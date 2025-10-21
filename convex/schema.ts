import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    city: v.optional(v.string()),
    category: v.optional(v.string()),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    // Seating support (optional): if provided, event uses seat-based inventory
    venueId: v.optional(v.id("venues")),
    seatingPlanId: v.optional(v.id("seatingPlans")),
    userId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    language: v.optional(v.string()),
    duration: v.optional(v.string()),
    ageRestriction: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_city", ["city"])
    .index("by_featured", ["isFeatured"])
    .index("by_category_city", ["category", "city"]) 
    .index("by_seating_plan", ["seatingPlanId"]) 
    .index("by_venue", ["venueId"]),
  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
    // Optional seat reference for seated events
    seatRef: v.optional(
      v.object({
        sectionId: v.string(),
        row: v.string(),
        seatNumber: v.string(),
      })
    ),
    ticketType: v.optional(v.string()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired")
    ),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_event_status", ["eventId", "status"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_user", ["userId"]),

  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    userId: v.string(),
    stripeConnectId: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  // Organizer venues (can be reused across events)
  venues: defineTable({
    name: v.string(),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    seatingPlanId: v.optional(v.id("seatingPlans")),
    userId: v.optional(v.string()),
  })
    .index("by_city", ["city"]) 
    .index("by_user", ["userId"]) 
    .index("by_seating_plan", ["seatingPlanId"]),

  // Seating plan templates (sections/rows)
  seatingPlans: defineTable({
    name: v.string(),
    // Sections contain pricing and layout metadata
    sections: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        rows: v.array(v.string()),
        seatLabels: v.array(v.string()),
        price: v.number(),
        capacity: v.number(),
        category: v.optional(v.union(v.literal("vip"), v.literal("premium"), v.literal("standard"), v.literal("economy"))),
        rowPricing: v.optional(v.array(v.object({
          row: v.string(),
          price: v.number(),
          category: v.optional(v.union(v.literal("vip"), v.literal("premium"), v.literal("standard"), v.literal("economy"))),
        }))),
      })
    ),
    userId: v.optional(v.string()),
    config: v.optional(v.object({
      dynamicPricing: v.optional(v.boolean()),
      categories: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        color: v.string(),
        priceMultiplier: v.number(),
      }))),
    })),
  })
    .index("by_user", ["userId"]),

  // Materialized seats per event (derived from seatingPlan on publish)
  seats: defineTable({
    eventId: v.id("events"),
    sectionId: v.string(),
    row: v.string(),
    seatNumber: v.string(),
    status: v.union(v.literal("available"), v.literal("held"), v.literal("sold")),
    holdExpiresAt: v.optional(v.number()),
    price: v.number(),
    category: v.optional(v.union(v.literal("vip"), v.literal("premium"), v.literal("standard"), v.literal("economy"))),
    rowPrice: v.optional(v.number()), // Dynamic pricing per row
  })
    .index("by_event", ["eventId"]) 
    .index("by_event_status", ["eventId", "status"]) 
    .index("by_event_section", ["eventId", "sectionId"])
    .index("by_event_category", ["eventId", "category"]),

  // Seat holds for a user, expiring if not confirmed
  seatHolds: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    seats: v.array(
      v.object({ sectionId: v.string(), row: v.string(), seatNumber: v.string() })
    ),
    expiresAt: v.number(),
    confirmed: v.optional(v.boolean()),
  })
    .index("by_event", ["eventId"]) 
    .index("by_user_event", ["userId", "eventId"]) 
    .index("by_event_expires", ["eventId", "expiresAt"]),
});

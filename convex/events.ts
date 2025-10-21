import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";

export type Metrics = {
  soldTickets: number;
  refundedTickets: number;
  cancelledTickets: number;
  revenue: number;
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    city: v.string(),
    category: v.string(),
    eventDate: v.number(), // Store as timestamp
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    isFeatured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    language: v.optional(v.string()),
    duration: v.optional(v.string()),
    ageRestriction: v.optional(v.string()),
    seatingPlanId: v.optional(v.id("seatingPlans")),
    venueId: v.optional(v.id("venues")),
  },
  handler: async (ctx, args) => {
    let finalTotalTickets = args.totalTickets;

    // If seating plan is provided, calculate totalTickets from seating plan capacity
    if (args.seatingPlanId) {
      const plan = await ctx.db.get(args.seatingPlanId);
      if (!plan) throw new Error("Seating plan not found");
      
      // Calculate total capacity by summing: sections.reduce((sum, s) => sum + (s.rows.length × s.seatLabels.length), 0)
      const totalCapacity = plan.sections.reduce((sum, section) => {
        return sum + (section.rows.length * section.seatLabels.length);
      }, 0);
      
      finalTotalTickets = totalCapacity;
    }

    // Validate tags array (max 10 tags, each max 30 chars)
    if (args.tags && args.tags.length > 10) {
      throw new Error("Maximum 10 tags allowed");
    }
    if (args.tags) {
      for (const tag of args.tags) {
        if (tag.length > 30) {
          throw new Error("Each tag must be 30 characters or less");
        }
      }
    }

    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      location: args.location,
      city: args.city,
      category: args.category,
      eventDate: args.eventDate,
      price: args.price,
      totalTickets: finalTotalTickets,
      userId: args.userId,
      isFeatured: args.isFeatured || false,
      tags: args.tags || [],
      language: args.language,
      duration: args.duration,
      ageRestriction: args.ageRestriction,
      seatingPlanId: args.seatingPlanId,
      venueId: args.venueId,
    });
    return eventId;
  },
});

// Helper function to check ticket availability for an event
export const checkAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

async function getAvailability(ctx: QueryCtx, eventId: Id<"events">) {
  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found");

  const purchasedCount = await ctx.db
    .query("tickets")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect()
    .then(
      (tickets) =>
        tickets.filter(
          (t) =>
            t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED
        ).length
    );

  const now = Date.now();
  const activeOffers = await ctx.db
    .query("waitingList")
    .withIndex("by_event_status", (q) =>
      q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
    )
    .collect()
    .then(
      (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
    );

  const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

  return {
    available: availableSpots > 0,
    availableSpots,
    totalTickets: event.totalTickets,
    purchasedCount,
    activeOffers,
  };
}

// Join waiting list for an event
export const joinWaitingList = mutation({
  // Function takes an event ID and user ID as arguments
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    // Rate limit check
    // const status = await rateLimiter.limit(ctx, "queueJoin", { key: userId });
    // if (!status.ok) {
    //   throw new ConvexError(
    //     `You've joined the waiting list too many times. Please wait ${Math.ceil(
    //       status.retryAfter / (60 * 1000)
    //     )} minutes before trying again.`
    //   );
    // }

    // First check if user already has an active entry in waiting list for this event
    // Active means any status except EXPIRED
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    // Don't allow duplicate entries
    if (existingEntry) {
      throw new Error("Already in waiting list for this event");
    }

    // Verify the event exists
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Check if there are any available tickets right now
    const { available } = await getAvailability(ctx, eventId);

    const now = Date.now();

    if (available) {
      // If tickets are available, create an offer entry
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED, // Mark as offered
        offerExpiresAt: now + DURATIONS.TICKET_OFFER, // Set expiration time
      });

      // Schedule a job to expire this offer after the offer duration
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId,
          eventId,
        }
      );
    } else {
      // If no tickets available, add to waiting list
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING, // Mark as waiting
      });
    }

    // Return appropriate status message
    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED // If available, status is offered
        : WAITING_LIST_STATUS.WAITING, // If not available, status is waiting
      message: available
        ? "Ticket offered - you have 15 minutes to purchase"
        : "Added to waiting list - you'll be notified when a ticket becomes available",
    };
  },
});

// Purchase ticket
export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
  },
  handler: async (ctx, { eventId, userId, waitingListId, paymentInfo }) => {
    console.log("Starting purchaseTicket handler", {
      eventId,
      userId,
      waitingListId,
    });

    // Verify waiting list entry exists and is valid
    const waitingListEntry = await ctx.db.get(waitingListId);
    console.log("Waiting list entry:", waitingListEntry);

    if (!waitingListEntry) {
      console.error("Waiting list entry not found");
      throw new Error("Waiting list entry not found");
    }

    if (waitingListEntry.status !== WAITING_LIST_STATUS.OFFERED) {
      console.error("Invalid waiting list status", {
        status: waitingListEntry.status,
      });
      throw new Error(
        "Invalid waiting list status - ticket offer may have expired"
      );
    }

    if (waitingListEntry.userId !== userId) {
      console.error("User ID mismatch", {
        waitingListUserId: waitingListEntry.userId,
        requestUserId: userId,
      });
      throw new Error("Waiting list entry does not belong to this user");
    }

    // Verify event exists and is active
    const event = await ctx.db.get(eventId);
    console.log("Event details:", event);

    if (!event) {
      console.error("Event not found", { eventId });
      throw new Error("Event not found");
    }

    if (event.is_cancelled) {
      console.error("Attempted purchase of cancelled event", { eventId });
      throw new Error("Event is no longer active");
    }

    try {
      console.log("Creating ticket with payment info", paymentInfo);
      // Create ticket with payment info
      await ctx.db.insert("tickets", {
        eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        paymentIntentId: paymentInfo.paymentIntentId,
        amount: paymentInfo.amount,
      });

      console.log("Updating waiting list status to purchased");
      await ctx.db.patch(waitingListId, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });

      console.log("Processing queue for next person");
      // Process queue for next person
      // await processQueue(ctx, { eventId });

      console.log("Purchase ticket completed successfully");
    } catch (error) {
      console.error("Failed to complete ticket purchase:", error);
      throw new Error(`Failed to complete ticket purchase: ${error}`);
    }
  },
});

// Get user's tickets with event information
export const getUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          event,
        };
      })
    );

    return ticketsWithEvents;
  },
});

// Get user's waiting list entries with event information
export const getUserWaitingList = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const entries = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const entriesWithEvents = await Promise.all(
      entries.map(async (entry) => {
        const event = await ctx.db.get(entry.eventId);
        return {
          ...entry,
          event,
        };
      })
    );

    return entriesWithEvents;
  },
});

export const getEventAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Seated events: compute from seats table
    if (event.seatingPlanId) {
      const allSeats = await ctx.db
        .query("seats")
        .withIndex("by_event", (q) => q.eq("eventId", eventId))
        .collect();
      const totalSeats = allSeats.length;
      const soldSeats = allSeats.filter((s) => s.status === "sold").length;
      const heldSeats = allSeats.filter((s) => s.status === "held" && (s.holdExpiresAt ?? 0) > Date.now()).length;
      const remainingSeats = Math.max(0, totalSeats - (soldSeats + heldSeats));

      // Compute min price for "onwards"
      const minPrice = allSeats.reduce((min, s) => Math.min(min, s.price), Number.POSITIVE_INFINITY);

      return {
        isSoldOut: remainingSeats <= 0,
        totalTickets: totalSeats,
        purchasedCount: soldSeats,
        activeOffers: heldSeats,
        remainingTickets: remainingSeats,
        minPrice: Number.isFinite(minPrice) ? minPrice : event.price,
      };
    }

    // Non-seated events: legacy count by tickets and waiting list offers
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const totalReserved = purchasedCount + activeOffers;

    return {
      isSoldOut: totalReserved >= event.totalTickets,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, event.totalTickets - totalReserved),
    };
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    return events.filter((event) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        event.name.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower)
      );
    });
  },
});

export const getSellerEvents = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // For each event, get ticket sales data
    const eventsWithMetrics = await Promise.all(
      events.map(async (event) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const validTickets = tickets.filter(
          (t) => t.status === "valid" || t.status === "used"
        );
        const refundedTickets = tickets.filter((t) => t.status === "refunded");
        const cancelledTickets = tickets.filter(
          (t) => t.status === "cancelled"
        );

        const metrics: Metrics = {
          soldTickets: validTickets.length,
          refundedTickets: refundedTickets.length,
          cancelledTickets: cancelledTickets.length,
          revenue: validTickets.length * event.price,
        };

        return {
          ...event,
          metrics,
        };
      })
    );

    return eventsWithMetrics;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    language: v.optional(v.string()),
    duration: v.optional(v.string()),
    ageRestriction: v.optional(v.string()),
    seatingPlanId: v.optional(v.id("seatingPlans")),
    venueId: v.optional(v.id("venues")),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;

    // Get current event to check tickets sold
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    let finalTotalTickets = updates.totalTickets;

    // If seating plan is provided, calculate totalTickets from seating plan capacity
    if (updates.seatingPlanId) {
      const plan = await ctx.db.get(updates.seatingPlanId);
      if (!plan) throw new Error("Seating plan not found");
      
      // Calculate total capacity by summing: sections.reduce((sum, s) => sum + (s.rows.length × s.seatLabels.length), 0)
      const totalCapacity = plan.sections.reduce((sum, section) => {
        return sum + (section.rows.length * section.seatLabels.length);
      }, 0);
      
      finalTotalTickets = totalCapacity;
    }

    const soldTickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    // Ensure new total tickets is not less than sold tickets
    if (finalTotalTickets < soldTickets.length) {
      throw new Error(
        `Cannot reduce total tickets below ${soldTickets.length} (number of tickets already sold)`
      );
    }

    await ctx.db.patch(eventId, { ...updates, totalTickets: finalTotalTickets });
    return eventId;
  },
});

export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Get all valid tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    if (tickets.length > 0) {
      throw new Error(
        "Cannot cancel event with active tickets. Please refund all tickets first."
      );
    }

    // Mark event as cancelled
    await ctx.db.patch(eventId, {
      is_cancelled: true,
    });

    // Delete any waiting list entries
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .collect();

    for (const entry of waitingListEntries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});

// New queries for district.in layout

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect()
      .then(events => events.filter(event => event.category === category));
  },
});

export const getByLocation = query({
  args: { city: v.string() },
  handler: async (ctx, { city }) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect()
      .then(events => events.filter(event => event.city === city));
  },
});

export const getFeaturedEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect()
      .then(events => events.filter(event => event.isFeatured === true));
  },
});

export const getCategoriesWithCount = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    const categoryCounts: Record<string, number> = {};
    events.forEach((event) => {
      if (event.category) {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));
  },
});

export const getAvailableCities = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    const cityCounts: Record<string, number> = {};
    events.forEach((event) => {
      if (event.city) {
        cityCounts[event.city] = (cityCounts[event.city] || 0) + 1;
      }
    });

    return Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
    }));
  },
});

export const getByCategoryAndCity = query({
  args: { category: v.string(), city: v.string() },
  handler: async (ctx, { category, city }) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect()
      .then(events => events.filter(event => event.category === category && event.city === city));
  },
});

export const searchAdvanced = query({
  args: { 
    searchTerm: v.string(),
    category: v.optional(v.string()),
    city: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, category, city, minPrice, maxPrice, startDate, endDate }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    return events.filter((event) => {
      // Text search
      const searchTermLower = searchTerm.toLowerCase();
      const matchesText = 
        event.name.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower) ||
        (event.city && event.city.toLowerCase().includes(searchTermLower));

      // Category filter
      const matchesCategory = !category || event.category === category;

      // City filter
      const matchesCity = !city || event.city === city;

      // Price filter
      const matchesPrice = 
        (!minPrice || event.price >= minPrice) &&
        (!maxPrice || event.price <= maxPrice);

      // Date filter
      const matchesDate = 
        (!startDate || event.eventDate >= startDate) &&
        (!endDate || event.eventDate <= endDate);

      return matchesText && matchesCategory && matchesCity && matchesPrice && matchesDate;
    });
  },
});

// Optimized query for home page data - returns all categories with availability in single request
export const getHomePageData = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, { userId }) => {
    // Get all active events in one query
    const allEvents = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    // Get user tickets and queue positions if user is authenticated
    let userTickets: Record<string, any> = {};
    let userQueuePositions: Record<string, any> = {};
    
    if (userId) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      
      const queueEntries = await ctx.db
        .query("waitingList")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      // Create lookup maps
      userTickets = tickets.reduce((acc, ticket) => {
        acc[ticket.eventId] = ticket;
        return acc;
      }, {} as Record<string, any>);

      userQueuePositions = queueEntries.reduce((acc, entry) => {
        acc[entry.eventId] = entry;
        return acc;
      }, {} as Record<string, any>);
    }

    // Calculate availability for each event
    const eventsWithAvailability = await Promise.all(
      allEvents.map(async (event) => {
        let availability;
        
        if (event.seatingPlanId) {
          // Seated events: compute from seats table
          const allSeats = await ctx.db
            .query("seats")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect();
          const totalSeats = allSeats.length;
          const soldSeats = allSeats.filter((s) => s.status === "sold").length;
          const heldSeats = allSeats.filter((s) => s.status === "held" && (s.holdExpiresAt ?? 0) > Date.now()).length;
          const remainingSeats = Math.max(0, totalSeats - (soldSeats + heldSeats));
          const minPrice = allSeats.reduce((min, s) => Math.min(min, s.price), Number.POSITIVE_INFINITY);

          availability = {
            isSoldOut: remainingSeats <= 0,
            totalTickets: totalSeats,
            purchasedCount: soldSeats,
            activeOffers: heldSeats,
            remainingTickets: remainingSeats,
            minPrice: Number.isFinite(minPrice) ? minPrice : event.price,
          };
        } else {
          // Non-seated events: legacy count by tickets and waiting list offers
          const purchasedCount = await ctx.db
            .query("tickets")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect()
            .then(
              (tickets) =>
                tickets.filter(
                  (t) =>
                    t.status === TICKET_STATUS.VALID ||
                    t.status === TICKET_STATUS.USED
                ).length
            );

          const now = Date.now();
          const activeOffers = await ctx.db
            .query("waitingList")
            .withIndex("by_event_status", (q) =>
              q.eq("eventId", event._id).eq("status", WAITING_LIST_STATUS.OFFERED)
            )
            .collect()
            .then(
              (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
            );

          const totalReserved = purchasedCount + activeOffers;

          availability = {
            isSoldOut: totalReserved >= event.totalTickets,
            totalTickets: event.totalTickets,
            purchasedCount,
            activeOffers,
            remainingTickets: Math.max(0, event.totalTickets - totalReserved),
          };
        }

        return {
          ...event,
          availability,
          userTicket: userTickets[event._id] || null,
          queuePosition: userQueuePositions[event._id] || null,
        };
      })
    );

    // Group events by category
    const eventsByCategory = eventsWithAvailability.reduce((acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = [];
      }
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, any[]>);

    // Get featured events
    const featuredEvents = eventsWithAvailability.filter(event => event.isFeatured);

    // Get category counts
    const categoryCounts = Object.entries(eventsByCategory).map(([category, events]) => ({
      category,
      count: events.length,
    }));

    return {
      featured: featuredEvents,
      comedy: eventsByCategory.comedy || [],
      music: eventsByCategory.music || [],
      sports: eventsByCategory.sports || [],
      theater: eventsByCategory.theater || [],
      activities: eventsByCategory.activities || [],
      categoryCounts,
    };
  },
});

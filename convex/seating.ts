import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { DURATIONS, TICKET_STATUS } from "./constants";

// Minimal CRUD for venues and seating plans
export const listVenues = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return [];
    return await ctx.db
      .query("venues")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createVenue = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    seatingPlanId: v.optional(v.id("seatingPlans")),
  },
  handler: async (ctx, args) => {
    const venueId = await ctx.db.insert("venues", { ...args });
    return venueId;
  },
});

export const listSeatingPlans = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return [];
    return await ctx.db
      .query("seatingPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createSeatingPlan = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    sections: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        rows: v.array(v.string()),
        seatLabels: v.array(v.string()),
        price: v.number(),
        capacity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const planId = await ctx.db.insert("seatingPlans", { ...args });
    return planId;
  },
});

// Create seating plan from template
export const createSeatingPlanFromTemplate = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    template: v.union(
      v.literal("theater"),
      v.literal("arena"),
      v.literal("conference"),
      v.literal("stadium"),
      v.literal("cabaret")
    ),
  },
  handler: async (ctx, { userId, name, template }) => {
    const templates = {
      theater: {
        sections: [
          { id: "orchestra", name: "Orchestra", rows: ["A", "B", "C", "D", "E", "F"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"], price: 2500, capacity: 120 },
          { id: "mezzanine", name: "Mezzanine", rows: ["G", "H", "I", "J"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"], price: 1800, capacity: 80 },
          { id: "balcony", name: "Balcony", rows: ["K", "L", "M"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"], price: 1200, capacity: 60 },
        ]
      },
      arena: {
        sections: [
          { id: "vip", name: "VIP Floor", rows: ["A", "B"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"], price: 5000, capacity: 60 },
          { id: "floor", name: "Floor Standing", rows: ["C", "D", "E", "F"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"], price: 3000, capacity: 120 },
          { id: "tier1", name: "Tier 1", rows: ["G", "H", "I", "J"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"], price: 2000, capacity: 120 },
          { id: "tier2", name: "Tier 2", rows: ["K", "L", "M", "N"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"], price: 1500, capacity: 120 },
        ]
      },
      conference: {
        sections: [
          { id: "front", name: "Front Section", rows: ["A", "B", "C"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40"], price: 1500, capacity: 120 },
          { id: "middle", name: "Middle Section", rows: ["D", "E", "F", "G"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40"], price: 1200, capacity: 160 },
          { id: "back", name: "Back Section", rows: ["H", "I", "J", "K"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40"], price: 800, capacity: 160 },
        ]
      },
      stadium: {
        sections: [
          { id: "premium", name: "Premium Box", rows: ["A", "B"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"], price: 8000, capacity: 40 },
          { id: "vip", name: "VIP Stands", rows: ["C", "D", "E"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"], price: 5000, capacity: 90 },
          { id: "general", name: "General Stands", rows: ["F", "G", "H", "I", "J", "K", "L", "M", "N", "O"], seatLabels: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"], price: 2000, capacity: 300 },
        ]
      },
      cabaret: {
        sections: [
          { id: "stage", name: "Stage Tables", rows: ["A", "B"], seatLabels: ["1","2","3","4","5","6","7","8"], price: 4000, capacity: 16 },
          { id: "front", name: "Front Tables", rows: ["C", "D", "E"], seatLabels: ["1","2","3","4","5","6","7","8","9","10"], price: 3000, capacity: 30 },
          { id: "back", name: "Back Tables", rows: ["F", "G", "H"], seatLabels: ["1","2","3","4","5","6","7","8","9","10"], price: 2000, capacity: 30 },
        ]
      }
    };

    const templateData = templates[template];
    const planId = await ctx.db.insert("seatingPlans", {
      userId,
      name,
      sections: templateData.sections,
    });
    return planId;
  },
});

type SeatRef = { sectionId: string; row: string; seatNumber: string };

export const generateEventSeats = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (!event.seatingPlanId) throw new Error("No seating plan attached to event");

    // Clear existing seats if any
    const existing = await ctx.db
      .query("seats")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    for (const s of existing) {
      await ctx.db.delete(s._id);
    }

    const plan = await ctx.db.get(event.seatingPlanId as Id<"seatingPlans">);
    if (!plan) throw new Error("Seating plan not found");

    // Materialize seats based on plan sections, rows, and seatLabels
    for (const section of plan.sections) {
      for (const row of section.rows) {
        for (const seatLabel of section.seatLabels) {
          // Calculate price - check for row-specific pricing first
          let seatPrice = section.price;
          let seatCategory = section.category;
          let rowPrice = undefined;
          
          if (section.rowPricing && section.rowPricing.length > 0) {
            const rowPricing = section.rowPricing.find(rp => rp.row === row);
            if (rowPricing) {
              seatPrice = rowPricing.price;
              seatCategory = rowPricing.category || section.category;
              rowPrice = rowPricing.price;
            }
          }
          
          await ctx.db.insert("seats", {
            eventId,
            sectionId: section.id,
            row,
            seatNumber: seatLabel,
            status: "available",
            holdExpiresAt: undefined,
            price: seatPrice,
            category: seatCategory,
            rowPrice: rowPrice,
          });
        }
      }
    }

    return { success: true };
  },
});

export const getEventSeating = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // If no seating plan, return empty
    if (!event.seatingPlanId) {
      return { sections: [], minPrice: event.price };
    }

    // Load seats materialized for this event
    const seats = await ctx.db
      .query("seats")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    // Group by section → rows
    const sections: Record<string, { name: string; price: number; rows: Record<string, Array<{ seatNumber: string; status: string }> > }> = {} as any;

    // Try to compute min price and section meta
    let minPrice = Number.POSITIVE_INFINITY;
    for (const s of seats) {
      minPrice = Math.min(minPrice, s.price);
      if (!sections[s.sectionId]) {
        sections[s.sectionId] = { name: s.sectionId, price: s.price, rows: {} };
      }
      if (!sections[s.sectionId].rows[s.row]) sections[s.sectionId].rows[s.row] = [];
      sections[s.sectionId].rows[s.row].push({ seatNumber: s.seatNumber, status: s.status });
    }

    if (!Number.isFinite(minPrice)) minPrice = event.price;

    // Normalize to array with sorted rows/seats
    const normalized = Object.entries(sections).map(([sectionId, section]) => ({
      id: sectionId,
      name: section.name,
      price: section.price,
      rows: Object.entries(section.rows).map(([row, seats]) => ({
        row,
        seats: seats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)),
      })),
    }));

    return { sections: normalized, minPrice };
  },
});

export const getSeatingPlanCapacity = query({
  args: { seatingPlanId: v.id("seatingPlans") },
  handler: async (ctx, { seatingPlanId }) => {
    const plan = await ctx.db.get(seatingPlanId);
    if (!plan) throw new Error("Seating plan not found");

    // Calculate total capacity by summing: sections.reduce((sum, s) => sum + (s.rows.length × s.seatLabels.length), 0)
    const totalCapacity = plan.sections.reduce((sum, section) => {
      return sum + (section.rows.length * section.seatLabels.length);
    }, 0);

    return { totalCapacity, plan };
  },
});

export const holdSeats = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    seats: v.array(v.object({ sectionId: v.string(), row: v.string(), seatNumber: v.string() })),
  },
  handler: async (ctx, { eventId, userId, seats }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (!event.seatingPlanId) throw new Error("Event is not seated");

    // Verify all seats are available
    const now = Date.now();
    for (const seat of seats) {
      const existing = await ctx.db
        .query("seats")
        .withIndex("by_event_section", (q) => q.eq("eventId", eventId).eq("sectionId", seat.sectionId))
        .filter((q) => q.and(q.eq(q.field("row"), seat.row), q.eq(q.field("seatNumber"), seat.seatNumber)))
        .first();
      if (!existing) throw new Error("Seat not found");
      if (existing.status !== "available") throw new Error("Seat not available");
    }

    // Create hold and mark seats held with expiry
    const expiresAt = now + DURATIONS.SEAT_HOLD;
    const holdId = await ctx.db.insert("seatHolds", { eventId, userId, seats, expiresAt, confirmed: false });

    for (const seat of seats) {
      // Patch the seat to held
      const s = await ctx.db
        .query("seats")
        .withIndex("by_event_section", (q) => q.eq("eventId", eventId).eq("sectionId", seat.sectionId))
        .filter((q) => q.and(q.eq(q.field("row"), seat.row), q.eq(q.field("seatNumber"), seat.seatNumber)))
        .first();
      if (!s) throw new Error("Seat missing during hold");
      await ctx.db.patch(s._id, { status: "held", holdExpiresAt: expiresAt });
    }

    // Schedule expiry
    await ctx.scheduler.runAfter(DURATIONS.SEAT_HOLD, internal.seating.expireHold, { holdId });

    return { holdId, expiresAt };
  },
});

export const getActiveHold = query({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    const now = Date.now();
    const hold = await ctx.db
      .query("seatHolds")
      .withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
      .filter((q) => q.and(q.eq(q.field("confirmed"), undefined), q.gt(q.field("expiresAt"), now)))
      .first();
    return hold || null;
  },
});

export const releaseHold = mutation({
  args: { holdId: v.id("seatHolds") },
  handler: async (ctx, { holdId }) => {
    const hold = await ctx.db.get(holdId);
    if (!hold) return;
    if (hold.confirmed) return;
    // Release seats
    const seats = await ctx.db
      .query("seats")
      .withIndex("by_event", (q) => q.eq("eventId", hold.eventId))
      .collect();

    for (const ref of hold.seats) {
      const s = seats.find((x) => x.sectionId === ref.sectionId && x.row === ref.row && x.seatNumber === ref.seatNumber);
      if (s && s.status === "held") {
        await ctx.db.patch(s._id, { status: "available", holdExpiresAt: undefined });
      }
    }

    await ctx.db.delete(holdId);
  },
});

export const confirmSeats = mutation({
  args: { holdId: v.id("seatHolds"), userId: v.string() },
  handler: async (ctx, { holdId, userId }) => {
    const hold = await ctx.db.get(holdId);
    if (!hold) throw new Error("Hold not found");
    if (hold.userId !== userId) throw new Error("Hold does not belong to user");
    if (hold.expiresAt <= Date.now()) throw new Error("Hold expired");
    if (hold.confirmed) return { success: true }; // idempotent

    // Convert held seats to tickets and mark seats sold
    const event = await ctx.db.get(hold.eventId);
    if (!event) throw new Error("Event not found");

    for (const ref of hold.seats) {
      const s = await ctx.db
        .query("seats")
        .withIndex("by_event_section", (q) => q.eq("eventId", hold.eventId).eq("sectionId", ref.sectionId))
        .filter((q) => q.and(q.eq(q.field("row"), ref.row), q.eq(q.field("seatNumber"), ref.seatNumber)))
        .first();
      if (!s) throw new Error("Seat not found during confirm");
      if (s.status !== "held") throw new Error("Seat not held");

      await ctx.db.patch(s._id, { status: "sold", holdExpiresAt: undefined });
      await ctx.db.insert("tickets", {
        eventId: hold.eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        amount: s.price,
        seatRef: { sectionId: ref.sectionId, row: ref.row, seatNumber: ref.seatNumber },
      });
    }

    await ctx.db.patch(holdId, { confirmed: true });
    return { success: true };
  },
});

export const expireHold = internalMutation({
  args: { holdId: v.id("seatHolds") },
  handler: async (ctx, { holdId }) => {
    const hold = await ctx.db.get(holdId);
    if (!hold) return;
    if (hold.confirmed) return;
    if (hold.expiresAt > Date.now()) return; // not yet expired

    // Release seats and delete hold
    const seats = await ctx.db
      .query("seats")
      .withIndex("by_event", (q) => q.eq("eventId", hold.eventId))
      .collect();

    for (const ref of hold.seats) {
      const s = seats.find((x) => x.sectionId === ref.sectionId && x.row === ref.row && x.seatNumber === ref.seatNumber);
      if (s && s.status === "held") {
        await ctx.db.patch(s._id, { status: "available", holdExpiresAt: undefined });
      }
    }

    await ctx.db.delete(holdId);
  },
});



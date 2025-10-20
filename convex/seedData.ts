import { mutation } from "./_generated/server";
import sampleData from "./sampleData.json";

export const seedEvents = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if events already exist
    const existingEvents = await ctx.db.query("events").collect();
    if (existingEvents.length > 0) {
      console.log("Events already exist, skipping seed");
      return { message: "Events already exist", count: existingEvents.length };
    }

    console.log("Seeding events...");
    
    // Insert all sample events
    const eventIds = [];
    for (const eventData of sampleData) {
      try {
        const eventId = await ctx.db.insert("events", {
          name: eventData.name,
          description: eventData.description,
          location: eventData.location,
          city: eventData.city,
          category: eventData.category,
          eventDate: eventData.eventDate,
          price: eventData.price,
          totalTickets: eventData.totalTickets,
          userId: eventData.userId,
          isFeatured: eventData.isFeatured || false,
          tags: eventData.tags || [],
          language: eventData.language,
          duration: eventData.duration,
          ageRestriction: eventData.ageRestriction,
        });
        eventIds.push(eventId);
      } catch (error) {
        console.error("Error inserting event:", eventData.name, error);
      }
    }

    console.log(`Successfully seeded ${eventIds.length} events`);
    return { 
      message: "Events seeded successfully", 
      count: eventIds.length 
    };
  },
});

export const clearEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }
    console.log(`Cleared ${events.length} events`);
    return { message: "Events cleared", count: events.length };
  },
});

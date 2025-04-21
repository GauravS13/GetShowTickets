import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return user;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, firstName, lastName, email }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        firstName,
        lastName,
        email,
      });

      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      userId,
      firstName,
      lastName,
      email,
      stripeConnectId: undefined,
    });

    return newUserId;
  },
});

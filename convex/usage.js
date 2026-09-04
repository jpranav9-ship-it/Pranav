import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const SEARCH_LIMIT = 5;

export const getUsage = query({
  args: { anonymousId: v.string() },
  returns: v.object({ searchCount: v.number(), remaining: v.number() }),
  handler: async (ctx, { anonymousId }) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_anonymousId', (q) => q.eq('anonymousId', anonymousId))
      .unique();
    const searchCount = existing?.searchCount || 0;
    return { searchCount, remaining: Math.max(0, SEARCH_LIMIT - searchCount) };
  },
});

export const reserveSearch = mutation({
  args: { anonymousId: v.string() },
  returns: v.object({ allowed: v.boolean(), remaining: v.number() }),
  handler: async (ctx, { anonymousId }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('users')
      .withIndex('by_anonymousId', (q) => q.eq('anonymousId', anonymousId))
      .unique();

    if (!existing) {
      await ctx.db.insert('users', { anonymousId, searchCount: 1, createdAt: now, updatedAt: now });
      return { allowed: true, remaining: SEARCH_LIMIT - 1 };
    }
    if (existing.searchCount >= SEARCH_LIMIT) return { allowed: false, remaining: 0 };

    const nextCount = existing.searchCount + 1;
    await ctx.db.patch(existing._id, { searchCount: nextCount, updatedAt: now });
    return { allowed: true, remaining: SEARCH_LIMIT - nextCount };
  },
});

export const refundSearch = mutation({
  args: { anonymousId: v.string() },
  returns: v.null(),
  handler: async (ctx, { anonymousId }) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_anonymousId', (q) => q.eq('anonymousId', anonymousId))
      .unique();
    if (existing && existing.searchCount > 0) {
      await ctx.db.patch(existing._id, { searchCount: existing.searchCount - 1, updatedAt: Date.now() });
    }
    return null;
  },
});

export const joinWaitlist = mutation({
  args: { email: v.string(), anonymousId: v.string() },
  returns: v.object({ added: v.boolean() }),
  handler: async (ctx, { email, anonymousId }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await ctx.db
      .query('waitlist')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .unique();
    if (existing) return { added: false };

    await ctx.db.insert('waitlist', { email: normalizedEmail, anonymousId, createdAt: Date.now() });
    return { added: true };
  },
});

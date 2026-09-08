import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const prospect = v.object({
  name: v.string(),
  role: v.string(),
  why: v.string(),
  relevance: v.string(),
  angle: v.string(),
  sourceUrl: v.string(),
  confidence: v.string(),
});

export const saveSearch = mutation({
  args: { accountId: v.id('accounts'), company: v.string(), prospects: v.array(prospect) },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error('Account not found.');
    return await ctx.db.insert('searches', { accountId: args.accountId, company: args.company, prospects: args.prospects, createdAt: Date.now() });
  },
});

export const listSearches = query({
  args: { accountId: v.id('accounts') },
  handler: async (ctx, args) => {
    return await ctx.db.query('searches').withIndex('by_accountId', (q) => q.eq('accountId', args.accountId)).order('desc').take(20);
  },
});

export const saveProspect = mutation({
  args: { accountId: v.id('accounts'), company: v.string(), prospect },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('savedProspects').withIndex('by_accountId', (q) => q.eq('accountId', args.accountId)).collect();
    const duplicate = existing.find((item) => item.prospect.name === args.prospect.name && item.company.toLowerCase() === args.company.toLowerCase());
    if (duplicate) return { id: duplicate._id, added: false };
    const id = await ctx.db.insert('savedProspects', { accountId: args.accountId, company: args.company, prospect: args.prospect, createdAt: Date.now() });
    return { id, added: true };
  },
});

export const listSavedProspects = query({
  args: { accountId: v.id('accounts') },
  handler: async (ctx, args) => {
    return await ctx.db.query('savedProspects').withIndex('by_accountId', (q) => q.eq('accountId', args.accountId)).order('desc').take(50);
  },
});

export const removeSavedProspect = mutation({
  args: { accountId: v.id('accounts'), prospectId: v.id('savedProspects') },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.prospectId);
    if (!item || item.accountId !== args.accountId) throw new Error('Saved prospect not found.');
    await ctx.db.delete(args.prospectId);
    return { ok: true };
  },
});

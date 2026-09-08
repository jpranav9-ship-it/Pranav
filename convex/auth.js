import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const SESSION_DAYS = 30;

export const register = mutation({
  args: { email: v.string(), passwordHash: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db.query('accounts').withIndex('by_email', (q) => q.eq('email', email)).unique();
    if (existing) throw new Error('An account with this email already exists.');
    const accountId = await ctx.db.insert('accounts', { email, passwordHash: args.passwordHash, createdAt: Date.now() });
    return { accountId, email };
  },
});

export const getAccount = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const account = await ctx.db.query('accounts').withIndex('by_email', (q) => q.eq('email', email)).unique();
    if (!account) return null;
    return { accountId: account._id, email: account.email, passwordHash: account.passwordHash };
  },
});

export const createSession = mutation({
  args: { accountId: v.id('accounts'), sessionTokenHash: v.string() },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error('Account not found.');
    const now = Date.now();
    const expiresAt = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
    await ctx.db.insert('sessions', { accountId: args.accountId, tokenHash: args.sessionTokenHash, expiresAt, createdAt: now });
    return { email: account.email, accountId: account._id, expiresAt };
  },
});

export const getSession = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query('sessions').withIndex('by_tokenHash', (q) => q.eq('tokenHash', args.tokenHash)).unique();
    if (!session || session.expiresAt <= Date.now()) return null;
    const account = await ctx.db.get(session.accountId);
    if (!account) return null;
    return { email: account.email, accountId: account._id, expiresAt: session.expiresAt };
  },
});

export const logout = mutation({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query('sessions').withIndex('by_tokenHash', (q) => q.eq('tokenHash', args.tokenHash)).unique();
    if (session) await ctx.db.delete(session._id);
    return { ok: true };
  },
});

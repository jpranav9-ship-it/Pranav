import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    anonymousId: v.string(),
    searchCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_anonymousId', ['anonymousId']),

  waitlist: defineTable({
    email: v.string(),
    anonymousId: v.string(),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  accounts: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  sessions: defineTable({
    accountId: v.id('accounts'),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index('by_tokenHash', ['tokenHash']).index('by_accountId', ['accountId']),
});

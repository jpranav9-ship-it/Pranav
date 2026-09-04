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
});

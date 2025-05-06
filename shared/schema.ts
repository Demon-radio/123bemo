import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Subscriber schema
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribed_at: timestamp("subscribed_at").defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

// Content schema
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // youtube, twitter, facebook
  title: text("title").notNull(),
  content: text("content"),
  image_url: text("image_url"),
  published_at: timestamp("published_at").defaultNow(),
  stats: text("stats"), // JSON string with platform-specific stats
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

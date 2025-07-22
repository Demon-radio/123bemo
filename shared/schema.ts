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

// Game Players schema
export const gamePlayers = pgTable("game_players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  game_type: text("game_type").notNull(), // "quiz", "battle", "bmo", "rpg", "tictactoe", "maze"
  score: integer("score").notNull(),
  level_reached: integer("level_reached").default(1),
  time_played: integer("time_played").default(0), // in seconds
  achievements: text("achievements").default("[]"), // JSON array of achievement IDs
  created_at: timestamp("created_at").defaultNow(),
});

// Player Points System
export const playerPoints = pgTable("player_points", {
  id: serial("id").primaryKey(),
  player_name: text("player_name").notNull(),
  email: text("email"),
  total_points: integer("total_points").default(0),
  games_played: integer("games_played").default(0),
  achievements_earned: integer("achievements_earned").default(0),
  last_played: timestamp("last_played").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

// Game Sessions for tracking detailed gameplay
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  player_name: text("player_name").notNull(),
  game_type: text("game_type").notNull(),
  score: integer("score").notNull(),
  points_earned: integer("points_earned").notNull(),
  session_duration: integer("session_duration"), // in seconds
  level_reached: integer("level_reached").default(1),
  completed: boolean("completed").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertGamePlayerSchema = createInsertSchema(gamePlayers).omit({
  id: true,
  created_at: true,
});

export const insertPlayerPointsSchema = createInsertSchema(playerPoints).omit({
  id: true,
  created_at: true,
  last_played: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  created_at: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

export type InsertGamePlayer = z.infer<typeof insertGamePlayerSchema>;
export type GamePlayer = typeof gamePlayers.$inferSelect;

export type InsertPlayerPoints = z.infer<typeof insertPlayerPointsSchema>;
export type PlayerPoints = typeof playerPoints.$inferSelect;

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

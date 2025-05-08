import { 
  users, type User, type InsertUser,
  gamePlayers, type GamePlayer, type InsertGamePlayer
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game player methods
  createGamePlayer(player: InsertGamePlayer): Promise<GamePlayer>;
  getGamePlayers(gameType?: string): Promise<GamePlayer[]>;
  getTopPlayers(gameType: string, limit: number): Promise<GamePlayer[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Game player methods
  async createGamePlayer(player: InsertGamePlayer): Promise<GamePlayer> {
    const [gamePlayer] = await db
      .insert(gamePlayers)
      .values(player)
      .returning();
    return gamePlayer;
  }
  
  async getGamePlayers(gameType?: string): Promise<GamePlayer[]> {
    if (gameType) {
      return db
        .select()
        .from(gamePlayers)
        .where(eq(gamePlayers.game_type, gameType))
        .orderBy(gamePlayers.created_at);
    }
    
    return db
      .select()
      .from(gamePlayers)
      .orderBy(gamePlayers.created_at);
  }
  
  async getTopPlayers(gameType: string, limit: number): Promise<GamePlayer[]> {
    return db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.game_type, gameType))
      .orderBy(desc(gamePlayers.score))
      .limit(limit);
  }
}

// Use database storage since we're setting up PostgreSQL
export const storage = new DatabaseStorage();

import { 
  users, type User, type InsertUser,
  gamePlayers, type GamePlayer, type InsertGamePlayer,
  playerPoints, type PlayerPoints, type InsertPlayerPoints,
  gameSessions, type GameSession, type InsertGameSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game player methods
  createGamePlayer(player: InsertGamePlayer): Promise<GamePlayer>;
  getGamePlayers(gameType?: string): Promise<GamePlayer[]>;
  getTopPlayers(gameType: string, limit: number): Promise<GamePlayer[]>;
  
  // Points system methods
  updatePlayerPoints(playerName: string, pointsToAdd: number, gameType: string): Promise<PlayerPoints>;
  getPlayerPoints(playerName: string): Promise<PlayerPoints | undefined>;
  getLeaderboard(limit: number): Promise<PlayerPoints[]>;
  
  // Game sessions
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getPlayerSessions(playerName: string, limit?: number): Promise<GameSession[]>;
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
  
  // Points system methods
  async updatePlayerPoints(playerName: string, pointsToAdd: number, gameType: string): Promise<PlayerPoints> {
    // Check if player exists
    const [existingPlayer] = await db
      .select()
      .from(playerPoints)
      .where(eq(playerPoints.player_name, playerName));
    
    if (existingPlayer) {
      // Update existing player
      const [updatedPlayer] = await db
        .update(playerPoints)
        .set({
          total_points: (existingPlayer.total_points || 0) + pointsToAdd,
          games_played: (existingPlayer.games_played || 0) + 1,
          last_played: new Date(),
        })
        .where(eq(playerPoints.player_name, playerName))
        .returning();
      return updatedPlayer;
    } else {
      // Create new player
      const [newPlayer] = await db
        .insert(playerPoints)
        .values({
          player_name: playerName,
          total_points: pointsToAdd,
          games_played: 1,
          achievements_earned: 0,
        })
        .returning();
      return newPlayer;
    }
  }
  
  async getPlayerPoints(playerName: string): Promise<PlayerPoints | undefined> {
    const [player] = await db
      .select()
      .from(playerPoints)
      .where(eq(playerPoints.player_name, playerName));
    return player || undefined;
  }
  
  async getLeaderboard(limit: number): Promise<PlayerPoints[]> {
    return db
      .select()
      .from(playerPoints)
      .orderBy(desc(playerPoints.total_points))
      .limit(limit);
  }
  
  // Game sessions
  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [gameSession] = await db
      .insert(gameSessions)
      .values(session)
      .returning();
    return gameSession;
  }
  
  async getPlayerSessions(playerName: string, limit: number = 10): Promise<GameSession[]> {
    return db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.player_name, playerName))
      .orderBy(desc(gameSessions.created_at))
      .limit(limit);
  }
}

// Use database storage since we're setting up PostgreSQL
export const storage = new DatabaseStorage();

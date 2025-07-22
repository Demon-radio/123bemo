import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertGamePlayerSchema, 
  insertGameSessionSchema,
  insertPlayerPointsSchema
} from "@shared/schema";
import { z } from "zod";

// Helper function to calculate points multiplier for different games
function getPointsMultiplier(gameType: string): number {
  const multipliers: { [key: string]: number } = {
    'quiz': 0.1,
    'battle': 0.15,
    'bmo': 0.2,
    'rpg': 0.25,
    'tictactoe': 0.1,
    'maze': 0.2
  };
  
  return multipliers[gameType] || 0.1;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/content", (req, res) => {
    res.json({
      message: "Content API endpoint",
      success: true
    });
  });

  // Subscribe endpoint
  app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    
    // Here we'd normally store the email, but for now we'll just return success
    res.json({ 
      success: true, 
      message: "Subscription successful" 
    });
  });

  // Game player routes
  
  // Save game results
  app.post("/api/games/submit-score", async (req, res) => {
    try {
      // Validate request using zod schema
      const result = insertGamePlayerSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid game player data",
          errors: result.error.format()
        });
      }
      
      // Save player data
      const gamePlayer = await storage.createGamePlayer(result.data);
      
      res.json({
        success: true,
        message: "Game score submitted successfully",
        player: gamePlayer
      });
    } catch (error) {
      console.error("Error saving game player:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save game score"
      });
    }
  });
  
  // Get top players for a game
  app.get("/api/games/top-players/:gameType", async (req, res) => {
    try {
      const { gameType } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!gameType) {
        return res.status(400).json({
          success: false,
          message: "Game type is required"
        });
      }
      
      const topPlayers = await storage.getTopPlayers(gameType, limit);
      
      res.json({
        success: true,
        players: topPlayers
      });
    } catch (error) {
      console.error("Error fetching top players:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch top players"
      });
    }
  });

  // Points system endpoints
  
  // Submit game session with points
  app.post("/api/games/submit-session", async (req, res) => {
    try {
      const result = insertGameSessionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid game session data",
          errors: result.error.format()
        });
      }
      
      // Calculate points based on score and game type
      const pointsMultiplier = getPointsMultiplier(result.data.game_type);
      const pointsEarned = Math.floor(result.data.score * pointsMultiplier);
      
      // Save game session
      const sessionData = {
        ...result.data,
        points_earned: pointsEarned
      };
      
      const gameSession = await storage.createGameSession(sessionData);
      
      // Update player points
      const updatedPlayer = await storage.updatePlayerPoints(
        result.data.player_name,
        pointsEarned,
        result.data.game_type
      );
      
      res.json({
        success: true,
        message: "Game session submitted successfully",
        session: gameSession,
        player_points: updatedPlayer,
        points_earned: pointsEarned
      });
    } catch (error) {
      console.error("Error saving game session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save game session"
      });
    }
  });
  
  // Get player points
  app.get("/api/players/:playerName/points", async (req, res) => {
    try {
      const { playerName } = req.params;
      
      if (!playerName) {
        return res.status(400).json({
          success: false,
          message: "Player name is required"
        });
      }
      
      const playerPoints = await storage.getPlayerPoints(playerName);
      
      if (!playerPoints) {
        return res.status(404).json({
          success: false,
          message: "Player not found"
        });
      }
      
      res.json({
        success: true,
        player: playerPoints
      });
    } catch (error) {
      console.error("Error fetching player points:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch player points"
      });
    }
  });
  
  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const leaderboard = await storage.getLeaderboard(limit);
      
      res.json({
        success: true,
        leaderboard
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch leaderboard"
      });
    }
  });
  
  // Get player sessions
  app.get("/api/players/:playerName/sessions", async (req, res) => {
    try {
      const { playerName } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!playerName) {
        return res.status(400).json({
          success: false,
          message: "Player name is required"
        });
      }
      
      const sessions = await storage.getPlayerSessions(playerName, limit);
      
      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      console.error("Error fetching player sessions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch player sessions"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

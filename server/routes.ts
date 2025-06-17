import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGamePlayerSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);

  return httpServer;
}

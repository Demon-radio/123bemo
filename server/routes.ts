import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}

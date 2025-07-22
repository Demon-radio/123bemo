# BEMORA Website - Replit Development Guide

## Overview

BEMORA is a professional website for Mustafa Bemo, a content creator and gaming enthusiast. This is a full-stack React application built with TypeScript, featuring interactive games, content showcase, and comprehensive SEO optimization. The website serves as a central hub for BEMORA's social media presence and includes several Adventure Time-themed interactive games.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations and Framer Motion
- **UI Components**: Radix UI with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **API Pattern**: RESTful endpoints under `/api/*`

### Development Environment
- **Package Manager**: npm
- **Bundler**: Vite with React plugin
- **Database Migrations**: Drizzle Kit
- **Development Server**: Express with Vite middleware

## Key Components

### 1. Interactive Games System
- **Catch BEMORA Game**: Full mouse-controlled catching game with falling logos and bombs
- **Quiz Games**: Adventure Time-themed trivia with multiple categories
- **Battle Game**: Turn-based combat system
- **BMO Adventure Game**: Full 2D RPG experience
- **RPG Game**: Advanced role-playing game mechanics with mobile touch controls
- **BMO X.O Game**: Tic-Tac-Toe with BMO interface and AI opponent featuring Finn/Jake characters
- **BMO Maze Game**: 5-level maze escape game with random map generation and mobile support

All games include:
- Score tracking and leaderboards
- Player registration system
- Analytics integration
- Adventure Time character themes

### 2. Content Management
- **Content Showcase**: Dynamic filtering for YouTube, Facebook, and all content
- **Social Links Integration**: Direct links to all social platforms
- **Contact Integration**: Linktree integration for centralized contact

### 3. SEO and Analytics
- **Google Analytics**: Comprehensive tracking with custom events
- **Google Ads**: Pre-configured ad slots with responsive design
- **Meta Tags**: Complete Open Graph and Twitter Card support
- **Structured Data**: JSON-LD schema markup
- **Performance Monitoring**: Core Web Vitals tracking

### 4. UI/UX Components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Framer Motion for smooth transitions
- **Component Library**: Comprehensive shadcn/ui implementation
- **Custom Branding**: Robot logo and BEMORA color scheme (turquoise/pink)

## Data Flow

### Database Schema
```typescript
// Main entities
- users: User authentication and profiles
- subscribers: Email subscription management  
- content: Content items (YouTube, Facebook, etc.)
- game_players: Game scores and player data
```

### API Endpoints
- `GET /api/content`: Retrieve content items
- `POST /api/subscribe`: Handle email subscriptions
- `POST /api/games/submit-score`: Submit game scores
- `GET /api/games/leaderboard`: Retrieve leaderboards

### State Management
- React Query for server state caching and synchronization
- Local state with React hooks for UI interactions
- Form state with React Hook Form and Zod validation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **@radix-ui/***: Headless UI components
- **react-icons**: Icon library for social media icons

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific tooling

### Analytics and Ads
- **@vercel/analytics**: Analytics integration
- **Google Analytics**: GA4 tracking implementation
- **Google AdSense**: Monetization through ads

## Deployment Strategy

### Production Deployment (Vercel)
- **Frontend**: Static build deployed to Vercel Edge Network
- **Backend**: Serverless functions on Vercel
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: DATABASE_URL required for database connection

### Build Process
1. Frontend build: `vite build` creates optimized static assets
2. Backend build: `esbuild` bundles server code for serverless deployment
3. Database migrations: `drizzle-kit push` applies schema changes

### Performance Optimizations
- Code splitting with Vite
- Image optimization for game assets
- Lazy loading for game components
- Efficient bundle sizes with tree shaking

### Monitoring and Maintenance
- Core Web Vitals tracking through custom performance monitor
- Error tracking through Vercel analytics
- Database performance monitoring through Neon dashboard
- SEO monitoring through comprehensive meta tag implementation

## Development Notes

- The application uses a monorepo structure with shared TypeScript types in `/shared`
- Database schema is centralized in `shared/schema.ts` with Zod validation
- All game assets are stored in `/attached_assets` directory
- The application is configured for both development and production environments
- Custom analytics tracking is implemented for all interactive elements

## Recent Changes (January 2025)

✓ **Fixed Critical Database Issue**: Created PostgreSQL database and resolved DATABASE_URL environment variable
✓ **Enhanced Footer Contact**: Added WhatsApp integration for design credit with rating message
✓ **Upgraded Catch BEMORA Game**: Implemented full interactive game with falling items, collision detection, and scoring
✓ **Added BMO X.O Game**: Created Tic-Tac-Toe with BMO face interface, AI opponent with difficulty levels
✓ **Improved Games Layout**: Updated to accommodate 6 games with responsive grid layout
✓ **Fixed Game Bugs**: Resolved JavaScript eval naming conflict and improved game stability
✓ **Enhanced X.O Game**: Replaced X/O with Finn and Jake character images from Adventure Time
✓ **Updated YouTube Links**: Changed footer YouTube link to shorts channel and added latest video
✓ **Added New Content**: Integrated latest YouTube short (Ql7tURnDdzk) to content showcase
✓ **Enlarged Game Icons**: Increased game tab icons from 4x4 to 6x6 for better visibility
✓ **Character Integration**: Added character previews and win counters with Finn/Jake avatars
✓ **Fixed BMO RPG Issues**: Resolved Z key resetting game, fixed special attack regeneration
✓ **Enhanced Character Images**: Made X.O game character images larger and more visible
✓ **Updated Content Video**: Replaced short with new video (920D9DjKgCo) as requested
✓ **Mobile RPG Support**: Added touch controls for BMO RPG game on mobile devices
✓ **Special Attack Regen**: Fixed special attacks to regenerate over time and on level/wave completion
✓ **Added BMO Maze Game**: Created new 5-level maze escape game with BMO character
✓ **Enhanced RPG UI**: Improved close button visibility and escape key functionality
✓ **Updated Hero Section**: Changed "Catch BEMORA" link to direct to games section
✓ **Expanded Games Layout**: Now supports 7 games with responsive grid layout
✓ **Fixed Mobile Touch**: Enhanced mobile controls for all games with better accessibility
✓ **Mobile Game Menu**: Added slide-out menu for easy game navigation on mobile devices
✓ **Language Toggle**: Implemented 8-language support (English, Arabic, Spanish, French, German, Japanese, Korean, Chinese) with RTL support
✓ **Achievement System**: Created comprehensive achievement tracking with 12 achievements across 4 categories
✓ **Audio Settings**: Added background music and sound effects controls with volume sliders and presets
✓ **Difficulty Selector**: Implemented 4 difficulty levels (Easy to Expert) with adaptive game mechanics
✓ **Updated YouTube Link**: Changed to new channel URL as requested (https://www.youtube.com/@Bemora-site)
✓ **Points System Integration**: Added comprehensive points tracking with database storage for all games
✓ **Custom Game Over Sound**: Integrated user-provided game over sound that plays twice in all games when players lose
✓ **Hero Section Update**: Changed button text from "Play All Games" to "BMO Tools" as requested
✓ **BMO Maze Game Remake**: Completely rebuilt maze game with 10 challenging levels, time limits, and proper scoring system
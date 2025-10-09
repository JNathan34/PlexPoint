# Plex Media Server Platform

## Overview

This is a full-stack web application for a personal media server platform, similar to Plex, that allows users to browse, stream, and request media content. The platform features a modern React frontend with a dark theme design, an Express.js backend API, and PostgreSQL database integration. The application includes membership tiers through Ko-fi integration, content request management via Overseerr, and comprehensive admin tools for server management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom dark theme and CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with separate sections for hero, media library, membership tiers, requests, tutorials, and admin panels

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for media, membership tiers, content requests, and server statistics
- **Data Storage**: In-memory storage implementation with interface abstraction for future database integration
- **Development Server**: Vite integration for development with HMR support

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Well-defined tables for users, media items, membership tiers, content requests, and server statistics
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Migrations**: Drizzle Kit for schema management and migrations

### Core Data Models
- **Users**: Authentication with username/password, email, and membership tier association
- **Media Items**: Movies and TV shows with metadata (title, year, poster, description, genres, rating)
- **Membership Tiers**: Ko-fi integration with pricing, features, and stream limits
- **Content Requests**: User-submitted requests with status tracking
- **Server Stats**: Real-time server monitoring data

### Authentication & Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **User Management**: Basic user authentication system with membership tier integration

### UI/UX Design Patterns
- **Dark Theme**: Consistent dark color scheme with orange accent colors
- **Responsive Design**: Mobile-first responsive layout using Tailwind CSS
- **Component Library**: Comprehensive UI component system with consistent styling
- **Navigation**: Smooth scrolling single-page application with section-based navigation

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **Build Tools**: Vite for development and building, TypeScript for type safety
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer for styling and processing

### UI Component Libraries
- **Radix UI**: Complete set of unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets (Font Awesome icons for social media)
- **Embla Carousel**: Carousel component for media display

### Backend Dependencies
- **Express.js**: Web application framework for Node.js
- **Database**: Drizzle ORM, Neon Database serverless PostgreSQL
- **Session Management**: express-session, connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Form and Validation
- **React Hook Form**: Form state management and validation
- **Hookform Resolvers**: Integration with validation schemas
- **Zod**: Runtime type validation and schema definition
- **Drizzle Zod**: Integration between Drizzle ORM and Zod schemas

### Utility Libraries
- **Class Variance Authority**: Utility for creating component variants
- **clsx**: Conditional className utility
- **date-fns**: Date manipulation and formatting
- **cmdk**: Command palette component for search functionality

### Development and Replit Integration
- **Replit Plugins**: Vite plugins for runtime error overlay and cartographer integration
- **Wouter**: Lightweight routing library for React applications
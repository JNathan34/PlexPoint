# Plex Point - Media Streaming Platform

## Overview

This is a static website for a personal media server platform (Plex Point), allowing users to browse membership tiers, contact the owner, and request media content via external services. The platform features a modern React frontend with a dark theme design, optimized for mobile devices.

## Recent Changes

### January 2026 - Static Site Conversion
- Converted from full-stack (Express.js + PostgreSQL) to fully static site
- All data now hardcoded in client/src/lib/static-data.ts
- Removed backend API dependencies and React Query
- Configured Vite for static builds with output to /dist folder
- Updated deployment configuration for static hosting
- Simplified package.json scripts for static site workflow

### January 2026 - Contact & Navigation Updates
- Changed phone contact to WhatsApp button with green highlighting
- Email button now highlights orange on hover
- Fixed mobile navigation dropdown touch handling with onTouchEnd
- Updated hero section icons: Crown for subscriptions, PlusCircle for requests

### January 2026 - Website Modernization & Mobile Optimization
- Added glassmorphism effects throughout the UI with blur backgrounds
- Implemented gradient text styling for headings and accents
- Added Framer Motion animations for smooth entrance effects and interactions
- Enhanced navigation with animated active state indicator and proper scroll offset (80px)
- Improved membership cards with tier-specific gradient icons
- Modernized FAQ section using Shadcn Accordion component
- Added floating animated elements in hero section
- Implemented prefers-reduced-motion accessibility support
- Updated color scheme with deeper backgrounds and improved contrast
- Created shared constants file (lib/constants.ts) for NAVBAR_HEIGHT and scrollToSection utility
- Optimized all sections for mobile devices with responsive typography and spacing
- Added minimum touch target sizes (44-48px) for mobile accessibility
- Membership tier buttons now show bank transfer dialog with copyable details
- Changed Diamond tier icon from Diamond to Star
- Changed hero section "4K Quality" to "HD Streaming"

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Static Site Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom dark theme and CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **Data**: Static data hardcoded in client/src/lib/static-data.ts
- **Deployment**: Static hosting with Vite build output to /dist

### Static Data Structure
- **Membership Tiers**: 6 tiers (Bronze, Silver, Gold, Diamond, Ruby, Platinum) with pricing and features
- **Server Stats**: Marketing metrics (1k+ movies, 150+ TV shows, 99.9% uptime)
- **Bank Details**: Jacob Nathan, Account: 58925008, Sort Code: 09-01-28
- **Contact**: WhatsApp: 07481 861478, Email: jacobnathan1718@gmail.com

### Component Structure
- **navigation.tsx**: Fixed header with mobile dropdown menu
- **hero-section.tsx**: Landing with stats cards and bank transfer info
- **membership-section.tsx**: Subscription tier cards with payment dialog
- **requests-section.tsx**: External link to Overseerr for content requests
- **tutorials-section.tsx**: Plex setup guides
- **chatbot.tsx**: FAQ chatbot with WhatsApp contact option
- **footer.tsx**: Site footer with legal links

### UI/UX Design Patterns
- **Dark Theme**: Consistent dark color scheme with orange accent colors
- **Responsive Design**: Mobile-first responsive layout using Tailwind CSS
- **Component Library**: Comprehensive UI component system with consistent styling
- **Navigation**: Smooth scrolling single-page application with section-based navigation
- **Animations**: Framer Motion for entrance effects and micro-interactions

## Development Scripts

```bash
npm run dev      # Start Vite dev server on port 5000
npm run build    # Build static site to /dist folder
npm run preview  # Preview production build on port 5000
```

## Deployment

Configured for static deployment:
- Build command: `npm run build`
- Output directory: `dist`
- No server-side runtime required

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM
- **Build Tools**: Vite for development and building, TypeScript for type safety
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer for styling and processing

### UI Component Libraries
- **Radix UI**: Complete set of unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets (Font Awesome icons for social media)
- **Framer Motion**: Animation library for React

### Utility Libraries
- **Class Variance Authority**: Utility for creating component variants
- **clsx**: Conditional className utility
- **tailwind-merge**: Merging Tailwind CSS classes

### Development and Replit Integration
- **Replit Plugins**: Vite plugins for runtime error overlay and cartographer integration
- **Wouter**: Lightweight routing library for React applications

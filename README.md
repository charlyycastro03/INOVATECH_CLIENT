# INOVATECH CLIENT PORTAL

## OVERVIEW
This repository contains the external-facing client portal for INOVATECH. It allows clients to log in securely, create and track helpdesk tickets, respond to ongoing support threads, and monitor their assigned service assets.

## ARCHITECTURE
- Front-end Framework: Vue 3 (Composition API) utilizing the `<script setup>` syntax.
- Build Tool: Vite.
- UI Library: Vuetify.
- State Management / Routing: Vue Router for navigation.
- API Integration: Communicates via HTTP requests (using Axios or Fetch) with the INOVATECH central API.

## DIRECTORY STRUCTURE
- `src/assets/`: Static assets such as images, icons, and global CSS stylesheets.
- `src/components/`: Reusable, modular UI components used across different views.
- `src/router/`: Routing logic defining public and protected paths.
- `src/views/`: Main pages of the application (e.g., Login, Dashboard, Ticket Creation, Ticket Details).
- `src/utils/` or `src/services/`: API handlers and utility functions for data formatting.
- `dist/`: Auto-generated upon build. Contains the compiled, minified production-ready application.

## DEVELOPMENT WORKFLOW

### Prerequisites
- Node.js (v18 or higher recommended)
- NPM or Yarn package manager

### Environment Configuration
1. Create a `.env.local` or `.env.development` file in the root directory.
2. Define the base URL for the INOVATECH central API:
   `VITE_API_BASE_URL=http://localhost:3000/api` (modify the port or URL based on your backend configuration).

### Local Execution
1. Install project dependencies by running:
   `npm install`
2. Start the local development server with hot-module replacement by running:
   `npm run dev`
3. Access the portal in your browser at the local address provided (typically `http://localhost:5173`).

### Production Build
To prepare the application for a production environment:
1. Run `npm run build`
2. The bundled files will be generated in the `dist/` folder.
3. This application is configured to be deployed as a static site (e.g., on Vercel, referencing `vercel.json`).

## DESIGN SYSTEM AND THEMING
This application implements a specific design system tailored to INOVATECH's branding.
- Light Mode: Clean, corporate design with clear contrasting elements.
- Dark Mode: Engineered for low-light environments, specifically ensuring text legibility and proper contrast ratios against dark backgrounds.
Modifications to styling should be thoroughly tested across both themes to ensure accessibility.

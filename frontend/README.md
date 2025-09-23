# Invoice Manager Frontend

A modern TypeScript React application built with Vite, TanStack Router, and TanStack DB with Electric Collections for real-time data synchronization.

## Features

- 🚀 **Vite** - Fast build tool and dev server
- ⚛️ **React 18** with TypeScript
- 🛣️ **TanStack Router** - Type-safe routing
- 🗄️ **TanStack DB** with **Electric Collections** - Real-time data sync
- 🎨 **Tailwind CSS** - Utility-first styling
- 🔐 **HTTP Basic Auth** - Secure API communication

## Getting Started

### Prerequisites

Make sure you have the Phoenix server running on `http://localhost:4000` with the Phoenix.Sync endpoints configured.

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (optional):
   Create a `.env.local` file in the frontend directory:

```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Architecture

### Real-time Data Sync

The app uses **TanStack DB** with **Electric Collections** to provide real-time synchronization with your Phoenix backend:

- **All Invoices**: Syncs from `/shapes/invoices`
- **Recurring Invoices**: Syncs from `/shapes/invoices/filtered?recurring=true`
- **Non-recurring Invoices**: Syncs from `/shapes/invoices/filtered?recurring=false`

### Authentication

API calls use HTTP Basic Authentication with credentials configured in:

- Environment variables (`VITE_ADMIN_USERNAME`, `VITE_ADMIN_PASSWORD`)
- Or defaults (`admin`, `admin123`)

### Components

- **InvoiceList** - Main list component with real-time updates
- **InvoiceCard** - Individual invoice display
- **InvoiceFilters** - Search and filter controls

### Routing

Uses TanStack Router for type-safe, file-based routing:

- `/` - Main invoices page

## API Integration

The frontend connects to your Phoenix.Sync endpoints:

```typescript
// Collections automatically sync with these endpoints
const invoicesCollection = createCollection(
  electricCollectionOptions({
    url: "/shapes/invoices",
    params: { offset: "-1" },
  })
);
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
├── lib/                # Utilities and collections
├── routes/             # TanStack Router routes
├── config.ts           # App configuration
└── main.tsx           # App entry point
```

## Deployment

1. Build the project:

```bash
npm run build
```

2. The `dist/` folder contains the production build ready for deployment.

## Notes

- The app expects the Phoenix server to be running on the same domain or configured via `VITE_API_BASE_URL`
- Real-time updates happen automatically when data changes in the backend
- Authentication is handled via HTTP Basic Auth headers for API requests
- The UI is designed to match the existing Phoenix LiveView interface

# GetShowTickets

A modern, full-featured event ticketing platform built with Next.js 15 and Convex. GetShowTickets provides comprehensive event management, advanced seating systems, waiting lists, and seller dashboards for event organizers and attendees.

## Features

### Event Discovery
- **Category-based browsing**: Comedy, Music, Sports, Theater, Activities
- **Location filtering**: Browse events by city
- **Advanced search**: Find events by name, description, or tags
- **Featured events**: Highlighted top events and recommendations

### Advanced Seating Management
- **Visual seat map designer**: Create custom seating layouts with sections and rows
- **Dynamic pricing**: Set different prices per section or individual rows
- **Real-time seat availability**: Live updates as seats are booked
- **Seat hold mechanism**: 10-minute reservation system to prevent conflicts
- **Seating plan templates**: Reusable venue layouts for multiple events

### Ticket Management
- **Secure ticket purchase**: Integrated payment processing
- **QR code generation**: Digital tickets with scannable QR codes
- **Ticket printing**: PDF generation for physical tickets
- **Refund system**: Automated refund processing for cancelled events
- **Ticket validation**: Real-time ticket status tracking

### Waiting List System
- **Queue management**: Join waiting list when events sell out
- **Automatic offers**: Get notified when tickets become available
- **Expiration handling**: Time-limited offers for fairness
- **Priority queuing**: First-come-first-served system

### Seller Dashboard
- **Event creation**: Comprehensive event setup with seating options
- **Venue management**: Create and manage reusable venues
- **Seating plan editor**: Visual tools for designing seat layouts
- **Sales analytics**: Track ticket sales and revenue
- **Event editing**: Modify events before they go live

### Authentication & Security
- **Clerk integration**: Secure user authentication
- **Role-based access**: Different permissions for buyers and sellers
- **User profiles**: Comprehensive user management
- **Stripe Connect**: Integrated payment processing for sellers

### Real-time Updates
- **Live data sync**: Instant updates across all clients
- **Convex backend**: Serverless real-time database
- **WebSocket connections**: Efficient real-time communication

## Tech Stack

### Frontend
- **Next.js 15.3**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations and transitions

### Backend
- **Convex**: Serverless backend with real-time sync
- **TypeScript**: End-to-end type safety
- **Real-time queries**: Live data updates

### Authentication
- **Clerk**: User authentication and management
- **JWT tokens**: Secure session management

### Styling & UI
- **Tailwind CSS 4**: Modern utility-first CSS
- **Radix UI**: Unstyled, accessible components
- **Lucide React**: Beautiful icon library
- **Framer Motion**: Animation library

### 3D Visualization
- **Three.js**: 3D graphics for seat maps
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers for Three.js

### Form Handling
- **React Hook Form**: Performant form library
- **Zod**: Schema validation
- **Date-fns**: Date manipulation utilities

### PDF & QR Generation
- **jsPDF**: PDF generation
- **html2canvas**: HTML to canvas conversion
- **qrcode.react**: QR code generation
- **react-to-print**: Print functionality

## Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm
- Convex account (free tier available)
- Clerk account (free tier available)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GetShowTickets
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   CONVEX_DEPLOYMENT=your-convex-deployment
   NEXT_PUBLIC_CONVEX_URL=your-convex-url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   ```

4. **Configure Convex**
   ```bash
   npx convex dev
   ```
   Follow the prompts to set up your Convex project.

5. **Configure Clerk**
   - Create a Clerk application at [clerk.com](https://clerk.com)
   - Add your domain to allowed origins
   - Copy the keys to your `.env.local` file
   - Update `convex/auth.config.ts` with your Clerk domain

6. **Seed the database**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CONVEX_DEPLOYMENT` | Your Convex deployment name | Yes |
| `NEXT_PUBLIC_CONVEX_URL` | Convex HTTP URL | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |

## Project Structure

```
GetShowTickets/
├── app/                          # Next.js App Router pages
│   ├── category/[slug]/         # Category-based event browsing
│   ├── event/[id]/              # Individual event pages
│   ├── location/[city]/         # City-based event filtering
│   ├── search/                  # Event search functionality
│   ├── seller/                  # Seller dashboard
│   │   ├── events/              # Event management
│   │   ├── new-event/           # Create new events
│   │   └── venues/              # Venue management
│   └── tickets/                 # Ticket management
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── EventCard.tsx            # Event display components
│   ├── SeatingPlanEditor.tsx    # Seating plan designer
│   ├── SellerDashboard.tsx      # Seller interface
│   └── ...                      # Feature-specific components
├── convex/                      # Backend (Convex)
│   ├── schema.ts                # Database schema
│   ├── events.ts                # Event queries/mutations
│   ├── tickets.ts               # Ticket management
│   ├── seating.ts               # Seating system
│   ├── waitingList.ts           # Waiting list logic
│   └── users.ts                 # User management
├── lib/                         # Utility functions
├── types/                       # TypeScript definitions
└── public/                      # Static assets
```

## Database Schema

### Core Tables

- **`events`**: Event details with optional seating plans
  - Basic info (name, description, location, date, price)
  - Optional venue and seating plan references
  - User ownership and metadata

- **`tickets`**: Purchased tickets with seat references
  - Event and user associations
  - Payment and status tracking
  - Optional seat references for seated events

- **`seats`**: Materialized seat inventory per event
  - Individual seat status (available, held, sold)
  - Pricing and category information
  - Hold expiration timestamps

- **`seatHolds`**: Temporary seat reservations
  - User-specific seat holds
  - Automatic expiration system
  - Confirmation tracking

- **`waitingList`**: Queue system for sold-out events
  - User queue positions
  - Offer status and expiration
  - Automatic notification system

- **`venues`**: Reusable venue definitions
  - Venue details and location
  - Associated seating plans
  - User ownership

- **`seatingPlans`**: Template-based seating layouts
  - Section and row definitions
  - Pricing configuration
  - Reusable across multiple events

- **`users`**: User profiles with Stripe Connect integration
  - Basic profile information
  - Stripe Connect for sellers
  - Authentication integration

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run seed` | Seed database with sample events |
| `npm run clear` | Clear all events from database |

## Key Features Deep Dive

### Event Management
- **Create events** with basic information or advanced seating configurations
- **Support multiple categories** and cities for better organization
- **Image upload** via Convex storage for event visuals
- **Event cancellation** system with automatic refunds

### Seating System
- **Visual seating plan editor** with drag-and-drop section/row creation
- **Dynamic pricing** per section or individual rows
- **Real-time seat availability** with live updates
- **Automatic seat hold expiration** (10 minutes) to prevent conflicts

### User Flows

#### Buyer Flow
1. Browse events by category or location
2. Search for specific events
3. Select an event and view details
4. Choose seats (if applicable) or select ticket quantity
5. Complete purchase with payment
6. View and download tickets with QR codes

#### Seller Flow
1. Create venue with seating plan (optional)
2. Design custom seating layout
3. Create event with venue and pricing
4. Manage ticket sales and analytics
5. Handle cancellations and refunds

## Development Guidelines

### File Naming Conventions
- Components: PascalCase (e.g., `EventCard.tsx`)
- Pages: lowercase with hyphens (e.g., `new-event`)
- Utilities: camelCase (e.g., `formatDate.ts`)

### Component Organization
- UI components in `/components/ui/`
- Feature components in `/components/`
- Page components in `/app/`

### Convex Patterns
- Queries: `useQuery(api.module.function, args)`
- Mutations: `useMutation(api.module.function)`
- Real-time updates: Automatic with Convex

### Error Handling
- Toast notifications with Sonner
- Form validation with Zod schemas
- Graceful fallbacks for loading states

## License

MIT License - see LICENSE file for details.

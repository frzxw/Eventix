# Eventix - Azure Cloud Ticketing Platform
## Technical Architecture & Agent Instructions

---

## 📋 Project Overview

**Eventix** is a production-ready, enterprise-grade online ticketing platform for concerts, festivals, theater, and comedy shows. Built with a dark-first glassmorphic design system, the platform provides a seamless user experience from event discovery through ticket purchase to digital wallet delivery.

**Primary Market**: Indonesia (Jakarta)  
**Currency**: Indonesian Rupiah (IDR)  
**Language**: English (en-US locale for dates)  
**Target Deployment**: Microsoft Azure Cloud Platform

---

## 🏗️ Architecture Overview

### **Application Type**
- Single Page Application (SPA) with React
- Progressive Web App (PWA) capabilities
- Server-Side Rendering (SSR) ready for Azure deployment

### **Azure Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Azure Front Door                          │
│              (CDN, WAF, SSL/TLS Termination)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  Azure Static Web Apps                           │
│              (React SPA Hosting + CI/CD)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                 Azure Functions (Node.js)                        │
│           (Serverless API Backend - TypeScript)                 │
│  ┌──────────────┬───────────────┬─────────────────────────┐   │
│  │ Auth APIs    │ Event APIs    │ Booking/Payment APIs    │   │
│  │ User APIs    │ Search APIs   │ Email/Notification APIs │   │
│  └──────────────┴───────────────┴─────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────────┐
│   Azure SQL  │ │  Azure Blob │ │ Azure Key Vault │
│   Database   │ │   Storage   │ │  (Secrets Mgmt) │
│              │ │  (Images/   │ │                 │
│  - Events    │ │   QR Codes) │ │  - API Keys     │
│  - Users     │ │             │ │  - Conn Strings │
│  - Orders    │ │             │ │  - Certificates │
│  - Tickets   │ │             │ │                 │
└──────────────┘ └─────────────┘ └─────────────────┘
        │
┌───────▼────────────────────────────────────────┐
│     Azure Cache for Redis                      │
│  (Session, Search Results, Event Listings)     │
└────────────────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────┐
│     Azure Service Bus                          │
│  (Event Processing, Email Queue)               │
└────────────────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────┐
│     Azure Application Insights                 │
│  (Monitoring, Logging, Analytics)              │
└────────────────────────────────────────────────┘
```

---

## 🎨 Design System

### **Visual Identity**
- **Brand Name**: Eventix
- **Design Language**: Glassmorphic (frosted glass effect)
- **Color Scheme**: Dark-first with vibrant accents
- **Typography**: Geist Sans (primary), Geist Mono (code)

### **Design Token System**
All styling uses CSS custom properties (design tokens) from `/styles/globals.css`:

#### Color Tokens
- `--primary-*`: Main brand colors (purple/blue gradient)
- `--accent-*`: Secondary accent colors
- `--surface-*`: Background and surface colors
- `--text-*`: Text colors (primary, secondary, tertiary)
- `--border-*`: Border colors and glass effects

#### Glassmorphic Effects
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### **Responsive Breakpoints**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### **Animation System**
- Library: Motion (formerly Framer Motion)
- Page transitions: 300ms ease-in-out
- Micro-interactions: 200ms spring animations
- Scroll-triggered animations via `useScrollAnimation` hook

---

## 🛠️ Technology Stack

### **Frontend Core**
```json
{
  "framework": "React 18+",
  "language": "TypeScript",
  "routing": "React Router v6",
  "styling": "Tailwind CSS v4.0",
  "animations": "motion/react (Framer Motion)",
  "forms": "React Hook Form 7.55.0 + Zod validation",
  "state": "React Context + Local Storage",
  "icons": "Lucide React"
}
```

### **UI Component Library**
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless component primitives
- **Sonner**: Toast notifications

### **Backend (Azure Functions)**
```json
{
  "runtime": "Node.js 18 LTS",
  "language": "TypeScript",
  "framework": "Azure Functions v4",
  "orm": "@azure/data-tables or Prisma",
  "validation": "Zod",
  "authentication": "JWT + Azure AD B2C"
}
```

### **Database (Azure SQL)**
- **Engine**: Azure SQL Database (Serverless tier for cost optimization)
- **ORM**: Prisma or TypeORM
- **Migrations**: Automated via CI/CD

### **Storage & CDN**
- **Images**: Azure Blob Storage with CDN
- **QR Codes**: Generated server-side, stored in Blob Storage
- **Static Assets**: Azure Front Door CDN

---

## 📊 Database Schema

### **Core Tables**

#### `users`
```sql
CREATE TABLE users (
  id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  email NVARCHAR(255) UNIQUE NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  first_name NVARCHAR(100),
  last_name NVARCHAR(100),
  phone_number NVARCHAR(20),
  country_code NVARCHAR(10),
  date_of_birth DATE,
  profile_image_url NVARCHAR(500),
  email_verified BIT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX idx_users_email ON users(email);
```

#### `events`
```sql
CREATE TABLE events (
  id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  category NVARCHAR(50) NOT NULL, -- concerts, festivals, theater, comedy
  date DATE NOT NULL,
  time NVARCHAR(10) NOT NULL,
  year INT GENERATED ALWAYS AS (YEAR(date)) PERSISTED,
  venue_name NVARCHAR(255) NOT NULL,
  venue_address NVARCHAR(500),
  venue_city NVARCHAR(100) NOT NULL,
  venue_capacity INT,
  image_url NVARCHAR(500),
  banner_image_url NVARCHAR(500),
  organizer_id NVARCHAR(36),
  status NVARCHAR(20) DEFAULT 'active', -- active, cancelled, postponed, completed
  tags NVARCHAR(MAX), -- JSON array
  is_featured BIT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE(),
  
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_city ON events(venue_city);
CREATE INDEX idx_events_featured ON events(is_featured);
```

#### `ticket_categories`
```sql
CREATE TABLE ticket_categories (
  id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  event_id NVARCHAR(36) NOT NULL,
  name NVARCHAR(100) NOT NULL, -- VIP, Regular, Early Bird, etc.
  description NVARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  currency NVARCHAR(3) DEFAULT 'IDR',
  quantity_total INT NOT NULL,
  quantity_sold INT DEFAULT 0,
  quantity_available AS (quantity_total - quantity_sold) PERSISTED,
  benefits NVARCHAR(MAX), -- JSON array
  sort_order INT DEFAULT 0,
  
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_ticket_categories_event ON ticket_categories(event_id);
```

#### `orders`
```sql
CREATE TABLE orders (
  id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  order_number NVARCHAR(20) UNIQUE NOT NULL, -- EVX-2025-XXXXX
  user_id NVARCHAR(36) NOT NULL,
  event_id NVARCHAR(36) NOT NULL,
  status NVARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, refunded
  
  -- Attendee Information
  attendee_first_name NVARCHAR(100) NOT NULL,
  attendee_last_name NVARCHAR(100) NOT NULL,
  attendee_email NVARCHAR(255) NOT NULL,
  attendee_phone NVARCHAR(20) NOT NULL,
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  service_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency NVARCHAR(3) DEFAULT 'IDR',
  
  -- Payment
  payment_method NVARCHAR(50),
  payment_status NVARCHAR(20) DEFAULT 'pending',
  payment_reference NVARCHAR(100),
  paid_at DATETIME2,
  
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE(),
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
```

#### `tickets`
```sql
CREATE TABLE tickets (
  id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  ticket_number NVARCHAR(20) UNIQUE NOT NULL, -- TKT-XXXXX-XXXXX
  order_id NVARCHAR(36) NOT NULL,
  event_id NVARCHAR(36) NOT NULL,
  category_id NVARCHAR(36) NOT NULL,
  
  -- QR Code
  qr_code_url NVARCHAR(500),
  qr_code_data NVARCHAR(500) UNIQUE NOT NULL,
  
  -- Ticket Status
  status NVARCHAR(20) DEFAULT 'valid', -- valid, used, cancelled, transferred
  used_at DATETIME2,
  scanned_by NVARCHAR(100),
  
  -- Transfer
  transferred_to_email NVARCHAR(255),
  transferred_at DATETIME2,
  
  created_at DATETIME2 DEFAULT GETDATE(),
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (category_id) REFERENCES ticket_categories(id)
);

CREATE INDEX idx_tickets_order ON tickets(order_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_qr ON tickets(qr_code_data);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);
```

#### `sessions` (for authentication)
```sql
CREATE TABLE sessions (
  id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  user_id NVARCHAR(36) NOT NULL,
  token_hash NVARCHAR(255) UNIQUE NOT NULL,
  device_info NVARCHAR(500),
  ip_address NVARCHAR(45),
  expires_at DATETIME2 NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## 🔌 API Structure (Azure Functions)

### **Base URL**
```
Production: https://api.eventix.azure.com
Staging: https://api-staging.eventix.azure.com
```

### **Authentication Endpoints**

#### `POST /auth/signup`
```typescript
Request: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

Response: {
  user: UserObject;
  token: string;
  refreshToken: string;
}
```

#### `POST /auth/login`
```typescript
Request: {
  email: string;
  password: string;
}

Response: {
  user: UserObject;
  token: string;
  refreshToken: string;
}
```

#### `POST /auth/verify-email`
```typescript
Request: {
  token: string;
}

Response: {
  success: boolean;
  message: string;
}
```

#### `POST /auth/forgot-password`
```typescript
Request: {
  email: string;
}

Response: {
  success: boolean;
  message: string;
}
```

### **Event Endpoints**

#### `GET /events`
```typescript
Query: {
  category?: string;
  city?: string;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'date' | 'popularity' | 'price';
}

Response: {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### `GET /events/:id`
```typescript
Response: {
  event: Event;
  ticketCategories: TicketCategory[];
  relatedEvents: Event[];
}
```

#### `GET /events/featured`
```typescript
Response: {
  events: Event[];
}
```

### **Booking Endpoints**

#### `POST /orders/create`
```typescript
Request: {
  eventId: string;
  tickets: Array<{
    categoryId: string;
    quantity: number;
  }>;
  attendeeInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

Response: {
  orderId: string;
  orderNumber: string;
  paymentUrl: string; // For payment gateway
  totalAmount: number;
}
```

#### `POST /orders/:id/confirm`
```typescript
Request: {
  paymentReference: string;
}

Response: {
  order: Order;
  tickets: Ticket[];
  success: boolean;
}
```

#### `GET /orders/my-orders`
```typescript
Query: {
  status?: string;
  page?: number;
}

Response: {
  orders: Order[];
  total: number;
}
```

### **Ticket Endpoints**

#### `GET /tickets/my-tickets`
```typescript
Response: {
  tickets: Array<{
    ticket: Ticket;
    event: Event;
    order: Order;
  }>;
}
```

#### `GET /tickets/:id/download`
```typescript
Response: PDF Buffer or Redirect to Blob Storage URL
```

#### `POST /tickets/:id/transfer`
```typescript
Request: {
  toEmail: string;
}

Response: {
  success: boolean;
  message: string;
}
```

---

## 🔐 Authentication & Security

### **Authentication Strategy**
- **Primary**: JWT tokens with refresh token rotation
- **Optional**: Azure AD B2C for social login (Google, Facebook)
- **Session Storage**: Azure Cache for Redis

### **JWT Structure**
```typescript
{
  sub: string;        // user ID
  email: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;        // 15 minutes
  type: 'access' | 'refresh';
}
```

### **Security Measures**
1. **Password Hashing**: bcrypt with salt rounds 12
2. **HTTPS Only**: Enforced via Azure Front Door
3. **CORS**: Restricted to known origins
4. **Rate Limiting**: Azure API Management
5. **SQL Injection**: Parameterized queries via ORM
6. **XSS Protection**: Content Security Policy headers
7. **CSRF**: SameSite cookies + CSRF tokens
8. **Secrets**: Azure Key Vault integration

### **Azure Key Vault Secrets**
```
- DATABASE_CONNECTION_STRING
- JWT_SECRET
- JWT_REFRESH_SECRET
- BLOB_STORAGE_CONNECTION_STRING
- SENDGRID_API_KEY (or Azure Communication Services)
- PAYMENT_GATEWAY_SECRET
- ENCRYPTION_KEY
```

---

## 📱 User Flow

### **Discovery → Decision → Purchase Flow**

```
1. HOMEPAGE (/)
   ├─ Hero Section with Universal Search
   ├─ Promotional Carousel (auto-rotating banners)
   ├─ Featured Events Carousel
   ├─ Category Grid (Concerts, Festivals, Theater, Comedy)
   └─ Trending Events Grid

2. DISCOVER PAGE (/discover)
   ├─ Filter Sidebar (glassmorphic)
   │  ├─ Category Selection
   │  ├─ Date Range
   │  ├─ Location/City
   │  └─ Price Range
   └─ Event Grid with Cards
      └─ Shows: Image, Title, Date, Venue, Price from, Year Badge

3. EVENT DETAIL PAGE (/event/:id)
   ├─ Hero Banner Image
   ├─ Event Information
   │  ├─ Title, Date, Time, Venue
   │  ├─ Description
   │  └─ Tags
   ├─ Ticket Categories Selector
   │  ├─ Category Cards (VIP, Regular, etc.)
   │  ├─ Price, Benefits, Availability
   │  └─ Quantity Selector
   └─ CTA: "Continue to Checkout"

4. CHECKOUT FLOW (/event/:id/checkout)
   
   STEP 1: Ticket Selection
   ├─ Review selected categories & quantities
   ├─ Modify selections if needed
   └─ Continue to attendee info
   
   STEP 2: Attendee Information
   ├─ First Name, Last Name
   ├─ Email (for ticket delivery)
   ├─ Phone Number with country code
   └─ Continue to payment
   
   STEP 3: Payment & Confirmation
   ├─ Order Summary
   ├─ Payment Method Selection
   ├─ Terms & Conditions acceptance
   └─ Complete Purchase

5. ORDER CONFIRMATION (/order-confirmation)
   ├─ Success Animation
   ├─ Order Details (Order ID, tickets, total)
   ├─ Email Confirmation Notice
   └─ Actions: View Tickets, Download PDF

6. MY TICKETS (/my-tickets)
   ├─ Upcoming Events
   │  └─ Ticket Cards with QR Codes
   └─ Past Events
      └─ Historical Tickets
```

### **Authentication Flow**
```
LOGIN (/auth/login)
├─ Email + Password
├─ "Forgot Password?" link
└─ "Don't have account?" → Sign Up

SIGN UP (/auth/signup)
├─ Email, Password, Name
├─ Email verification sent
└─ Redirect to /auth/verify-email

FORGOT PASSWORD (/auth/forgot-password)
├─ Email input
├─ Reset link sent
└─ Redirect to /auth/reset-password

PROFILE (/profile)
├─ Personal Information (editable)
├─ Change Password
├─ Order History
└─ Saved Payment Methods
```

---

## 🎯 Core Features

### **1. Universal Search**
- Location: Homepage hero, Header (all pages)
- Functionality: Real-time search across events, venues, artists
- Implementation: Azure Cognitive Search or client-side Fuse.js
- Debounced input (300ms)
- Shows top 5 results with "View all results" link

### **2. Event Discovery**
- **Filters**: Category, Date, Location, Price
- **Sorting**: Date, Popularity, Price (Low to High, High to Low)
- **Pagination**: 12 events per page
- **Glassmorphic Filter Sidebar**: Sticky on desktop, drawer on mobile

### **3. Ticket Booking System**
- **Multi-category Selection**: Users can book multiple ticket types
- **Real-time Availability**: Check availability before payment
- **Quantity Limits**: Max 10 tickets per order (configurable)
- **Transparent Pricing**: Show subtotal, fees, taxes, total

### **4. Payment Integration**
**Recommended Azure-Compatible Payment Gateways**:
- Midtrans (Indonesia primary)
- Stripe (International)
- PayPal
- Bank Transfer (Virtual Account)

### **5. Digital Wallet Tickets**
- **QR Code Generation**: Unique per ticket
- **PDF Generation**: Server-side using jsPDF or Puppeteer
- **Email Delivery**: Azure Communication Services or SendGrid
- **Offline Access**: Download PDF, save to Apple/Google Wallet

### **6. Ticket Transfer**
- Email-based transfer system
- Original ticket invalidated, new ticket issued
- Transfer history tracking

### **7. Notifications**
- **Email**: Order confirmations, ticket delivery, event reminders
- **In-app**: Toast notifications (Sonner)
- **SMS** (Optional): Via Azure Communication Services

---

## 🎨 Component Architecture

### **Atomic Design Structure**

```
components/
├── ui/                    # Shadcn/UI primitives (atoms)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ... (60+ components)
│
├── common/                # Reusable molecules
│   ├── AnimatedButton.tsx
│   └── LoadingSpinner.tsx
│
├── events/                # Event-specific organisms
│   ├── EventCard.tsx      # Card display for event
│   ├── EventDetail.tsx    # Full event information
│   └── FilterSidebar.tsx  # Glassmorphic filters
│
├── booking/               # Booking flow organisms
│   ├── BookingStep1.tsx   # Ticket selection
│   ├── BookingStep2.tsx   # Attendee info
│   ├── BookingStep3.tsx   # Payment
│   ├── CategorySelector.tsx
│   └── OrderSummary.tsx
│
├── tickets/               # Ticket display
│   └── WalletTicket.tsx   # Digital ticket with QR
│
├── home/                  # Homepage sections
│   ├── Hero.tsx
│   ├── PromoCarousel.tsx
│   ├── EventCarousel.tsx
│   ├── CategoryGrid.tsx
│   └── SearchBar.tsx
│
├── layout/                # Layout components
│   ├── Header.tsx         # Main navigation
│   └── Footer.tsx         # Footer with links
│
├── profile/               # User profile
│   └── ProfilePage.tsx
│
└── search/                # Search functionality
    └── SearchModal.tsx
```

### **Key Component Patterns**

#### Glassmorphic Card Pattern
```tsx
<div className="relative rounded-3xl overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
  <div className="relative p-8">
    {/* Content */}
  </div>
</div>
```

#### Motion Animation Pattern
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

---

## 🚀 Azure Deployment Guide

### **Prerequisites**
1. Azure Subscription
2. Azure CLI installed
3. Node.js 18 LTS
4. Git repository (Azure DevOps or GitHub)

### **Step 1: Create Azure Resources**

```bash
# Login to Azure
az login

# Create Resource Group
az group create --name eventix-rg --location southeastasia

# Create Azure SQL Database
az sql server create \
  --name eventix-sql-server \
  --resource-group eventix-rg \
  --location southeastasia \
  --admin-user sqladmin \
  --admin-password <SecurePassword>

az sql db create \
  --resource-group eventix-rg \
  --server eventix-sql-server \
  --name eventix-db \
  --service-objective S0 \
  --compute-model Serverless

# Create Storage Account
az storage account create \
  --name eventixstorage \
  --resource-group eventix-rg \
  --location southeastasia \
  --sku Standard_LRS

# Create Blob Containers
az storage container create \
  --name event-images \
  --account-name eventixstorage

az storage container create \
  --name qr-codes \
  --account-name eventixstorage

# Create Azure Cache for Redis
az redis create \
  --name eventix-cache \
  --resource-group eventix-rg \
  --location southeastasia \
  --sku Basic \
  --vm-size c0

# Create Key Vault
az keyvault create \
  --name eventix-keyvault \
  --resource-group eventix-rg \
  --location southeastasia
```

### **Step 2: Deploy Static Web App**

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Build the React app
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name eventix-app \
  --resource-group eventix-rg \
  --location eastasia \
  --source https://github.com/your-org/eventix \
  --branch main \
  --app-location "/" \
  --api-location "api" \
  --output-location "dist"
```

### **Step 3: Deploy Azure Functions (Backend)**

```bash
# Create Function App
az functionapp create \
  --resource-group eventix-rg \
  --consumption-plan-location southeastasia \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name eventix-api \
  --storage-account eventixstorage

# Deploy Functions
cd api
func azure functionapp publish eventix-api
```

### **Step 4: Configure Environment Variables**

```bash
# Add secrets to Key Vault
az keyvault secret set \
  --vault-name eventix-keyvault \
  --name DATABASE-URL \
  --value "Server=tcp:eventix-sql-server.database.windows.net,1433;Initial Catalog=eventix-db;..."

az keyvault secret set \
  --vault-name eventix-keyvault \
  --name JWT-SECRET \
  --value "<your-jwt-secret>"

# Configure Function App to use Key Vault
az functionapp config appsettings set \
  --name eventix-api \
  --resource-group eventix-rg \
  --settings "@Microsoft.KeyVault(SecretUri=https://eventix-keyvault.vault.azure.net/secrets/DATABASE-URL/)"
```

### **Step 5: Setup CI/CD**

**GitHub Actions Workflow** (`.github/workflows/azure-deploy.yml`):
```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "dist"
```

---

## 📝 Development Guidelines

### **Code Style**
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with React + TypeScript rules
- **Formatting**: Prettier (2 spaces, single quotes)
- **Naming Conventions**:
  - Components: PascalCase (`EventCard.tsx`)
  - Functions/Variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - CSS Custom Properties: kebab-case

### **Component Guidelines**
1. **Never use hardcoded font sizes** - use typography tokens from `globals.css`
2. **Always use design tokens** for colors, spacing, borders
3. **Preserve glassmorphic patterns** - don't override without reason
4. **Responsive-first** - mobile → tablet → desktop
5. **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation

### **Tailwind Rules**
```typescript
// ❌ DON'T
<h1 className="text-3xl font-bold">Title</h1>

// ✅ DO
<h1>Title</h1> // Typography defined in globals.css

// ✅ DO (if specifically needed)
<p className="text-[var(--text-secondary)]">Description</p>
```

### **Animation Guidelines**
- **Page transitions**: 300ms
- **Micro-interactions**: 200ms
- **Hover effects**: 150ms
- **Use spring animations** for buttons and interactive elements
- **Scroll animations**: Trigger at 50% visibility

### **Performance Best Practices**
1. **Code Splitting**: Lazy load routes
   ```tsx
   const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
   ```
2. **Image Optimization**: Use WebP, lazy loading, responsive images
3. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
4. **Virtual Scrolling**: For long lists (event grids)
5. **CDN**: Serve static assets from Azure Front Door

---

## 🧪 Testing Strategy

### **Unit Testing**
- Framework: Vitest
- Coverage Target: > 80%
- Test files: `*.test.tsx` or `*.spec.tsx`

### **Integration Testing**
- API testing: Supertest with Azure Functions local runtime
- Database: Use test database or in-memory SQLite

### **E2E Testing**
- Framework: Playwright
- Critical paths:
  - Sign up → Verify Email → Login
  - Search → Event Detail → Checkout → Order Confirmation
  - View Tickets → Download PDF

### **Accessibility Testing**
- Tool: axe-core, WAVE
- Standards: WCAG 2.1 AA compliance

---

## 📊 Monitoring & Analytics

### **Azure Application Insights**
```typescript
// Initialize in App.tsx
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.VITE_APPINSIGHTS_CONNECTION_STRING
  }
});

appInsights.loadAppInsights();
appInsights.trackPageView();
```

### **Key Metrics to Track**
1. **User Metrics**: Sign-ups, Active users, Retention rate
2. **Booking Metrics**: Conversion rate, Cart abandonment, Average order value
3. **Performance**: Page load time, API response time, Error rate
4. **Business Metrics**: Tickets sold, Revenue, Popular events

### **Logging Strategy**
- **Frontend**: Console errors sent to Application Insights
- **Backend**: Structured logging with Winston or Pino
- **Levels**: ERROR, WARN, INFO, DEBUG

---

## 🔄 State Management

### **Current Approach**
- **React Context**: User authentication state
- **Local Storage**: Cart persistence, user preferences
- **URL State**: Filters, search queries (via React Router)

### **Future Enhancement (if needed)**
- Consider Zustand or Redux Toolkit for complex state
- React Query for server state management and caching

---

## 🌍 Internationalization (Future)

### **Preparation for i18n**
```typescript
// Use react-i18next
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// ❌ Current
<h1>Welcome to Eventix</h1>

// ✅ Future-ready
<h1>{t('home.welcome')}</h1>
```

### **Supported Languages (Roadmap)**
- English (en-US) ✅ Current
- Indonesian (id-ID) 🚧 Planned
- Malay (ms-MY) 🚧 Planned

---

## 📦 Build & Deployment

### **Environment Variables**

**`.env.development`**
```env
VITE_API_URL=http://localhost:7071/api
VITE_APPINSIGHTS_CONNECTION_STRING=
```

**`.env.production`**
```env
VITE_API_URL=https://eventix-api.azurewebsites.net/api
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx
VITE_BLOB_STORAGE_URL=https://eventixstorage.blob.core.windows.net
```

### **Build Commands**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"**/*.{ts,tsx,json,css,md}\"",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## 🎯 Critical Implementation Notes

### **DO's**
✅ Always use design tokens from `globals.css`  
✅ Preserve glassmorphic effects and animations  
✅ Implement proper error boundaries  
✅ Use TypeScript strict mode  
✅ Follow the established component patterns  
✅ Add SEO meta tags to all pages  
✅ Implement proper loading states  
✅ Use proper semantic HTML  
✅ Add ARIA labels for accessibility  
✅ Optimize images (WebP, lazy loading)  
✅ Use Azure Key Vault for secrets  
✅ Implement rate limiting on APIs  
✅ Add proper validation (Zod schemas)  
✅ Use parameterized queries (prevent SQL injection)  

### **DON'Ts**
❌ Never hardcode colors, use design tokens  
❌ Never use `text-xl`, `font-bold` unless specifically needed  
❌ Never expose API keys in frontend code  
❌ Never trust user input without validation  
❌ Never commit `.env` files  
❌ Never use `any` type in TypeScript  
❌ Never skip error handling  
❌ Never ignore accessibility  
❌ Never break the glassmorphic design system  
❌ Never modify protected files (ImageWithFallback.tsx)  

---

## 🚨 Common Issues & Solutions

### **Issue: CORS Errors**
**Solution**: Configure Azure Functions CORS
```json
// host.json
{
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": ["https://eventix.azurestaticapps.net"],
        "supportCredentials": true
      }
    }
  }
}
```

### **Issue: Glassmorphic Effects Not Working**
**Solution**: Ensure backdrop-filter is supported
```css
/* Add fallback */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
}
```

### **Issue: Slow Image Loading**
**Solution**: Implement progressive image loading
```tsx
<ImageWithFallback
  src={event.image}
  alt={event.title}
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

---

## 🎓 Learning Resources

### **Azure Documentation**
- [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Functions TypeScript](https://docs.microsoft.com/azure/azure-functions/functions-reference-node)
- [Azure SQL Database](https://docs.microsoft.com/azure/azure-sql/)

### **Frontend Stack**
- [React Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion (Framer Motion)](https://motion.dev)
- [shadcn/ui](https://ui.shadcn.com)

---

## 📞 Support & Maintenance

### **Monitoring Checklist**
- [ ] Application Insights dashboards configured
- [ ] Error rate alerts set (> 5%)
- [ ] Performance alerts (page load > 3s)
- [ ] Database performance monitoring
- [ ] Blob storage usage tracking
- [ ] Cost alerts configured

### **Regular Maintenance**
- **Weekly**: Review error logs, check API performance
- **Monthly**: Database optimization, remove unused images
- **Quarterly**: Security audit, dependency updates

---

## 🏁 Conclusion

Eventix is a production-ready, Azure-native ticketing platform built with modern web technologies and a focus on user experience, performance, and security. This documentation serves as the definitive guide for developers and AI agents to understand, maintain, and extend the platform.

**Key Strengths**:
- ✨ Beautiful glassmorphic design system
- 🚀 Scalable Azure cloud architecture
- 🔐 Enterprise-grade security
- 📱 Responsive and accessible
- ⚡ High-performance optimizations
- 🎨 Comprehensive design token system

For questions or contributions, refer to `CONTRIBUTING.md` and `guidelines/Guidelines.md`.

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Maintained By**: Eventix Development Team

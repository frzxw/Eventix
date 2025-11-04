# Backend Development Setup Guide

## Overview

The Eventix backend consists of:

- **Azure Functions** - Serverless Node.js/TypeScript API
- **Mock Data** - Development data (replaces database)
- **API Client** - Frontend service for API communication
- **Type Definitions** - Shared TypeScript types

## Directory Structure

```
azure/functions/
├── index.ts                 # Main API router
├── function.json           # Azure Functions config
├── handlers/
│   ├── events.ts          # Event endpoints
│   ├── bookings.ts        # Booking endpoints
│   ├── tickets.ts         # Ticket endpoints
│   └── auth.ts            # Authentication endpoints
├── auth-login.ts          # Legacy login (deprecated)
└── package.json           # Dependencies

src/lib/
├── mock-data.ts           # Development data (6 events)
├── types.ts               # TypeScript interfaces
└── services/
    └── api-client.ts      # Frontend API client
```

## API Endpoints

### Events
- `GET /api/events` - List events with filters
- `GET /api/events/:id` - Get event details
- `GET /api/events/featured` - Get featured events
- `GET /api/search?q=query` - Search events

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/orders` - List orders

### Tickets
- `GET /api/tickets/:orderId` - Get tickets for order
- `POST /api/tickets/:orderId/validate` - Validate ticket (mark used)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

## Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies (includes Azure Functions CLI)
npm install

# Install Azure Functions runtime (if not already installed)
npm install -g azure-functions-core-tools@4
```

### 2. Create Local Environment File

```bash
# Root directory
cp .env.example .env.development

# Edit with your settings
# VITE_API_URL=http://localhost:7071/api
```

### 3. Start Development Server

```bash
# Terminal 1: Frontend (Vite dev server)
npm run dev
# Opens at http://localhost:5173

# Terminal 2: Backend (Azure Functions local)
cd azure/functions
func start
# API available at http://localhost:7071/api
```

### 4. Test the API

```bash
# Test event listing
curl http://localhost:7071/api/events

# Test search
curl "http://localhost:7071/api/search?q=jazz"

# Test user signup
curl -X POST http://localhost:7071/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "firstName":"Test",
    "lastName":"User"
  }'
```

## File Organization

### Handlers Breakdown

#### `handlers/events.ts`
Provides event-related endpoints:
- Lists all events with pagination
- Filters by category, city, price range
- Searches events by query
- Returns detailed event information

**Mock Data**: Uses 6 events from `src/lib/mock-data.ts`

#### `handlers/bookings.ts`
Manages booking lifecycle:
- Creates new orders with validation
- Calculates pricing (subtotal, fees, taxes, discounts)
- Applies promo codes (WELCOME10, EARLYBIRD15)
- Stores orders in memory (in-memory Map)

**Promo Codes**:
- WELCOME10: 10% discount
- EARLYBIRD15: 15% discount

#### `handlers/tickets.ts`
Handles ticket management:
- Generates tickets for confirmed orders
- Creates mock QR codes (SVG format)
- Generates barcodes
- Validates tickets for scanning

**Mock Tickets**: Generates 3 tickets per order for demo

#### `handlers/auth.ts`
User authentication:
- User signup with validation
- User login with credentials
- Mock JWT token generation
- Stores users in memory (Map)

**Demo User**: 
- Email: user@example.com
- Password: hashedpassword123

## Mock Data

### Event Categories
- `concert` - Music concerts
- `festival` - Multi-day festivals
- `theater` - Theater performances
- `comedy` - Stand-up comedy

### Mock Events

1. **Neon Waves Festival 2025** (evt-001)
   - Festival, 3-day event
   - 50,000 capacity
   - Price: 2.99M - 14.99M IDR

2. **The Midnight Orchestra** (evt-002)
   - Theater performance
   - Jakarta Symphony Orchestra
   - 2,500 capacity

3. **Stand-Up Comedy: Pandji** (evt-003)
   - Comedy show
   - 400 capacity

4. **Rock Legends: The Phoenix** (evt-004)
   - Concert
   - 18,000 capacity

5. **Jazz Under the Stars** (evt-005)
   - Jazz concert
   - 1,200 capacity

6. **Broadway Hits** (evt-006)
   - Theater production
   - 1,800 capacity

## API Client Usage

### Frontend Integration

```typescript
import { apiClient } from '@/lib/services/api-client';

// Get all events
const { data: events } = await apiClient.events.getAll({
  category: 'concert',
  page: 1,
  limit: 12,
});

// Get specific event
const { data: event } = await apiClient.events.getById('evt-001');

// Get featured events
const { data: featured } = await apiClient.events.getFeatured();

// Search events
const { data: results } = await apiClient.events.search('jazz');

// Create booking
const { data: booking, error } = await apiClient.bookings.create({
  eventId: 'evt-001',
  items: [
    { categoryId: 'cat-001-1', quantity: 2 }
  ],
  customerDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+62812345678',
    country: 'Indonesia'
  },
  promoCode: 'WELCOME10'
});

// Get booking details
const { data: order } = await apiClient.bookings.getById(booking.id);

// Get tickets
const { data: tickets } = await apiClient.tickets.getByOrderId(booking.id);

// User authentication
const { data: auth } = await apiClient.auth.login(
  'user@example.com',
  'password123'
);

const { data: newUser } = await apiClient.auth.signup({
  email: 'newuser@example.com',
  password: 'password123',
  firstName: 'Jane',
  lastName: 'Doe'
});
```

## Price Calculation

### Order Total Calculation

```
Subtotal = Σ(ticket_price × quantity)
Service Fee = Subtotal × 5%
Processing Fee = 15,000 IDR
Total Fees = Service Fee + Processing Fee
Tax = (Subtotal + Total Fees) × 10%
Discount = Subtotal × promo_code_percentage
Total = Subtotal + Total Fees + Tax - Discount
```

### Example

```
2 × General (2.99M) = 5.98M
1 × VIP (7.49M) = 7.49M
Subtotal = 13.47M

Service Fee (5%) = 673,500
Processing = 15,000
Total Fees = 688,500

Tax (10%) = 1,416,350
Discount (10%) = 1,347,000

Total = 13.47M + 688.5k + 1.416M - 1.347M = 14.227M IDR
```

## Environment Variables

### Frontend (.env.development)

```env
VITE_API_URL=http://localhost:7071/api
```

### Production (.env.production)

```env
VITE_API_URL=https://eventix-api.azurewebsites.net/api
```

## Testing

### Manual Testing

```bash
# Get all events
curl http://localhost:7071/api/events

# Get featured events
curl http://localhost:7071/api/events/featured

# Search events
curl "http://localhost:7071/api/search?q=jazz"

# Create booking
curl -X POST http://localhost:7071/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventId":"evt-001",
    "items":[{"categoryId":"cat-001-1","quantity":2}],
    "customerDetails":{
      "firstName":"John",
      "lastName":"Doe",
      "email":"john@example.com",
      "phone":"+62812345678",
      "country":"Indonesia"
    }
  }'
```

## Production Deployment

### Prerequisites

- Azure subscription
- Azure Storage Account
- Azure SQL Database (optional, for persistence)

### Deployment Steps

```bash
# 1. Build the project
npm run build

# 2. Create Azure Function App
az functionapp create \
  --resource-group eventix-rg \
  --consumption-plan-location southeastasia \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name eventix-api \
  --storage-account eventixstorage

# 3. Deploy Functions
cd azure/functions
func azure functionapp publish eventix-api

# 4. Set environment variables
az functionapp config appsettings set \
  --name eventix-api \
  --resource-group eventix-rg \
  --settings VITE_API_URL=https://eventix-api.azurewebsites.net/api
```

## Notes

### Current Implementation

- ✅ Uses mock data (no database required for dev)
- ✅ In-memory order storage (Map)
- ✅ Mock JWT tokens (not cryptographically signed)
- ✅ Simplified authentication (no bcrypt)
- ✅ Mock QR code generation (SVG)

### Production TODOs

- [ ] Connect to Azure SQL Database (Prisma ORM)
- [ ] Implement real JWT signing
- [ ] Add bcrypt password hashing
- [ ] Implement ticket QR code generation (library)
- [ ] Add payment gateway integration
- [ ] Set up Azure Service Bus for events
- [ ] Configure Application Insights
- [ ] Add proper error logging
- [ ] Implement request validation middleware

## Troubleshooting

### API Returns 404

**Solution**: Ensure Azure Functions are running and endpoint path is correct.

```bash
# Check functions status
func status

# Verify endpoint URL format
# Correct: http://localhost:7071/api/events
# Wrong: http://localhost:7071/events
```

### CORS Errors

**Solution**: Configure CORS in `function.json` or proxy through frontend dev server.

```javascript
// Frontend vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:7071'
    }
  }
})
```

### Mock Data Not Loading

**Solution**: Verify import path is correct relative to compiled output.

```typescript
// Correct (relative to dist/)
import { mockEvents } from "../../src/lib/mock-data";

// Check path exists
ls -la src/lib/mock-data.ts
```

## Resources

- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [API Documentation](./API_DOCUMENTATION.md)
- [Copilot Instructions](./.github/copilot-instructions.md)
- [Project Structure](./development/PROJECT_STRUCTURE.md)

---

**Last Updated**: November 4, 2025  
**Status**: ✅ Ready for Development

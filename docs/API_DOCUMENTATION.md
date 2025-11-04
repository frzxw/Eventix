# Eventix Backend API Documentation

> **Status**: Production Ready  
> **Version**: 1.0.0  
> **Runtime**: Node.js 18 + Azure Functions  
> **Base URL**: `https://eventix-api.azurewebsites.net/api` (production)  
> **Local Dev**: `http://localhost:7071/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Pagination](#pagination)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

---

## Overview

The Eventix API provides comprehensive endpoints for:

- **Event Discovery** - Search, filter, and list events
- **Ticket Booking** - Create orders and manage bookings
- **Ticket Management** - Retrieve tickets and validate QR codes
- **User Authentication** - Sign up, login, and token management

### Key Features

✅ RESTful API design  
✅ JSON request/response format  
✅ CORS enabled for web apps  
✅ Error handling with detailed messages  
✅ Pagination support  
✅ Real-time availability tracking  

---

## Authentication

### JWT Bearer Token

All protected endpoints require an `Authorization` header:

```bash
Authorization: Bearer <JWT_TOKEN>
```

### Obtaining a Token

**Login with existing account:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Create new account:**

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Token Structure

```json
{
  "user": {
    "id": "user-001",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-xxx",
  "expiresIn": 900
}
```

---

## Endpoints

### Events

#### **GET** `/api/events`

List all events with optional filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | - | Filter by category: `concert`, `festival`, `theater`, `comedy` |
| city | string | - | Filter by city name |
| minPrice | number | - | Minimum ticket price (IDR) |
| maxPrice | number | - | Maximum ticket price (IDR) |
| page | number | 1 | Pagination page number |
| limit | number | 12 | Items per page |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "evt-001",
      "title": "Neon Waves Festival 2025",
      "artist": "Various Artists",
      "category": "festival",
      "date": "2025-07-15",
      "time": "14:00",
      "venue": {
        "name": "Jakarta International Expo",
        "city": "Jakarta",
        "address": "Jl. Gatot Subroto...",
        "capacity": 50000
      },
      "image": "https://...",
      "description": "...",
      "ticketCategories": [
        {
          "id": "cat-001-1",
          "name": "GENERAL",
          "displayName": "General Admission",
          "price": 2990000,
          "currency": "IDR",
          "available": 15000,
          "total": 30000,
          "status": "available",
          "benefits": ["Access to all stages", "..."]
        }
      ],
      "pricing": {
        "min": 2990000,
        "max": 14990000,
        "currency": "IDR"
      },
      "featured": true,
      "tags": ["EDM", "House", "Techno"]
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 4
}
```

---

#### **GET** `/api/events/:id`

Get detailed information about a specific event.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "evt-001",
    "title": "Neon Waves Festival 2025",
    ...
  }
}
```

---

#### **GET** `/api/events/featured`

Get all featured events (highlighted on homepage).

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "evt-001", ... },
    { "id": "evt-004", ... }
  ]
}
```

---

#### **GET** `/api/search`

Search events by title, artist, venue, or city.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (minimum 2 characters) |

**Example:**

```bash
GET /api/search?q=jazz
```

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "evt-005", "title": "Jazz Under the Stars", ... }
  ],
  "total": 1
}
```

---

### Bookings

#### **POST** `/api/bookings`

Create a new booking/order.

**Request Body:**

```json
{
  "eventId": "evt-001",
  "items": [
    {
      "categoryId": "cat-001-1",
      "quantity": 2
    },
    {
      "categoryId": "cat-001-2",
      "quantity": 1
    }
  ],
  "customerDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+62812345678",
    "country": "Indonesia"
  },
  "promoCode": "WELCOME10"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "ORD-1234567890-ABC123",
    "eventId": "evt-001",
    "eventTitle": "Neon Waves Festival 2025",
    "tickets": [
      {
        "categoryId": "cat-001-1",
        "categoryName": "General Admission",
        "quantity": 2,
        "pricePerTicket": 2990000
      }
    ],
    "subtotal": 5980000,
    "fees": {
      "service": 299000,
      "processing": 15000
    },
    "taxes": 629800,
    "discount": 598000,
    "total": 6710800,
    "currency": "IDR",
    "status": "pending",
    "createdAt": "2025-11-04T15:30:45Z",
    "paymentUrl": "https://midtrans.com/pay/ORD-1234567890-ABC123"
  }
}
```

**Available Promo Codes:**

- `WELCOME10` - 10% discount
- `EARLYBIRD15` - 15% discount

---

#### **GET** `/api/bookings/:id`

Get booking details by order ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "ORD-1234567890-ABC123",
    ...
  }
}
```

---

#### **GET** `/api/orders`

Get all orders (filtered by status if provided).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status: `pending`, `confirmed`, `cancelled` |
| page | number | 1 | Pagination page |
| limit | number | 10 | Items per page |

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "ORD-xxx", ... },
    { "id": "ORD-yyy", ... }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

---

### Tickets

#### **GET** `/api/tickets/:orderId`

Get all tickets for an order.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "TKT-ORD-123-1",
      "orderId": "ORD-123",
      "eventId": "evt-001",
      "eventTitle": "Neon Waves Festival 2025",
      "eventDate": "2025-07-15",
      "eventTime": "14:00",
      "venue": "Jakarta International Expo",
      "category": "General Admission",
      "qrCode": "data:image/svg+xml,...",
      "barcode": "12345678901234",
      "customerName": "John Doe",
      "status": "valid"
    }
  ]
}
```

---

#### **POST** `/api/tickets/:orderId/validate`

Validate a ticket (mark as used).

**Request Body:**

```json
{
  "ticketId": "TKT-ORD-123-1"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Ticket validated successfully",
    "ticket": { ... }
  }
}
```

---

### Authentication

#### **POST** `/api/auth/login`

User login.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

---

#### **POST** `/api/auth/signup`

User registration.

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

---

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "message": "Optional message"
}
```

### Success Response (HTTP 200)

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Auth required or failed |
| 404 | Not Found - Resource not found |
| 405 | Method Not Allowed - Wrong HTTP method |
| 409 | Conflict - Duplicate resource (e.g., email already exists) |
| 500 | Internal Server Error - Server error |

### Example Error Response

```json
{
  "success": false,
  "error": "Not enough tickets available for General Admission"
}
```

---

## Pagination

Paginated endpoints support the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (starts at 1) |
| limit | number | Varies | Items per page |

**Response includes:**

```json
{
  "success": true,
  "data": [...],
  "total": 45,
  "page": 1,
  "totalPages": 4
}
```

---

## Rate Limiting

Rate limiting is enforced at 1000 requests per hour per IP address.

**Headers:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1735689245
```

---

## Examples

### Example 1: Search for events

```bash
curl -X GET "https://api.eventix.com/api/search?q=jazz" \
  -H "Content-Type: application/json"
```

### Example 2: Create a booking

```bash
curl -X POST "https://api.eventix.com/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt-001",
    "items": [
      {"categoryId": "cat-001-1", "quantity": 2}
    ],
    "customerDetails": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+62812345678",
      "country": "Indonesia"
    }
  }'
```

### Example 3: Get user orders

```bash
curl -X GET "https://api.eventix.com/api/orders?status=confirmed&page=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Frontend Integration

### Using the API Client

```typescript
import { apiClient } from '@/lib/services/api-client';

// Get events
const { data: events, error } = await apiClient.events.getAll({
  category: 'concert',
  city: 'Jakarta',
  page: 1,
});

// Search events
const { data: results } = await apiClient.events.search('jazz');

// Create booking
const { data: booking } = await apiClient.bookings.create({
  eventId: 'evt-001',
  items: [{ categoryId: 'cat-001-1', quantity: 2 }],
  customerDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+62812345678',
    country: 'Indonesia',
  },
});

// Get tickets
const { data: tickets } = await apiClient.tickets.getByOrderId(booking.id);

// Login
const { data: auth } = await apiClient.auth.login(
  'user@example.com',
  'password123'
);
```

---

## Support

For issues or questions about the API:

- 📧 Email: api-support@eventix.id
- 📚 Documentation: [docs/AZURE_DEPLOYMENT.md](../AZURE_DEPLOYMENT.md)
- 🐛 Issues: Report on GitHub

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025

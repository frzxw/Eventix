# Eventix - Production-Ready Online Ticketing Platform

A modern, accessible, and fully-featured online ticketing website built with React, TypeScript, Tailwind CSS, and shadcn/ui. Features a dark-first glassmorphic design system with comprehensive token-based theming.

## 🎯 Features

### Core Functionality
- **Event Discovery**: Universal search with artist, venue, city, and date filters
- **Event Listings**: Scannable cards with availability indicators and filtering
- **Event Details**: Comprehensive event information with venue details
- **Ticket Selection**: Category-based selection (CAT1/2/3, VIP, VVIP, STANDING) with stock states
- **Smart Checkout**: 3-step flow (Details → Payment → Confirmation) with validation
- **Digital Tickets**: Wallet-ready tickets with QR codes and calendar integration
- **Waitlist Support**: Join waitlists for sold-out categories
- **Promo Codes**: Discount code application with transparent pricing

### Design System
- **Dark-First Glassmorphism**: Modern frosted glass aesthetic with blur and transparency
- **Semantic Tokens**: All colors, spacing, typography, and effects use design tokens
- **Responsive**: Mobile-first design that scales to all screen sizes
- **Accessible**: WCAG-conformant contrast, keyboard navigation, ARIA patterns
- **Theme Support**: Easy to rebrand by editing token values

### Technical Excellence
- **TypeScript**: Full type safety across the application
- **Component Architecture**: Modular, reusable components with clear separation of concerns
- **Performance**: Lazy loading, optimized images, skeleton states
- **SEO**: JSON-LD structured data for events and organization
- **Error Handling**: Graceful error states and validation
- **A11y**: Semantic HTML, ARIA labels, keyboard navigation, focus management

## 📁 Project Structure

```
├── App.tsx                          # Main application with routing
├── lib/
│   ├── tokens.ts                    # Design token system (EDIT HERE TO REBRAND)
│   ├── types.ts                     # TypeScript type definitions
│   └── mock-data.ts                 # Mock event data (replace with API)
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # Global navigation header
│   │   └── Footer.tsx               # Global footer with links
│   ├── home/
│   │   ├── Hero.tsx                 # Hero section with stats
│   │   ├── SearchBar.tsx            # Universal search component
│   │   └── EventCarousel.tsx        # Scrollable event carousel
│   ├── events/
│   │   ├── EventCard.tsx            # Event preview card
│   │   ├── EventDetail.tsx          # Full event details page
│   │   └── FilterSidebar.tsx        # Filterable sidebar
│   ├── booking/
│   │   ├── CategorySelector.tsx     # Ticket category & quantity selection
│   │   └── OrderSummary.tsx         # Sticky order summary with fees
│   ├── checkout/
│   │   └── CheckoutFlow.tsx         # 3-step checkout wizard
│   └── tickets/
│       └── WalletTicket.tsx         # Digital ticket with QR code
├── styles/
│   └── globals.css                  # Tailwind config + CSS variables
└── README.md                        # This file
```

## 🎨 Design Token System

### How to Rebrand

All visual design is controlled by tokens in `/lib/tokens.ts` and CSS variables in `/styles/globals.css`. To rebrand:

1. **Edit `/lib/tokens.ts`**:
   ```typescript
   colors: {
     light: {
       primary: { DEFAULT: '#YOUR_BRAND_COLOR' },
       accent: { DEFAULT: '#YOUR_ACCENT_COLOR' },
       // ... update other colors
     }
   }
   ```

2. **Edit `/styles/globals.css`**:
   ```css
   :root {
     --primary-500: #YOUR_BRAND_COLOR;
     --accent-500: #YOUR_ACCENT_COLOR;
     /* All other design values cascade from tokens */
   }
   ```

### Token Categories

- **Colors**: `background`, `surface`, `text`, `border`, `ring`, `primary`, `accent`, `success`, `warning`, `error`
- **Typography**: `families`, `weights`, `sizes` (fluid/responsive)
- **Spacing**: Consistent scale from `0` to `32` (in rem)
- **Radius**: Border radius scale (`sm` to `full`)
- **Glass Effects**: `blur`, `saturation`, `alpha` for glassmorphism
- **Shadows**: Elevation levels with glass-specific shadows
- **Motion**: `durations` and `easings` for animations
- **Breakpoints**: Responsive design breakpoints
- **Z-Index**: Layering scale for overlays, modals, etc.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern browser with ES6+ support

### Run with Docker (Full Stack)

If you prefer running the entire stack in containers (frontend, API, workers, Postgres, Redis), follow [docs/development/DOCKER_DEV_SETUP.md](docs/development/DOCKER_DEV_SETUP.md). The guide walks through setting the required Service Bus variables, applying Prisma migrations, and starting the hot-reload dev environment via Docker Compose.

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

No environment variables needed for the frontend-only version. To connect to a real backend:

1. Replace `/lib/mock-data.ts` with API calls
2. Set up environment variables for API endpoints
3. Implement authentication (recommended: Supabase)

## 🎫 User Flows

### 1. Discovery Flow
```
Home → Search/Browse → Event Listings → Filter/Sort → Event Detail
```
- Universal search by artist, venue, city, date
- Category filters (concert, festival, theater, comedy)
- Location and price range filters
- Featured and curated carousels

### 2. Purchase Flow
```
Event Detail → Select Category → Choose Quantity → Checkout (3 steps) → Confirmation
```
**Step 1: Select Category**
- View all ticket categories (CAT1/2/3, VIP, VVIP, STANDING)
- See benefits, availability, and pricing
- Stock states: Available, Low Stock, Sold Out, Waitlist
- Quantity selector (max 10 per category)

**Step 2: Checkout - Details**
- Customer information form
- Email validation (tickets sent here)
- Phone number for notifications

**Step 3: Checkout - Payment**
- Secure payment form
- Card validation
- Transparent fee breakdown

**Step 4: Confirmation**
- Order confirmation with ID
- Ticket delivery confirmation
- Add to wallet/calendar options

### 3. Ticket Management
```
My Tickets → View Ticket → QR Code → Add to Wallet/Calendar
```
- Digital tickets with QR codes
- Apple Wallet / Google Pay integration ready
- Calendar event creation
- Share functionality

## 💰 Pricing & Fees

The platform implements transparent pricing with clear fee breakdown:

```typescript
Subtotal:        (ticket price × quantity)
Service Fee:     10% of subtotal
Processing Fee:  $2.99 flat
Taxes:          8% of subtotal
Discount:       Applied from promo codes
─────────────
Total:          Sum of above
```

All fees are shown upfront before payment. No hidden charges.

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ Semantic HTML5 elements
- ✅ ARIA labels and roles (`listbox`, `radiogroup`, `spinbutton`)
- ✅ Keyboard navigation (Tab, Enter, Space, Arrow keys)
- ✅ Focus indicators (visible ring on all interactive elements)
- ✅ Color contrast ratios meet AA standards
- ✅ Screen reader friendly (live regions for cart updates)
- ✅ Alternative text for all images
- ✅ Form validation with error messages

### Keyboard Shortcuts
- `Tab`: Navigate between interactive elements
- `Enter/Space`: Activate buttons and links
- `Esc`: Close modals and overlays
- `Arrow Keys`: Navigate through carousels

## 🔧 Technical Implementation

### State Management
- React hooks (`useState`, `useEffect`)
- Props drilling for component communication
- Local state for form inputs and UI states

### Form Validation
- HTML5 native validation
- TypeScript type checking
- Required field indicators
- Real-time validation feedback

### Performance Optimizations
- Lazy loading for images (`ImageWithFallback`)
- Responsive images with appropriate sizes
- Skeleton loading states
- Debounced search inputs
- Optimized re-renders

### SEO & Metadata
- Semantic HTML structure
- JSON-LD structured data for:
  - Organization
  - Events (can be added per event)
  - Offers
  - Breadcrumbs
- Meta tags for social sharing
- Accessible page titles

## 🧪 Testing Recommendations

### Unit Tests
```typescript
// Pricing calculation tests
test('calculates total with fees correctly', () => {
  const subtotal = 100;
  const serviceFee = subtotal * 0.1; // 10
  const processingFee = 2.99;
  const taxes = subtotal * 0.08; // 8
  const total = subtotal + serviceFee + processingFee + taxes;
  expect(total).toBe(120.99);
});

// Stock validation tests
test('prevents selecting more tickets than available', () => {
  const category = { available: 5 };
  const quantity = 10;
  const maxAllowed = Math.min(quantity, category.available);
  expect(maxAllowed).toBe(5);
});
```

### Integration Tests
- Complete purchase flow
- Filter application
- Search functionality
- Form validation
- Error handling

### Accessibility Tests
- axe-core automated testing
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)

## 🌐 Localization

To add multi-language support:

1. Install i18n library: `npm install react-i18next i18next`
2. Create translation files in `/locales/`
3. Wrap text strings with `t()` function
4. Add language selector to header

Example:
```typescript
// en.json
{
  "hero.title": "Discover Your Next Unforgettable Experience",
  "search.placeholder": "Search events, artists, venues..."
}

// Usage
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<h1>{t('hero.title')}</h1>
```

## 🔐 Security Best Practices

### Current Implementation (Frontend Only)
- No sensitive data stored in localStorage
- No API keys in frontend code
- HTTPS required for production
- Content Security Policy headers recommended

### For Production (with Backend)
- Implement authentication (JWT tokens)
- Use environment variables for API endpoints
- Sanitize all user inputs
- Implement rate limiting
- Use HTTPS only
- Add CSRF protection
- Implement payment tokenization (Stripe/PayPal)

## 📱 PWA Support (Optional Enhancement)

To make this a Progressive Web App:

1. Add `manifest.json`:
```json
{
  "name": "Eventix",
  "short_name": "Eventix",
  "description": "Online Ticketing Platform",
  "theme_color": "#8b5cf6",
  "background_color": "#0a0a0f",
  "display": "standalone",
  "icons": [...]
}
```

2. Add service worker for offline support
3. Cache static assets
4. Add "Add to Home Screen" prompt

## 🎯 Future Enhancements

### Backend Integration
- [ ] Connect to real API (REST or GraphQL)
- [ ] User authentication and accounts
- [ ] Order history and management
- [ ] Real payment processing (Stripe/PayPal)
- [ ] Email notifications
- [ ] SMS notifications

### Features
- [ ] Saved payment methods
- [ ] Favorite events
- [ ] Event recommendations
- [ ] Seating maps for reserved seating
- [ ] Group bookings
- [ ] Gift tickets
- [ ] Refund requests
- [ ] Ticket transfers
- [ ] Organizer dashboard
- [ ] Analytics and reporting

### Technical
- [ ] Server-side rendering (Next.js)
- [ ] Real-time availability updates (WebSockets)
- [ ] Advanced caching strategies
- [ ] A/B testing framework
- [ ] Error tracking (Sentry)
- [ ] Analytics (GA4, Mixpanel)

## 📄 License

This project is a demonstration application. For production use, ensure compliance with:
- Payment processing regulations (PCI DSS)
- Data privacy laws (GDPR, CCPA)
- Accessibility standards (ADA, Section 508)
- Ticketing regulations in your jurisdiction

## 🤝 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: support@eventix.example.com
- Documentation: https://docs.eventix.example.com

## 🙏 Credits

Built with:
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

---

**Made with ❤️ for event lovers everywhere**

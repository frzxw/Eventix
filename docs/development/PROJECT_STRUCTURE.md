# Project Structure Guide

Complete guide to the Eventix repository organization.

---

## 📁 Repository Root Structure

```
eventix/
├── .github/                          # GitHub configuration
│   ├── workflows/
│   │   └── azure-deploy.yml         # CI/CD pipeline
│   └── copilot-instructions.md      # AI agent guidelines
│
├── azure/                           # Azure cloud configuration
│   ├── infrastructure/
│   │   └── main.bicep              # Infrastructure as Code
│   └── functions/                   # Azure Functions (backend)
│       └── auth-login.ts           # Example function
│
├── docs/                            # 📚 Documentation
│   ├── README.md                   # Documentation index
│   ├── QUICK_START.md              # 5-minute guide
│   ├── guides/                     # Deployment guides
│   ├── architecture/               # System design docs
│   └── development/                # Development guides
│
├── public/                          # Static assets
│   └── (favicons, etc.)
│
├── src/                             # 💻 Main source code
│   ├── components/                 # React components
│   ├── pages/                      # Page components
│   ├── lib/                        # Utilities & services
│   ├── styles/                     # CSS styles
│   ├── App.tsx                     # Main App component
│   └── main.tsx                    # Entry point
│
├── .env.example                     # Environment template
├── .eslintrc                        # ESLint configuration
├── .gitignore                       # Git ignore rules
├── .npmrc                           # NPM configuration
├── .prettierrc                      # Code formatter config
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite build config
│
├── README.md                        # Project README
├── CONTRIBUTING.md                  # Contribution guide
├── QUICK_START.md                   # Quick start (root)
├── AZURE_DEPLOYMENT.md              # Deployment guide
├── AZURE_CLOUD_SETUP.md             # Setup guide
├── DEPLOYMENT_READY.md              # Status overview
├── IMPLEMENTATION_SUMMARY.md        # Implementation details
└── DOCS_INDEX.md                    # Documentation index
```

---

## 🗂️ Source Code Structure (`src/`)

### Components Organization

```
components/
├── ui/                              # shadcn/ui components (60+)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (pre-built accessible components)
│
├── common/                          # Reusable molecules
│   ├── AnimatedButton.tsx          # Button with motion effects
│   └── LoadingSpinner.tsx          # Loading state indicator
│
├── layout/                          # Layout components
│   ├── Header.tsx                  # Navigation header
│   └── Footer.tsx                  # Footer
│
├── home/                            # Homepage sections
│   ├── Hero.tsx                    # Hero section
│   ├── SearchBar.tsx               # Universal search
│   ├── PromoCarousel.tsx           # Promotional banner
│   ├── EventCarousel.tsx           # Featured events
│   └── CategoryGrid.tsx            # Category selection
│
├── events/                          # Event-specific components
│   ├── EventCard.tsx               # Single event card
│   ├── EventDetail.tsx             # Full event detail
│   └── FilterSidebar.tsx           # Glassmorphic filters
│
├── booking/                         # Booking flow
│   ├── BookingStep1.tsx            # Ticket selection
│   ├── BookingStep2.tsx            # Attendee info
│   ├── BookingStep3.tsx            # Payment
│   ├── CategorySelector.tsx        # Category selector
│   └── OrderSummary.tsx            # Order summary
│
├── checkout/                        # Checkout flow
│   └── CheckoutFlow.tsx            # Multi-step checkout
│
├── tickets/                         # Ticket display
│   └── WalletTicket.tsx            # Digital wallet ticket
│
├── profile/                         # User profile
│   └── ProfilePage.tsx             # Profile page
│
├── search/                          # Search functionality
│   └── SearchModal.tsx             # Search modal
│
├── auth/                            # Authentication pages
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── ResetPasswordPage.tsx
│
└── figma/                           # Protected components
    └── ImageWithFallback.tsx        # Image optimization
```

### Pages Organization

```
pages/
├── HomePage.tsx                     # Home page
├── DiscoverPage.tsx                 # Event discovery
├── EventDetailPage.tsx              # Event detail view
├── CheckoutPage.tsx                 # Checkout page
├── SelectTicketsPage.tsx            # Ticket selection
├── OrderConfirmationPage.tsx        # Order confirmation
├── MyTicketsPage.tsx                # My tickets/wallet
├── ProfilePage.tsx                  # User profile
│
├── auth/                            # Auth pages
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── VerifyEmailPage.tsx
│   └── ForgotPasswordPage.tsx
│
├── legal/                           # Legal pages
│   ├── TermsPage.tsx
│   ├── PrivacyPage.tsx
│   ├── FAQPage.tsx
│   └── ContactPage.tsx
│
└── NotFoundPage.tsx                 # 404 page
```

### Library Organization

```
lib/
├── services/                        # 🔌 Service Layer
│   ├── azure-api.ts                 # API client (20+ endpoints)
│   ├── azure-storage.ts             # Blob storage
│   ├── azure-monitoring.ts          # Application Insights
│   ├── logger.ts                    # Logging service
│   └── index.ts                     # Service exports
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                   # Authentication hook
│   ├── useEvents.ts                 # Events data hook
│   ├── useBooking.ts                # Booking state hook
│   ├── useScrollAnimation.ts        # Scroll trigger animations
│   └── useMediaQuery.ts             # Responsive media query
│
├── constants.ts                     # 🔧 Configuration
│   ├── API configuration
│   ├── Azure services config
│   ├── Feature flags
│   └── Business rules
│
├── types.ts                         # 📋 TypeScript types
│   ├── User types
│   ├── Event types
│   ├── Order types
│   ├── Ticket types
│   └── API response types
│
├── utils.ts                         # 🛠️ Utility functions
│   ├── formatCurrency()
│   ├── formatDate()
│   ├── validateEmail()
│   └── ...
│
├── mock-data.ts                     # Test data
├── seo.ts                           # SEO utilities
├── countries.ts                     # Country list
└── tokens.ts                        # Design tokens
```

### Styles Organization

```
styles/
└── globals.css                      # 🎨 Global styles & design tokens
    ├── CSS custom properties (design tokens)
    ├── Typography scales
    ├── Color system
    ├── Glassmorphic effects
    ├── Responsive breakpoints
    └── Animation keyframes
```

---

## 🔌 Service Layer Pattern

The service layer abstracts all external communication:

```typescript
// src/lib/services/
├── azure-api.ts
│   ├── AzureApiClient class
│   ├── 20+ API endpoints
│   ├── JWT token management
│   ├── Auto-retry logic
│   └── Circuit breaker pattern
│
├── azure-storage.ts
│   ├── File uploads
│   ├── File downloads
│   ├── SAS URL generation
│   └── CDN integration
│
├── azure-monitoring.ts
│   ├── Application Insights init
│   ├── Event tracking
│   ├── Performance monitoring
│   └── Error logging
│
├── logger.ts
│   ├── Debug logging
│   ├── Error logging
│   ├── Performance tracking
│   └── Application Insights integration
│
└── index.ts
    └── Service exports barrel file
```

---

## 🌳 Azure Configuration

```
azure/
├── infrastructure/
│   └── main.bicep                   # Infrastructure as Code
│       ├── Storage Account
│       ├── SQL Database
│       ├── Key Vault
│       ├── Redis Cache
│       ├── Service Bus
│       ├── Application Insights
│       ├── Function App
│       └── App Service Plan
│
└── functions/                       # Serverless backend
    ├── auth-login.ts               # Example: Login function
    ├── events-get.ts               # Example: Get events
    ├── orders-create.ts            # Example: Create order
    └── ... (more functions needed)
```

---

## 📚 Documentation Structure

```
docs/
├── README.md                        # Documentation index
├── QUICK_START.md                   # ⚡ 5-minute guide
│
├── guides/                          # 📖 Deployment guides
│   ├── deployment.md               # Deployment walkthrough
│   ├── configuration.md            # Configuration guide
│   ├── troubleshooting.md          # Common issues
│   └── ...
│
├── architecture/                    # 🏗️ System design
│   ├── overview.md                 # Architecture overview
│   ├── services.md                 # Azure services
│   ├── database.md                 # Database schema
│   └── ...
│
└── development/                     # 💻 Development
    ├── setup.md                    # Setup guide
    ├── code-style.md               # Code standards
    ├── components.md               # Component patterns
    └── ...
```

---

## 🔧 Configuration Files

### Root Configuration Files

| File | Purpose | Type |
|------|---------|------|
| `.env.example` | Environment template | Environment |
| `.eslintrc` | Linting rules | JSON |
| `.gitignore` | Git ignore patterns | Text |
| `.npmrc` | NPM configuration | INI |
| `.prettierrc` | Code formatting | JSON |
| `package.json` | Dependencies | JSON |
| `tsconfig.json` | TypeScript config | JSON |
| `vite.config.ts` | Vite build config | TypeScript |

### GitHub Configuration

```
.github/
├── workflows/
│   └── azure-deploy.yml             # CI/CD pipeline
│       ├── Build stage
│       ├── Security scan
│       ├── Test stage
│       ├── Infrastructure deploy
│       ├── Frontend deploy
│       └── Backend deploy
│
└── copilot-instructions.md          # AI agent guidelines
    ├── Architecture docs
    ├── Technology stack
    ├── Development guidelines
    └── Best practices
```

---

## 🚀 Deployment Structure

```
For Production:
├── Frontend → Azure Static Web Apps
│   └── dist/ (built files from npm run build)
│
├── Backend → Azure Functions
│   └── azure/functions/ (Node.js 18)
│
└── Infrastructure → Bicep template
    └── azure/infrastructure/main.bicep
```

---

## 📊 File Statistics

| Category | Files | Purpose |
|----------|-------|---------|
| Components | 60+ | UI & Feature components |
| Services | 4 | External integrations |
| Pages | 15+ | Page components |
| Hooks | 5+ | Custom React hooks |
| Utilities | 8 | Helper functions |
| Documentation | 10+ | Guides & references |
| Configuration | 8 | Build & IDE config |

---

## 🎯 Key Folders Explained

### `components/`
- **Purpose:** React component library
- **Organization:** Atomic design + feature-based
- **When to add:** New UI elements, features
- **Structure:** Grouped by feature/type

### `pages/`
- **Purpose:** Full page components
- **Organization:** Route-based
- **When to add:** New pages/routes
- **Note:** Usually compose components

### `lib/services/`
- **Purpose:** Business logic & API communication
- **Organization:** Functional domains
- **When to add:** New integrations
- **Pattern:** Singleton pattern with methods

### `docs/`
- **Purpose:** Documentation & guides
- **Organization:** By topic/audience
- **When to add:** New features, procedures
- **Format:** Markdown files

### `azure/`
- **Purpose:** Cloud infrastructure
- **Organization:** By purpose
- **When to add:** New Azure resources
- **Files:** Bicep templates + function code

---

## 🔗 Dependencies Between Folders

```
pages/
  └── uses components/
       └── uses ui/
       └── uses lib/services/
            └── uses lib/utils/
            └── uses lib/types/
       └── uses lib/hooks/
            └── uses lib/services/

azure/functions/
  └── uses lib/services/ (shared)
```

---

## 📦 Adding New Features

### Step 1: Create Component
```
src/components/features/MyFeature.tsx
```

### Step 2: Create Page (if needed)
```
src/pages/MyFeaturePage.tsx
```

### Step 3: Add Service Method (if needed)
```
// Add to src/lib/services/azure-api.ts
```

### Step 4: Add Types (if needed)
```
// Add to src/lib/types.ts
```

### Step 5: Add Utilities (if needed)
```
// Add to src/lib/utils.ts
```

### Step 6: Update Route (if needed)
```
// Update src/App.tsx
```

### Step 7: Document (if needed)
```
// Add to docs/
```

---

## ✅ Checklist for New Features

- [ ] Component created and tested
- [ ] Types defined in `lib/types.ts`
- [ ] Service methods added (if needed)
- [ ] Page created (if needed)
- [ ] Route added to `App.tsx`
- [ ] Documentation updated
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

---

## 🔒 Protected Folders

**Do NOT modify:**
- `src/components/figma/` - Synced with Figma
- `.github/copilot-instructions.md` - AI agent config
- `package.json` - Update carefully only

---

**Last Updated:** November 4, 2025  
**Version:** 1.0.0

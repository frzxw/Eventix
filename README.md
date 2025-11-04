# Eventix - Enterprise Ticketing Platform

  # Eventix - Enterprise Ticketing Platform

A production-ready, enterprise-grade online ticketing platform for concerts, festivals, theater, and comedy shows. Built with modern web technologies and fully deployed on Microsoft Azure Cloud.

A production-ready, enterprise-grade online ticketing platform for concerts, festivals, theater, and comedy shows. Built with modern web technologies and fully deployed on Microsoft Azure Cloud.

**🌍 Primary Market:** Indonesia (Jakarta)  

**💱 Currency:** Indonesian Rupiah (IDR)  **🌍 Primary Market:** Indonesia (Jakarta)  

**🏗️ Architecture:** Azure Cloud Native  **💱 Currency:** Indonesian Rupiah (IDR)  

**📱 Platform:** Web SPA + PWA  **🏗️ Architecture:** Azure Cloud Native  

**⚡ Performance:** Optimized for speed & scalability  **📱 Platform:** Web SPA + PWA  

**✅ Status:** Production Ready  **⚡ Performance:** Optimized for speed & scalability  



------



## 📚 Documentation## ✨ Key Features



All documentation has been organized in the `docs/` folder. **Start here:**### 🎫 Ticketing System

- **Multi-category tickets** (VIP, Regular, Early Bird, etc.)

### 🚀 Getting Started- **Real-time availability** tracking

- **[QUICK_START.md](./docs/QUICK_START.md)** - Deploy in 5 minutes- **Dynamic pricing** support

- **[README.md](./docs/README.md)** - Documentation index- **Bulk ticket purchasing** (up to 10 tickets per transaction)

- **Digital wallet** integration

### 📖 Development & Setup

- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Development guidelines### 🔐 Security & Authentication

- **[development/PROJECT_STRUCTURE.md](./docs/development/PROJECT_STRUCTURE.md)** - Project organization- **JWT + Refresh Token** authentication

- **[guides/GITHUB_ACTIONS_SETUP.md](./docs/guides/GITHUB_ACTIONS_SETUP.md)** - CI/CD configuration- **Azure AD B2C** optional social login

- **Password hashing** with bcrypt

### 📋 Complete Guides- **Rate limiting** & CORS protection

- **[AZURE_CLOUD_SETUP.md](./docs/AZURE_CLOUD_SETUP.md)** - Cloud setup overview- **Azure Key Vault** secrets management

- **[AZURE_DEPLOYMENT.md](./docs/AZURE_DEPLOYMENT.md)** - Step-by-step deployment

- **[SETUP_CHECKLIST.md](./docs/SETUP_CHECKLIST.md)** - 8-phase setup checklist### 🛒 Checkout Experience

- **Multi-step checkout** flow

### 📊 Reference & Changelog- **Transparent pricing** (subtotal, fees, taxes)

- **[CHANGE_LOG.md](./docs/CHANGE_LOG.md)** - Complete changelog- **Multiple payment methods** (Midtrans, Stripe, PayPal)

- **[REPOSITORY_STATUS.md](./docs/REPOSITORY_STATUS.md)** - Repository status report- **Promo code** support

- **[CLEANUP_SUMMARY.md](./docs/CLEANUP_SUMMARY.md)** - Cleanup summary- **Order confirmation** with email notification



---### 📊 Analytics & Monitoring

- **Real-time dashboards** via Application Insights

## ✨ Key Features- **Performance monitoring** (API response times, errors)

- **Business metrics** (sales, conversion rate, popular events)

### 🎫 Ticketing System- **User behavior** tracking

- **Multi-category tickets** (VIP, Regular, Early Bird, etc.)

- **Real-time availability** tracking### 📱 Responsive Design

- **Dynamic pricing** support- **Dark-first glassmorphic** design system

- **Bulk ticket purchasing** (up to 10 per transaction)- **Mobile-first** responsive layout

- **Digital wallet** integration- **Progressive Web App** (PWA) capabilities

- **Offline access** to downloaded tickets

### 🔐 Security & Authentication

- **JWT + Refresh Token** authentication---

- **Azure AD B2C** optional social login

- **Password hashing** with bcrypt## 🚀 Quick Start

- **Rate limiting** & CORS protection

- **Azure Key Vault** secrets management### Local Development



### 🛒 Checkout Experience```bash

- **Multi-step checkout** flow# Clone repository

- **Transparent pricing** (subtotal, fees, taxes)git clone https://github.com/your-org/eventix.git

- **Multiple payment methods** (Midtrans, Stripe, PayPal)cd eventix

- **Promo code** support

- **Order confirmation** with email# Install dependencies

npm install

### 📊 Analytics & Monitoring

- **Real-time dashboards** via Application Insights# Create .env.development

- **Performance monitoring** (API response times, errors)cp .env.example .env.development

- **Business metrics** (sales, conversion rate, popular events)

- **User behavior** tracking# Start development server

npm run dev

### 📱 Responsive Design```

- **Dark-first glassmorphic** design system

- **Mobile-first** responsive layoutThe app will open at `http://localhost:3000`

- **Progressive Web App** (PWA) capabilities

- **Offline access** to downloaded tickets### Azure Cloud Deployment



---```bash

# Install Azure CLI

## 🚀 Quick Startaz --version



### Development Environment# Login to Azure

az login

```bash

# Install dependencies# Deploy to Azure (one command)

npm install.\azure\deploy.sh

```

# Start development server

npm run devSee [AZURE_CLOUD_SETUP.md](./AZURE_CLOUD_SETUP.md) for detailed setup instructions.

```

---

### Production Deployment

## 📁 Project Structure

```bash

# Build for production```

npm run buildeventix/

├── src/

# Deploy to Azure (see docs/QUICK_START.md for details)│   ├── lib/

az login│   │   ├── services/              # Azure services

az group create --name eventix-rg --location southeastasia│   │   │   ├── azure-api.ts

# Follow docs/AZURE_DEPLOYMENT.md for complete steps│   │   │   ├── azure-storage.ts

```│   │   │   ├── azure-monitoring.ts

│   │   │   └── logger.ts

---│   │   ├── constants.ts           # Azure configuration

│   │   └── types.ts

## 🏗️ Architecture│   ├── components/                # React components

│   │   ├── ui/                    # Shadcn/UI components

```│   │   ├── events/                # Event components

┌─────────────────────────────────────────┐│   │   ├── booking/               # Booking flow

│     Azure Front Door (CDN + WAF)        ││   │   ├── tickets/               # Ticket display

└────────────────┬────────────────────────┘│   │   ├── home/                  # Homepage sections

                 ││   │   └── layout/                # Layout components

┌────────────────▼────────────────────────┐│   ├── pages/                     # Page components

│   Azure Static Web Apps (React SPA)     ││   ├── styles/

└────────────────┬────────────────────────┘│   │   └── globals.css            # Design tokens

                 ││   └── App.tsx

    ┌────────────┼────────────┐│

    │            │            │├── azure/

┌───▼──────┐ ┌──▼───────┐ ┌─▼────────────┐│   ├── infrastructure/

│Functions │ │  Blob    │ │ Key Vault    ││   │   └── main.bicep             # Infrastructure as Code

│(Backend) │ │ Storage  │ │ (Secrets)    ││   ├── functions/                 # Azure Functions API

└───┬──────┘ └──┬───────┘ └─┬────────────┘│   └── deploy.sh                  # Deployment script

    │           │           ││

    └────────────┼───────────┘├── .github/

                 ││   └── workflows/

    ┌────────────┼──────────────┐│       └── azure-deploy.yml       # CI/CD Pipeline

    │            │              ││

┌───▼──────┐ ┌──▼──────┐ ┌─────▼──┐├── AZURE_DEPLOYMENT.md            # Deployment guide

│   SQL    │ │  Redis  │ │Service │├── AZURE_CLOUD_SETUP.md           # Setup documentation

│Database  │ │ Cache   │ │  Bus   │├── .env.example                   # Environment template

└──────────┘ └─────────┘ └────────┘└── package.json

``````



------



## 🛠️ Technology Stack## 🏗️ Architecture



### Frontend```

- **React 18** - UI library┌─────────────────────────────────────────┐

- **TypeScript** - Type safety│     Azure Front Door (CDN + WAF)        │

- **Tailwind CSS v4** - Styling└────────────────┬────────────────────────┘

- **Motion** (Framer Motion) - Animations                 │

- **shadcn/ui** - Component library┌────────────────▼────────────────────────┐

- **React Hook Form** - Form handling│   Azure Static Web Apps (React SPA)     │

- **Zod** - Validation└────────────────┬────────────────────────┘

                 │

### Backend (Azure Functions)    ┌────────────┼────────────┐

- **Node.js 18** - Runtime    │            │            │

- **TypeScript** - Type safety┌───▼──────┐ ┌──▼───────┐ ┌─▼────────────┐

- **Prisma** - ORM│Functions │ │  Blob    │ │ Key Vault    │

│(Backend) │ │ Storage  │ │ (Secrets)    │

### Cloud Platform (Azure)└───┬──────┘ └──┬───────┘ └─┬────────────┘

- **Static Web Apps** - Frontend hosting    │           │           │

- **Azure Functions** - Serverless API    └────────────┼───────────┘

- **Azure SQL Database** - Relational DB                 │

- **Blob Storage** - Media storage    ┌────────────┼──────────────┐

- **Redis Cache** - Session/data caching    │            │              │

- **Service Bus** - Message queuing┌───▼──────┐ ┌──▼──────┐ ┌─────▼──┐

- **Key Vault** - Secrets management│   SQL    │ │  Redis  │ │Service │

- **Application Insights** - Monitoring│Database  │ │ Cache   │ │  Bus   │

- **Front Door** - CDN + WAF└──────────┘ └─────────┘ └────────┘

```

---

---

## 📁 Project Structure

## 🛠️ Technology Stack

```

eventix/### Frontend

├── src/                         # Application code- **React 18** - UI library

│   ├── components/              # React components- **TypeScript** - Type safety

│   ├── pages/                   # Page components- **Tailwind CSS v4** - Styling

│   ├── lib/services/            # Azure services- **Motion** (Framer Motion) - Animations

│   ├── styles/globals.css       # Design tokens- **shadcn/ui** - Component library

│   └── App.tsx- **React Hook Form** - Form handling

│- **Zod** - Validation

├── azure/                       # Infrastructure

│   ├── infrastructure/          # Bicep IaC### Backend (Azure Functions)

│   ├── functions/              # Azure Functions API- **Node.js 18** - Runtime

│   └── deploy.sh               # Deployment script- **TypeScript** - Type safety

│- **Express.js** - Optional routing

├── docs/                        # 📚 All documentation- **Prisma** - ORM

│   ├── README.md               # Documentation index

│   ├── QUICK_START.md### Cloud Platform (Azure)

│   ├── CONTRIBUTING.md- **Static Web Apps** - Frontend hosting

│   ├── guides/- **Azure Functions** - Serverless API

│   ├── development/- **Azure SQL Database** - Relational DB

│   └── architecture/- **Blob Storage** - Media storage

│- **Azure Cache for Redis** - Caching

├── .github/workflows/           # CI/CD Pipeline- **Service Bus** - Message queuing

├── .env.example                # Environment template- **Key Vault** - Secrets management

├── .eslintrc                   # ESLint config- **Application Insights** - Monitoring

├── .prettierrc                 # Prettier config- **Front Door** - CDN + WAF

└── package.json

```---



See [docs/development/PROJECT_STRUCTURE.md](./docs/development/PROJECT_STRUCTURE.md) for complete details.## 🔧 Configuration



---### Environment Variables



## 🚀 Commands Reference```bash

# API Configuration

```bashVITE_API_BASE_URL=http://localhost:7071/api

npm run dev              # Start dev server (localhost:5173)VITE_API_TIMEOUT_MS=30000

npm run build            # Build for production

npm run preview          # Preview production build# Azure Storage

npm run lint             # Check code qualityVITE_STORAGE_ACCOUNT_NAME=eventixstorage

npm run format           # Auto-format codeVITE_STORAGE_CDN_URL=https://eventixcdn.azureedge.net

npm test                 # Run unit tests

npm run test:e2e         # Run E2E tests# Monitoring

```VITE_APPINSIGHTS_INSTRUMENTATION_KEY=<key>

VITE_ENABLE_ANALYTICS=true

---

# Features

## 🔐 SecurityVITE_ENABLE_PAYMENT=true

VITE_ENABLE_WALLET_INTEGRATION=true

### Best Practices Implemented```

✅ HTTPS/TLS 1.2 enforced  

✅ JWT + refresh token authentication  See `.env.example` for all available options.

✅ Secrets in Azure Key Vault  

✅ CORS restricted to known domains  ---

✅ SQL injection prevention (parameterized queries)  

✅ XSS protection (Content Security Policy)  ## 📚 Documentation

✅ Rate limiting on APIs  

✅ Password hashing with bcrypt  - **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** - Step-by-step Azure deployment guide

✅ Managed Identity for services  - **[AZURE_CLOUD_SETUP.md](./AZURE_CLOUD_SETUP.md)** - Cloud setup overview

✅ Regular security audits  - **[Guidelines.md](./src/guidelines/Guidelines.md)** - Development guidelines

- **[CONTRIBUTING.md](./src/CONTRIBUTING.md)** - Contributing guidelines

---

---

## 💰 Cost Optimization

## 🔄 Development Workflow

### Estimated Monthly Costs (Production)

| Service | Config | Cost |### Start Development Server

|---------|--------|------|```bash

| Static Web Apps | Standard | $10 |npm run dev

| Azure Functions | Consumption | $20-50 |```

| SQL Database | Serverless | $15-30 |

| Blob Storage | Standard | $5-10 |### Build for Production

| Redis Cache | Basic | $15 |```bash

| **Total** | | **~$65-115** |npm run build

```

---

### Run Linting

## 🧪 Testing```bash

npm run lint

```bash```

npm test                    # Unit tests

npm run test:integration    # Integration tests### Format Code

npm run test:e2e           # E2E tests```bash

```npm run format

```

---

---

## 🆘 Getting Help

## 🚀 Deployment

### For Different Scenarios

### Automatic (GitHub Actions)

**👤 New team member?**  1. Push to `main` branch

→ Start with [docs/QUICK_START.md](./docs/QUICK_START.md) (5 minutes)2. GitHub Actions triggers CI/CD pipeline

3. Build, test, and deploy automatically

**🏗️ Understanding the codebase?**  4. View progress in Actions tab

→ Read [docs/development/PROJECT_STRUCTURE.md](./docs/development/PROJECT_STRUCTURE.md) (10 minutes)

### Manual Deployment

**💻 Want to contribute?**  

→ Follow [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) (15 minutes)**Frontend:**

```bash

**☁️ Deploying to Azure?**  npm run build

→ Use [docs/AZURE_DEPLOYMENT.md](./docs/AZURE_DEPLOYMENT.md) (1-2 hours)az staticwebapp create --name eventix-app --resource-group eventix-rg

```

**🔄 Setting up CI/CD?**  

→ Check [docs/guides/GITHUB_ACTIONS_SETUP.md](./docs/guides/GITHUB_ACTIONS_SETUP.md) (20 minutes)**Backend:**

```bash

**📋 Full checklist?**  cd azure/functions

→ Follow [docs/SETUP_CHECKLIST.md](./docs/SETUP_CHECKLIST.md) (complete setup)func azure functionapp publish eventix-api --build remote

```

---

---

## 🔧 Configuration

## 🔐 Security

### Environment Setup

### Best Practices Implemented

```bash✅ HTTPS/TLS 1.2 enforced  

# Create .env.development✅ JWT + refresh token authentication  

cp .env.example .env.development✅ Secrets in Azure Key Vault  

✅ CORS restricted to known domains  

# Edit with your Azure credentials and configuration✅ SQL injection prevention (parameterized queries)  

# Required: VITE_API_BASE_URL, database connection strings✅ XSS protection (Content Security Policy)  

```✅ Rate limiting on APIs  

✅ Password hashing with bcrypt  

---✅ Managed Identity for services  

✅ Regular security audits  

## 🤝 Contributing

---

We welcome contributions! Please:

## 📊 Performance

1. Read [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) first

2. Check [docs/development/PROJECT_STRUCTURE.md](./docs/development/PROJECT_STRUCTURE.md)### Optimization Techniques

3. Follow the coding guidelines- **Code splitting** - Lazy loading of routes

4. Submit a pull request- **Image optimization** - WebP, responsive, lazy loading

- **Caching** - Redis for sessions & results

---- **CDN** - Azure Front Door for global distribution

- **Compression** - Gzip + Brotli

## 📄 License- **Monitoring** - Application Insights telemetry



This project is proprietary software. All rights reserved.### Target Metrics

- **Page Load**: < 2 seconds

---- **API Response**: < 500ms

- **Lighthouse Score**: > 90

## 📞 Support- **Uptime**: > 99.9%



- **Documentation:** See [docs/](./docs/) folder---

- **Issues:** Open a GitHub issue

- **Email:** support@eventix.id## 🧪 Testing



---### Test Strategy

- **Unit Tests** - Component & utility functions

## 🎯 Roadmap- **Integration Tests** - API endpoints

- **E2E Tests** - User workflows (Playwright)

### Q4 2025- **Performance Tests** - Load & stress testing

✅ Core ticketing system  

✅ Azure cloud deployment  ```bash

✅ CI/CD pipeline  npm test                    # Run unit tests

⏳ Payment gateway integration  npm run test:integration    # Run integration tests

npm run test:e2e           # Run E2E tests

### Q1 2026```

📋 Mobile app (React Native)  

📋 Advanced analytics dashboard  ---

📋 Seat selection feature  

📋 Group booking discounts  ## 💰 Cost Optimization



### Q2 2026### Estimated Monthly Costs (Production)

📋 Multi-language support  | Service | Config | Cost |

📋 Cryptocurrency payments  |---------|--------|------|

📋 VR event preview  | Static Web Apps | Standard | $10 |

📋 AI-powered recommendations  | Azure Functions | Consumption | $20-50 |

| SQL Database | Serverless | $15-30 |

---| Blob Storage | Standard | $5-10 |

| Redis Cache | Basic | $15 |

**Last Updated:** November 4, 2025  | Key Vault | Standard | $0.50 |

**Status:** ✅ Production Ready  | App Insights | Standard | $10-20 |

**Version:** 1.0.0  | **Total** | | **~$75-135** |



🚀 **Ready to get started?** → [docs/QUICK_START.md](./docs/QUICK_START.md)### Cost Saving Tips

1. Use Serverless SQL tier with auto-pause
2. Leverage Azure Functions consumption pricing
3. Implement request sampling in App Insights
4. Delete unused resources regularly
5. Monitor resource utilization

---

## 🆘 Troubleshooting

### Common Issues

**Q: Build fails with "Cannot find module"**  
A: Run `npm install` to install dependencies

**Q: API returns 401 Unauthorized**  
A: Check Azure Key Vault access permissions & managed identity

**Q: Blob storage upload fails**  
A: Verify storage account connection string in Key Vault

**Q: Application Insights not showing data**  
A: Check instrumentation key in environment variables

See [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md#troubleshooting) for more help.

---

## 📞 Support & Community

- **Documentation**: See docs folder
- **Issues**: Report on GitHub Issues
- **Discussions**: Start a discussion
- **Email**: support@eventix.id

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🙋 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./src/CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
git clone https://github.com/your-org/eventix.git
cd eventix
npm install
npm run dev
```

---

## 🎯 Roadmap

### Q4 2025
- ✅ Core ticketing system
- ✅ Azure cloud deployment
- ✅ CI/CD pipeline
- ⏳ Payment gateway integration

### Q1 2026
- 📋 Mobile app (React Native)
- 📋 Advanced analytics dashboard
- 📋 Seat selection feature
- 📋 Group booking discounts

### Q2 2026
- 📋 Multi-language support
- 📋 Cryptocurrency payments
- 📋 VR event preview
- 📋 AI-powered recommendations

---

## 👨‍💻 Development Team

**Eventix** is maintained by the Eventix development team with ❤️

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Production Ready
  
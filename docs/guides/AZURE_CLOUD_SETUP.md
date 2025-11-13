# Eventix - Azure Cloud Implementation

This document describes the complete Azure cloud implementation for the Eventix ticketing platform.

## 📋 Overview

Eventix is now fully configured for cloud-based deployment on Microsoft Azure with:

- ✅ Azure Static Web Apps (Frontend hosting)
- ✅ Azure Functions (Serverless backend API)
- ✅ Azure SQL Database (Relational data)
- ✅ Azure Blob Storage (Media & QR codes)
- ✅ Azure Cache for Redis (Caching & sessions)
- ✅ Azure Service Bus (Message queuing)
- ✅ Azure Key Vault (Secrets management)
- ✅ Application Insights (Monitoring & telemetry)
- ✅ Azure Front Door (CDN & load balancing)
- ✅ CI/CD Pipeline (GitHub Actions)

## 🚀 Quick Start

### Prerequisites
```bash
# Install Azure CLI
winget install Microsoft.AzureCLI

# Or download from: https://docs.microsoft.com/cli/azure/install-azure-cli-windows

# Verify installation
az --version

# Login to Azure
az login
```

### One-Click Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/eventix.git
cd eventix

# Set environment variables
set AZURE_SUBSCRIPTION_ID=<your-subscription-id>
set AZURE_RESOURCE_GROUP=eventix-rg
set AZURE_REGION=southeastasia

# Run deployment script
.\azure\deploy.ps1
```

### Manual Step-by-Step Deployment

See [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for detailed step-by-step instructions.

## 📁 Project Structure

```
eventix/
├── src/
│   ├── lib/
│   │   ├── services/
│   │   │   ├── azure-api.ts          # Azure Functions API client
│   │   │   ├── azure-storage.ts      # Blob Storage service
│   │   │   ├── azure-monitoring.ts   # Application Insights
│   │   │   ├── logger.ts             # Logging service
│   │   │   └── index.ts              # Services export
│   │   ├── constants.ts              # Azure configuration
│   │   └── types.ts                  # TypeScript types
│   ├── components/                   # React components
│   └── pages/                        # Page components
│
├── azure/
│   ├── infrastructure/
│   │   └── main.bicep               # Infrastructure as Code
│   ├── functions/                   # Azure Functions templates
│   │   ├── auth-login.ts
│   │   ├── events-get.ts
│   │   └── ...
│   └── deploy.ps1                   # Deployment script
│
├── .github/
│   └── workflows/
│       └── azure-deploy.yml         # CI/CD Pipeline
│
├── .env.example                     # Environment template
├── AZURE_DEPLOYMENT.md              # Deployment guide
└── package.json                     # Dependencies with Azure SDKs
```
az acr login --name eventixacr
docker build -t eventixacr.azurecr.io/eventix-api:latest ./api
docker push eventixacr.azurecr.io/eventix-api:latest

Create `.env.production` based on `.env.example`:

```env
# Azure environment
VITE_ENVIRONMENT=production
VITE_AZURE_REGION=southeastasia

# API configuration
VITE_API_BASE_URL=https://eventix-api.azurewebsites.net/api

# Azure Storage
VITE_STORAGE_ACCOUNT_NAME=eventixstorage
VITE_STORAGE_CDN_URL=https://eventixcdn.azureedge.net

# Application Insights
VITE_APPINSIGHTS_INSTRUMENTATION_KEY=<from-key-vault>
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=<from-key-vault>
```

### GitHub Secrets

Add these secrets to your GitHub repository:

```
AZURE_CREDENTIALS
├── clientId
├── clientSecret
├── subscriptionId
└── tenantId

AZURE_SUBSCRIPTION_ID
AZURE_RESOURCE_GROUP
AZURE_STATIC_WEB_APPS_API_TOKEN
AZURE_FUNCTION_APP_NAME

VITE_API_BASE_URL
VITE_STORAGE_ACCOUNT_NAME
VITE_APPINSIGHTS_INSTRUMENTATION_KEY
```

Generate `AZURE_CREDENTIALS`:
```bash
az ad sp create-for-rbac \
  --name eventix-deployment \
  --role Contributor \
  --scopes /subscriptions/<subscription-id>
```

## 📚 Azure Services Integration

### Azure API Service (`azure-api.ts`)

Handles all HTTP communication with Azure Functions backend:

```typescript
import { azureApi } from '@/lib/services';

// Sign up
const result = await azureApi.signup(email, password, firstName, lastName);

// Get events
const events = await azureApi.getEvents({ category: 'concert', city: 'Jakarta' });

// Create order
const order = await azureApi.createOrder(eventId, tickets, attendeeInfo);
```

**Features:**
- JWT token authentication with refresh token rotation
- Automatic retry with exponential backoff
- Circuit breaker pattern for fault tolerance
- Request/response logging
- Error handling and normalization

### Azure Storage Service (`azure-storage.ts`)

Manages image uploads and QR code generation:

```typescript
import { azureStorage } from '@/lib/services';

// Upload event image
const url = await azureStorage.uploadEventImage(file, eventId);

// Upload QR code
const qrUrl = await azureStorage.uploadQRCode(qrFile, ticketId);

// List files
const files = await azureStorage.listBlobs('event-images', 'events/123');
```

**Features:**
- File validation (type, size)
- Automatic retry
- SAS URL generation
- Metadata management
- CDN integration

### Azure Monitoring (`azure-monitoring.ts`)

Integrated Application Insights telemetry:

```typescript
import { azureMonitoring } from '@/lib/services';

// Track custom events
azureMonitoring.trackEvent('ticket-purchased', {
  eventId: '123',
  quantity: 5
});

// Track page views
azureMonitoring.trackPageView('Event Detail', window.location.href);

// Track exceptions
azureMonitoring.trackException(error, { context: 'checkout' });

// Set user context
azureMonitoring.setUserContext(userId);
```

### Logger Service (`logger.ts`)

Centralized logging with Application Insights integration:

```typescript
import { logger } from '@/lib/services';

logger.debug('Debug message', { userId: '123' });
logger.info('User logged in', { userId: '123' });
logger.warn('Possible issue', { data: 'example' });
logger.error('Error occurred', { error: err });
```

## 🏗️ Infrastructure as Code (Bicep)

Deploy all Azure resources with:

```bash
# Validate template
az bicep build --file azure/infrastructure/main.bicep

# Deploy resources
az deployment group create \
  --resource-group eventix-rg \
  --template-file azure/infrastructure/main.bicep \
  --parameters location=southeastasia environment=prod projectName=eventix
```

**Resources Created:**
- Azure SQL Database (Serverless)
- Azure Storage Account (Blob + Containers)
- Azure Function App
- Azure Cache for Redis
- Azure Service Bus (Email & Order queues)
- Azure Key Vault
- Application Insights

## 🔐 Security Best Practices

### 1. Secrets Management
All sensitive data is stored in Azure Key Vault:
```bash
az keyvault secret set \
  --vault-name eventix-keyvault \
  --name database-connection-string \
  --value "<connection-string>"
```

### 2. Managed Identity
Function App uses System Assigned Managed Identity for Key Vault access:
```bicep
identity: {
  type: 'SystemAssigned'
}
```

### 3. HTTPS Enforcement
All resources enforce HTTPS/TLS 1.2:
```bicep
supportsHttpsTrafficOnly: true
minimumTlsVersion: '1.2'
```

### 4. CORS Configuration
Function App CORS restricted to known domains:
```json
{
  "allowedOrigins": [
    "https://eventix-app.azurestaticapps.net"
  ],
  "supportCredentials": true
}
```

## 📊 Monitoring & Analytics

### Application Insights Dashboard

Monitor in real-time:
1. Go to Azure Portal
2. Navigate to Application Insights resource
3. View:
   - Performance metrics
   - Failed requests
   - User analytics
   - Custom events (ticket sales, API calls)

### Key Metrics to Track

```typescript
// Track API performance
azureMonitoring.trackRequest(
  'GetEvents',
  `${API.BASE_URL}/events`,
  duration,
  '200',
  true
);

// Track business metrics
azureMonitoring.trackEvent('ticket-purchased', {
  eventId: '123',
  quantity: 5,
  amount: 500000
});

// Track errors
azureMonitoring.trackException(error, {
  endpoint: '/orders/create',
  method: 'POST'
});
```

### Alerts & Notifications

Configure alerts for:
- High error rate (> 5%)
- Slow API responses (> 3s)
- Database connection failures
- High CPU usage (> 80%)

```bash
az monitor metrics alert create \
  --name high-error-rate \
  --resource-group eventix-rg \
  --condition "avg requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Automated deployment on push to `main`:

1. **Build**: Compile React & TypeScript
2. **Test**: Run security scans & linting
3. **Deploy Infrastructure**: Use Bicep templates
4. **Deploy Frontend**: Azure Static Web Apps
5. **Deploy Backend**: Azure Functions
6. **Notify**: Create GitHub release

### Manual Deployment

```bash
# Build
npm run build

# Deploy frontend
az staticwebapp create \
  --name eventix-app \
  --resource-group eventix-rg \
  --source https://github.com/your-org/eventix

# Deploy backend
cd azure/functions
func azure functionapp publish eventix-api --build remote
```

## 📱 Environment Tiers

### Development (`develop` branch)
- Azure region: eastus
- SQL: Basic tier, auto-pause
- Functions: Consumption plan
- Monitoring: Full sampling

### Production (`main` branch)
- Azure region: southeastasia
- SQL: Standard tier, no auto-pause
- Functions: Premium plan (optional)
- Monitoring: 50% sampling (cost optimization)

## 💰 Cost Optimization

### Estimated Monthly Costs

| Service | Config | Cost |
|---------|--------|------|
| Static Web Apps | Standard | $10 |
| Azure Functions | Consumption | $20-50 |
| SQL Database | Serverless S0 | $15-30 |
| Blob Storage | Standard LRS | $5-10 |
| Redis Cache | Basic C0 | $15 |
| Key Vault | Standard | $0.50 |
| App Insights | Pay-as-you-go | $10-20 |
| **Total** | | **~$75-135** |

### Cost Saving Tips
1. Use Serverless SQL tier with auto-pause
2. Consumption-based pricing for Functions
3. Implement request sampling in App Insights
4. Schedule non-production resource shutdown
5. Monitor resource utilization regularly

## 🆘 Troubleshooting

### Issue: Function App returns 401 Unauthorized

**Cause:** Missing Key Vault access policy

**Solution:**
```bash
az keyvault set-policy \
  --name eventix-keyvault \
  --object-id <function-app-managed-identity-id> \
  --secret-permissions get list
```

### Issue: Blob Storage upload fails

**Cause:** Storage account connection string incorrect

**Solution:**
```bash
# Verify connection string in Key Vault
az keyvault secret show \
  --vault-name eventix-keyvault \
  --name storage-connection-string
```

### Issue: Static Web App displays 404

**Cause:** Frontend build not deployed correctly

**Solution:**
```bash
# Rebuild and redeploy
npm run build
az staticwebapp create \
  --name eventix-app \
  --resource-group eventix-rg \
  --output-location "dist"
```

## 📖 Documentation

- [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) - Detailed deployment guide
- [Azure Static Web Apps Docs](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions Docs](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure SQL Docs](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

## 🤝 Contributing

When adding new features:

1. Use `azureApi` for backend calls
2. Use `azureStorage` for file operations
3. Add logging via `logger` service
4. Track events via `azureMonitoring`
5. Update environment variables in `.env.example`
6. Test locally with Azure Functions Core Tools

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review Azure documentation
3. Check Application Insights logs
4. Open GitHub issue with logs

---

**Status:** ✅ Production Ready  
**Last Updated:** November 4, 2025  
**Maintainer:** Eventix Development Team

# Quick Start - 5 Minute Deployment

**Time Required:** ⏱️ 5 minutes  
**Difficulty:** Easy  
**Status:** ✅ Production Ready

---

## 📋 Prerequisites

```bash
# Required
- Azure CLI installed (az --version)
- Node.js 18+ (node --version)
- Git (git --version)
- Active Azure Subscription
- GitHub account

# Optional
- Docker (for local testing)
- VS Code (recommended)
```

---

## 🚀 5 Steps to Production

### Step 1: Login to Azure (1 min)

```bash
az login
```

This opens browser for authentication. Close browser when done.

### Step 2: Create Resource Group (1 min)

```bash
az group create \
  --name eventix-rg \
  --location southeastasia
```

**Output:** Should show `"provisioningState": "Succeeded"`

### Step 3: Deploy Infrastructure (2 min)

```bash
az deployment group create \
  --resource-group eventix-rg \
  --template-file azure/infrastructure/main.bicep \
  --parameters \
    environment=production \
    projectName=eventix
```

**Wait for:** Deployment shows "Microsoft.Resources/deployments - OK"

### Step 4: Build & Deploy Frontend (1 min)

```bash
npm install
npm run build
```

Then provision Azure resources (including Static Web App when enabled) and publish:

```bash
# Provision via Bicep (set AZ_DEPLOY_STATIC_WEB_APP=true in azure/scripts/00-az-variables.local.cmd)
azure\scripts\10-az-provision-core.cmd

# Deploy Azure Functions backend
cd azure\functions
func azure functionapp publish eventix-api --build remote
```

### Step 5: Test the Deployment (1 min)

```bash
# Get the Static Web App URL
az staticwebapp list --resource-group eventix-rg --query "[].defaultHostname"

# Visit: https://<your-app>.azurestaticapps.net
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Static Web App online
- [ ] Can access homepage
- [ ] Events load without errors
- [ ] No 404 errors in console
- [ ] CSS/styling appears correct
- [ ] Responsive layout works on mobile

---

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start dev server (localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview prod build locally

# Linting
npm run lint         # Check code quality
npm run format       # Auto-format code

# Testing (when available)
npm run test         # Run tests
npm test:e2e         # E2E tests
```

---

## ⚙️ Environment Configuration

Create `.env.production`:

```bash
# Copy from .env.example
cp .env.example .env.production

# Edit with your values:
VITE_API_BASE_URL=https://eventix-api.azurewebsites.net/api
VITE_ENVIRONMENT=production
```

---

## 🔑 GitHub Actions Secrets Setup

Configure secrets for automated CI/CD:

```bash
# Go to: GitHub → Settings → Secrets and variables → Actions

# Add these secrets:
AZURE_CREDENTIALS          # Output from: az ad sp create-for-rbac
AZURE_SUBSCRIPTION_ID      # Your subscription ID
AZURE_RESOURCE_GROUP       # eventix-rg
AZURE_FUNCTION_APP_NAME    # eventix-api
```

**Get Azure Credentials:**
```bash
az ad sp create-for-rbac \
  --name eventix-ci \
  --role Contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

---

## ❌ Common Issues

### Issue: "Resource group not found"
```bash
# Solution: Create it first
az group create --name eventix-rg --location southeastasia
```

### Issue: "Deployment failed"
```bash
# Check deployment status
az deployment group list --resource-group eventix-rg

# Check detailed errors
az deployment group show \
  --resource-group eventix-rg \
  --name main
```

### Issue: "Quota exceeded"
```bash
# Solution: Use different region
# Available: eastasia, southeastasia, eastus, westus, westeurope
az group create --name eventix-rg --location eastasia
```

### Issue: "Authentication failed"
```bash
# Solution: Re-login
az logout
az login
```

### Issue: "Static Web App not loading"
```bash
# Wait 5-10 minutes for DNS propagation
# Clear browser cache: Ctrl+Shift+Delete
```

---

## 📊 What Gets Created

```
✅ Storage Account (event-images, qr-codes containers)
✅ SQL Database (serverless, auto-pause)
✅ Key Vault (secrets management)
✅ Redis Cache (session storage)
✅ Service Bus (message queues)
✅ Application Insights (monitoring)
✅ Function App (backend API)
✅ Static Web App (frontend)
```

---

## 💰 Estimated Cost

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Static Web Apps | Free | $0 |
| Function App | Consumption | ~$10-20 |
| SQL Database | Serverless | ~$15-30 |
| Storage Account | Standard | ~$5-10 |
| Redis Cache | Basic | ~$15 |
| Application Insights | Pay-as-you-go | ~$5-10 |
| **Total** | | **~$50-85** |

---

## 🔗 Next Steps

### Continue Reading
- 📖 [AZURE_CLOUD_SETUP.md](./AZURE_CLOUD_SETUP.md) - Learn architecture
- 🔧 [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) - Complete guide
- 📋 [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) - Check status

### Start Development
- `npm run dev` - Start local dev server
- Edit `src/` files - Changes auto-reload
- Check `src/lib/services/` - API integration examples

### Monitor Production
- Visit Azure Portal
- Check Application Insights
- Review logs in real-time

---

## 💬 Support

**Issues?** Check troubleshooting in [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md#troubleshooting)

**Questions?** See full documentation in `docs/`

**Need help?** Open an issue on GitHub

---

**Estimated Time:** ⏱️ 5 minutes  
**Difficulty:** 🟢 Easy  
**Status:** ✅ Production Ready

🚀 **You're ready to deploy!**

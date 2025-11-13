# Azure Cloud Deployment Guide for Eventix

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Configuration](#configuration)
5. [Troubleshooting](#troubleshooting)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

Eventix is fully deployed on Azure Cloud with the following architecture:

```
┌──────────────────────────────────────────────────────────────┐
│                   Azure Front Door (CDN)                      │
│              Global load balancing & WAF                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│            Azure Static Web Apps (Frontend SPA)               │
│         React + TypeScript + Tailwind CSS                    │
│         Automatic deployment from Git                        │
└────────────────────────┬─────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────────────┐ ┌────▼──────────┐ ┌──────▼──────────┐
│ Azure Functions│ │ Azure Storage │ │ Azure Key Vault │
│ (Backend APIs) │ │ (Blob Storage)│ │  (Secrets)      │
│ Node.js 18 LTS │ │  + CDN        │ │                 │
└───┬────────────┘ └────┬──────────┘ └──────┬──────────┘
    │                    │                   │
    └────────────────────┼───────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼──────┐    ┌────▼──────┐  ┌────▼─────────┐
    │ Azure    │    │  Azure    │  │   Azure      │
    │   SQL    │    │  Cache    │  │  Service Bus │
    │ Database │    │ for Redis │  │  (Messaging) │
    └──────────┘    └───────────┘  └──────────────┘
        │
    ┌───▼──────────────────┐
    │  Application Insights│
    │  (Monitoring)        │
    └──────────────────────┘
```

---

## Prerequisites

### Local Development
- Node.js 18 LTS or higher
- npm or yarn
- Azure CLI (latest)
- Git
- VS Code (recommended)

### Azure Resources
- Active Azure Subscription
- Resource Group (create or use existing)
- Sufficient quota for:
  - Azure Static Web Apps
  - Azure Functions
  - Azure SQL Database
  - Azure Storage Account
  - Azure Cache for Redis

### Access & Permissions
- Azure Subscription Owner or Contributor role
- GitHub account (for CI/CD)
- Azure DevOps (optional, for enterprise deployments)

---

## Step-by-Step Deployment

### Phase 1: Prerequisites Setup

#### 1.1 Login to Azure
```bash
az login
az account set --subscription "<subscription-id>"
az account show  # Verify you're in the right subscription
```

#### 1.2 Create Resource Group
```bash
az group create \
  --name eventix-rg \
  --location southeastasia

# Verify
az group list --output table
```

#### 1.3 Install Azure CLI Extensions (if needed)
```bash
az extension add --name staticwebapps
az extension add --name functions
```

---

### Phase 2: Core Azure Resources

#### 2.1 Create Azure SQL Database

**Create SQL Server:**
```bash
az sql server create \
  --name eventix-sql-server \
  --resource-group eventix-rg \
  --location southeastasia \
  --admin-user sqladmin \
  --admin-password "<STRONG_PASSWORD>"

# Store this password securely in Azure Key Vault
```

**Create SQL Database:**
```bash
az sql db create \
  --resource-group eventix-rg \
  --server eventix-sql-server \
  --name eventix-db \
  --service-objective S0 \
  --compute-model Serverless \
  --auto-pause-delay 60

# S0 = Standard tier, Serverless with auto-pause saves costs
```

**Configure Firewall (allow your IP):**
```bash
az sql server firewall-rule create \
  --name AllowMyIP \
  --server eventix-sql-server \
  --resource-group eventix-rg \
  --start-ip-address "<YOUR_IP>" \
  --end-ip-address "<YOUR_IP>"

# For testing, temporarily allow all Azure services:
az sql server firewall-rule create \
  --name AllowAzureServices \
  --server eventix-sql-server \
  --resource-group eventix-rg \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### 2.2 Create Azure Storage Account

```bash
az storage account create \
  --name eventixstorage \
  --resource-group eventix-rg \
  --location southeastasia \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

# Get connection string (save it)
az storage account show-connection-string \
  --name eventixstorage \
  --resource-group eventix-rg
```

**Create Blob Containers:**
```bash
# Get storage account key
STORAGE_KEY=$(az storage account keys list \
  --account-name eventixstorage \
  --resource-group eventix-rg \
  --query '[0].value' -o tsv)

# Create containers
az storage container create \
  --name event-images \
  --account-name eventixstorage \
  --account-key $STORAGE_KEY

az storage container create \
  --name qr-codes \
  --account-name eventixstorage \
  --account-key $STORAGE_KEY
```

#### 2.3 Create Azure Cache for Redis

```bash
az redis create \
  --name eventix-cache \
  --resource-group eventix-rg \
  --location southeastasia \
  --sku Basic \
  --vm-size c0

# Get connection string
az redis show-connection-string \
  --name eventix-cache \
  --resource-group eventix-rg
```

#### 2.4 Create Azure Service Bus

```bash
az servicebus namespace create \
  --name eventix-sb \
  --resource-group eventix-rg \
  --location southeastasia \
  --sku Basic

# Create queues
az servicebus queue create \
  --namespace-name eventix-sb \
  --name email-queue \
  --resource-group eventix-rg

az servicebus queue create \
  --namespace-name eventix-sb \
  --name order-queue \
  --resource-group eventix-rg
```

#### 2.5 Create Azure Key Vault

```bash
az keyvault create \
  --name eventix-keyvault \
  --resource-group eventix-rg \
  --location southeastasia \
  --enable-soft-delete true \
  --purge-protection true

# Add secrets
az keyvault secret set \
  --vault-name eventix-keyvault \
  --name database-connection-string \
  --value "Server=tcp:eventix-sql-server.database.windows.net,1433;Initial Catalog=eventix-db;User ID=sqladmin;Password=<PASSWORD>;"

az keyvault secret set \
  --vault-name eventix-keyvault \
  --name storage-connection-string \
  --value "<STORAGE_CONNECTION_STRING>"

az keyvault secret set \
  --vault-name eventix-keyvault \
  --name redis-connection-string \
  --value "<REDIS_CONNECTION_STRING>"

az keyvault secret set \
  --vault-name eventix-keyvault \
  --name jwt-secret \
  --value "<GENERATE_STRONG_SECRET>"

#### 2.6 Create Azure Web PubSub (Realtime Queue Updates)

```bash
az webpubsub create \
  --name eventix-webpubsub \
  --resource-group eventix-rg \
  --location southeastasia \
  --sku Standard_S1

# Capture the primary connection string for Key Vault
WEBPUBSUB_CONN=$(az webpubsub key show \
  --name eventix-webpubsub \
  --resource-group eventix-rg \
  --query primaryConnectionString -o tsv)

az keyvault secret set \
  --vault-name eventix-keyvault \
  --name webpubsub-connection-string \
  --value "$WEBPUBSUB_CONN"
```
```

---

### Phase 3: Backend Deployment (Azure Functions)

#### 3.1 Create Function App

```bash
# Create storage account for function app
az storage account create \
  --name eventixfunctionstorage \
  --resource-group eventix-rg \
  --location southeastasia \
  --sku Standard_LRS

# Create Function App
az functionapp create \
  --name eventix-api \
  --resource-group eventix-rg \
  --consumption-plan-location southeastasia \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --storage-account eventixfunctionstorage

# Configure app settings
az functionapp config appsettings set \
  --name eventix-api \
  --resource-group eventix-rg \
  --settings \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://eventix-keyvault.vault.azure.net/secrets/database-connection-string/)" \
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://eventix-keyvault.vault.azure.net/secrets/jwt-secret/)" \
    STORAGE_CONNECTION_STRING="@Microsoft.KeyVault(SecretUri=https://eventix-keyvault.vault.azure.net/secrets/storage-connection-string/)" \
    REDIS_CONNECTION_STRING="@Microsoft.KeyVault(SecretUri=https://eventix-keyvault.vault.azure.net/secrets/redis-connection-string/)" \
    ENVIRONMENT="production"
```

#### 3.2 Deploy Functions from Repository

See section "CI/CD Pipeline with GitHub Actions" below.

---

### Phase 4: Frontend Deployment (Static Web Apps)

#### 4.1 Create Static Web App

> ✅ The infrastructure Bicep template now provisions the Static Web App when
> `deployStaticWebApp=true`. Update `azure/scripts/00-az-variables.local.cmd`
> with:
>
> ```bat
> set AZ_DEPLOY_STATIC_WEB_APP=true
> set AZ_STATIC_WEB_APP_LOCATION=eastasia
> set AZ_STATIC_WEB_APP=eventix-app-prod
> ```
>
> Then run `azure\scripts\10-az-provision-core.cmd` (or trigger the
> `azure-deploy.yml` GitHub Actions workflow) to create the resource. Use the
> manual `az staticwebapp create` command only if you need full portal control.

#### 4.2 Configure Static Web App

1. Ensure `staticwebapp.config.json` is deployed at the root of the repository
   (already included) so client-side routing and `/api/*` passthroughs work.
2. Add secrets to GitHub for the CI workflow:

   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `VITE_API_URL`
   - `VITE_APPINSIGHTS_CONNECTION_STRING`

3. (Optional) Update app settings via CLI:

   ```bash
   az staticwebapp appsettings set \
     --name eventix-app \
     --resource-group eventix-rg \
     --setting-names \
       VITE_API_URL="https://eventix-api.azurewebsites.net/api" \
       VITE_ENVIRONMENT="production"
   ```

---

### Phase 5: Content Delivery & Security

#### 5.1 Create Azure Front Door

```bash
az afd profile create \
  --resource-group eventix-rg \
  --profile-name eventix-front-door \
  --sku Premium_AzureFrontDoor \
  --origin-response-timeout-seconds 60

# Add origin (Static Web App)
az afd origin create \
  --resource-group eventix-rg \
  --profile-name eventix-front-door \
  --origin-name staticwebapp-origin \
  --origin-group-name default-origin-group \
  --origin-host-header eventix-app.azurestaticapps.net

# Create endpoint
az afd endpoint create \
  --resource-group eventix-rg \
  --profile-name eventix-front-door \
  --endpoint-name eventix-cdn \
  --origin-group default-origin-group
```

#### 5.2 Configure SSL/TLS Certificate

```bash
# For custom domain (if applicable)
az afd custom-domain create \
  --resource-group eventix-rg \
  --profile-name eventix-front-door \
  --custom-domain-name eventix-domain \
  --host-name eventix.example.com \
  --certificate-type ManagedCertificate
```

---

### Phase 6: Monitoring & Analytics

#### 6.1 Create Application Insights

```bash
az monitor app-insights component create \
  --app eventix-insights \
  --location southeastasia \
  --resource-group eventix-rg \
  --kind web \
  --application-type web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app eventix-insights \
  --resource-group eventix-rg \
  --query instrumentationKey -o tsv)

# Store in Key Vault
az keyvault secret set \
  --vault-name eventix-keyvault \
  --name appinsights-instrumentation-key \
  --value $INSTRUMENTATION_KEY
```

#### 6.2 Create Alerts

```bash
# High error rate alert
az monitor metrics alert create \
  --name error-rate-alert \
  --resource-group eventix-rg \
  --scopes "/subscriptions/<subscription-id>/resourceGroups/eventix-rg/providers/Microsoft.Insights/components/eventix-insights" \
  --condition "avg requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email --action-group "<action-group-id>"

# CPU usage alert for function app
az monitor metrics alert create \
  --name function-cpu-alert \
  --resource-group eventix-rg \
  --scopes "/subscriptions/<subscription-id>/resourceGroups/eventix-rg/providers/Microsoft.Web/sites/eventix-api" \
  --condition "avg PercentCPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

---

### Phase 7: Database Initialization

#### 7.1 Connect to SQL Database

```bash
# Get connection string
CONNECTION_STRING=$(az keyvault secret show \
  --vault-name eventix-keyvault \
  --name database-connection-string \
  --query value -o tsv)

# Connect using Azure Data Studio or SQL Server Management Studio
# Or use sqlcmd:
sqlcmd -S eventix-sql-server.database.windows.net -U sqladmin -P "<password>" -d eventix-db
```

#### 7.2 Run Database Migrations

Deploy migrations via Azure Functions or CI/CD pipeline.

---

## Configuration

### Environment Variables

Create `.env.production` file with Azure resource details:

```bash
# Azure Configuration
VITE_ENVIRONMENT=production
VITE_AZURE_REGION=southeastasia

# API Configuration
VITE_API_BASE_URL=https://eventix-api.azurewebsites.net/api
VITE_API_TIMEOUT_MS=30000

# Azure Storage
VITE_STORAGE_ACCOUNT_NAME=eventixstorage
VITE_STORAGE_CONTAINER_EVENTS=event-images
VITE_STORAGE_CONTAINER_QR_CODES=qr-codes
VITE_STORAGE_CDN_URL=https://eventixcdn.azureedge.net

# Application Insights
VITE_APPINSIGHTS_INSTRUMENTATION_KEY=<KEY_FROM_KEY_VAULT>
VITE_APPINSIGHTS_CONNECTION_STRING=<CONNECTION_STRING>

# Feature Flags
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_ANALYTICS=true
```

### CORS Configuration

Azure Functions must allow CORS from Static Web App domain:

```json
{
  "host": {
    "cors": {
      "allowedOrigins": [
        "https://eventix-app.azurestaticapps.net",
        "https://eventix.example.com"
      ],
      "supportCredentials": true
    }
  }
}
```

---

## CI/CD Pipeline with GitHub Actions

See `.github/workflows/azure-deploy.yml` for automated deployment configuration.

### Setup GitHub Secrets

```bash
# In GitHub repository settings, add:
AZURE_CREDENTIALS  # From `az ad sp create-for-rbac`
AZURE_SUBSCRIPTION_ID
AZURE_RESOURCE_GROUP
```

---

## Troubleshooting

### Common Issues

**Issue: 401 Unauthorized on Function App**
- Check Azure Key Vault access permissions
- Verify managed identity is assigned to Function App

**Issue: Static Web App not loading API**
- Verify CORS settings in Azure Functions
- Check API_BASE_URL in environment variables
- Ensure Function App is running (`az functionapp show`)

**Issue: Database connection failed**
- Check SQL Server firewall rules
- Verify connection string in Key Vault
- Ensure database user has proper permissions

**Issue: Blob storage upload fails**
- Verify storage account access keys
- Check container permissions
- Ensure file size under 5MB limit

### Debug Logs

```bash
# Function App logs
az functionapp log tail --name eventix-api --resource-group eventix-rg

# Static Web App logs
az staticwebapp show --name eventix-app --resource-group eventix-rg

# Application Insights queries
# Use Azure Portal > Application Insights > Logs
```

---

## Monitoring & Maintenance

### Regular Tasks

**Daily:**
- Check Application Insights for errors
- Monitor API response times

**Weekly:**
- Review resource costs
- Check backup status (SQL Database)
- Verify SSL/TLS certificate expiry

**Monthly:**
- Analyze usage metrics
- Update dependencies
- Security audit

### Scaling Configuration

```bash
# Auto-scale Function App
az functionapp plan update \
  --name eventix-plan \
  --resource-group eventix-rg \
  --sku EP1  # Elastic Premium

# Upgrade SQL Database tier
az sql db update \
  --name eventix-db \
  --server eventix-sql-server \
  --resource-group eventix-rg \
  --service-objective S1  # Standard S1
```

### Backup & Disaster Recovery

```bash
# SQL Database backup
az sql db short-term-retention-policy update \
  --resource-group eventix-rg \
  --server eventix-sql-server \
  --database eventix-db \
  --retention-days 35

# Storage account backup (Blob)
# Automatically geo-redundant with Standard_LRS
```

---

## Cost Optimization

### Recommended Configuration for Production

| Service | Configuration | Estimated Cost/Month |
|---------|---------------|----------------------|
| Static Web App | Standard | $10 |
| Azure Functions | Consumption | $20-50 |
| Azure SQL | Serverless S0 | $15-30 |
| Storage Account | Standard LRS | $5-10 |
| Redis Cache | Basic C0 | $15 |
| Key Vault | Standard | $0.50 |
| Application Insights | Pay-as-you-go | $10-20 |
| **Total** | | **~$75-135** |

### Cost Saving Tips
1. Use Serverless tier for SQL Database with auto-pause
2. Set consumption plan for Functions
3. Use Storage blobs instead of VMs
4. Implement request sampling in Application Insights
5. Delete unused resources regularly

---

## Support & Documentation

- [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Functions](https://docs.microsoft.com/azure/azure-functions/)
- [Azure SQL Database](https://docs.microsoft.com/azure/azure-sql/)
- [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/)
- [Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)

---

**Last Updated:** November 4, 2025  
**Maintained By:** Eventix Development Team

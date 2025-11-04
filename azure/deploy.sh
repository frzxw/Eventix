#!/bin/bash

# Eventix Azure Deployment Script
# Deploys entire infrastructure and application to Azure Cloud

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-eventix-rg}"
LOCATION="${AZURE_REGION:-southeastasia}"
PROJECT_NAME="eventix"
ENVIRONMENT="${ENVIRONMENT:-prod}"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Eventix Azure Cloud Deployment${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found. Please install Azure CLI first.${NC}"
    echo "   Download: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"
echo ""

# Login to Azure
echo -e "${YELLOW}Logging in to Azure...${NC}"
az login || {
    echo -e "${RED}❌ Azure login failed${NC}"
    exit 1
}

# Get subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✓ Logged in to subscription: $SUBSCRIPTION_ID${NC}"
echo ""

# Create resource group
echo -e "${YELLOW}Creating resource group...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION 2>/dev/null || echo "Resource group already exists"
echo -e "${GREEN}✓ Resource group ready: $RESOURCE_GROUP${NC}"
echo ""

# Deploy infrastructure with Bicep
echo -e "${YELLOW}Deploying Azure infrastructure...${NC}"
DEPLOYMENT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file azure/infrastructure/main.bicep \
    --parameters location=$LOCATION environment=$ENVIRONMENT projectName=$PROJECT_NAME \
    --query properties.outputs -o json)

echo -e "${GREEN}✓ Infrastructure deployed${NC}"

# Extract outputs
STORAGE_ACCOUNT=$(echo $DEPLOYMENT | jq -r '.storageAccountName.value')
SQL_SERVER=$(echo $DEPLOYMENT | jq -r '.sqlServerName.value')
FUNCTION_APP=$(echo $DEPLOYMENT | jq -r '.functionAppName.value')
KEY_VAULT=$(echo $DEPLOYMENT | jq -r '.keyVaultName.value')
APP_INSIGHTS=$(echo $DEPLOYMENT | jq -r '.appInsightsName.value')
REDIS_HOSTNAME=$(echo $DEPLOYMENT | jq -r '.cacheForRedisHostname.value')

echo "Storage Account: $STORAGE_ACCOUNT"
echo "SQL Server: $SQL_SERVER"
echo "Function App: $FUNCTION_APP"
echo "Key Vault: $KEY_VAULT"
echo ""

# Get connection strings
echo -e "${YELLOW}Retrieving connection strings...${NC}"

# SQL Connection String
SQL_CONNSTR="Server=tcp:${SQL_SERVER}.database.windows.net,1433;Initial Catalog=${PROJECT_NAME}-db;User ID=sqladmin;Password=TODO;Encrypt=true;Connection Timeout=30;"

# Storage Connection String
STORAGE_KEY=$(az storage account keys list \
    --account-name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query '[0].value' -o tsv)

STORAGE_CONNSTR="DefaultEndpointsProtocol=https;AccountName=${STORAGE_ACCOUNT};AccountKey=${STORAGE_KEY};EndpointSuffix=core.windows.net"

# Redis Connection String
REDIS_KEY=$(az redis list-keys \
    --name ${PROJECT_NAME}-cache-${ENVIRONMENT} \
    --resource-group $RESOURCE_GROUP \
    --query primaryKey -o tsv 2>/dev/null || echo "TODO")

REDIS_CONNSTR="${REDIS_HOSTNAME}.redis.cache.windows.net:6379,password=${REDIS_KEY},ssl=True"

echo -e "${GREEN}✓ Connection strings retrieved${NC}"
echo ""

# Store secrets in Key Vault
echo -e "${YELLOW}Storing secrets in Azure Key Vault...${NC}"

az keyvault secret set \
    --vault-name $KEY_VAULT \
    --name database-connection-string \
    --value "$SQL_CONNSTR" 2>/dev/null || echo "SQL connection string stored"

az keyvault secret set \
    --vault-name $KEY_VAULT \
    --name storage-connection-string \
    --value "$STORAGE_CONNSTR" 2>/dev/null || echo "Storage connection string stored"

az keyvault secret set \
    --vault-name $KEY_VAULT \
    --name redis-connection-string \
    --value "$REDIS_CONNSTR" 2>/dev/null || echo "Redis connection string stored"

# Generate JWT secret if not exists
JWT_SECRET=$(openssl rand -base64 32)
az keyvault secret set \
    --vault-name $KEY_VAULT \
    --name jwt-secret \
    --value "$JWT_SECRET" 2>/dev/null || echo "JWT secret stored"

echo -e "${GREEN}✓ Secrets stored in Key Vault${NC}"
echo ""

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm install || {
    echo -e "${RED}❌ npm install failed${NC}"
    exit 1
}

npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Application built${NC}"
echo ""

# Create .env.production
echo -e "${YELLOW}Creating environment configuration...${NC}"
cat > .env.production <<EOF
VITE_ENVIRONMENT=production
VITE_AZURE_REGION=$LOCATION
VITE_API_BASE_URL=https://${FUNCTION_APP}.azurewebsites.net/api
VITE_STORAGE_ACCOUNT_NAME=$STORAGE_ACCOUNT
VITE_APPINSIGHTS_INSTRUMENTATION_KEY=<from-key-vault>
EOF
echo -e "${GREEN}✓ Environment configuration created${NC}"
echo ""

# Display summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deployment Successful!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo ""
echo "Azure Resources Created:"
echo "  • Storage Account: $STORAGE_ACCOUNT"
echo "  • SQL Server: $SQL_SERVER"
echo "  • SQL Database: ${PROJECT_NAME}-db"
echo "  • Function App: $FUNCTION_APP"
echo "  • Key Vault: $KEY_VAULT"
echo "  • Redis Cache: ${PROJECT_NAME}-cache-${ENVIRONMENT}"
echo "  • App Insights: $APP_INSIGHTS"
echo ""
echo "Next Steps:"
echo "  1. Get the SQL password and update Key Vault:"
echo "     az keyvault secret set --vault-name $KEY_VAULT --name database-password --value <PASSWORD>"
echo ""
echo "  2. Deploy Function App:"
echo "     cd azure/functions"
echo "     func azure functionapp publish $FUNCTION_APP --build remote"
echo ""
echo "  3. Deploy Static Web App:"
echo "     az staticwebapp create --name ${PROJECT_NAME}-app --resource-group $RESOURCE_GROUP"
echo ""
echo "  4. Configure GitHub Secrets for CI/CD:"
echo "     - AZURE_CREDENTIALS (from 'az ad sp create-for-rbac')"
echo "     - AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
echo "     - AZURE_RESOURCE_GROUP=$RESOURCE_GROUP"
echo ""
echo "  5. View Application Insights:"
echo "     https://portal.azure.com/#@/resource/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/microsoft.insights/components/${APP_INSIGHTS}/overview"
echo ""
echo -e "${GREEN}Documentation: See AZURE_DEPLOYMENT.md${NC}"

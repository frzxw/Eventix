# GitHub Actions Secrets Setup

Complete guide to configure GitHub Actions for automated CI/CD deployment.

---

## 📋 Prerequisites

Before setting up secrets, you need:

1. **Azure Subscription** with:
   - Resource group created
   - Active subscription
   - Contributor access

2. **GitHub Repository** with:
   - Admin access
   - Branch protection (optional)

3. **Installed Tools**:
   - Azure CLI (`az` command)
   - GitHub CLI (`gh` command) - optional

---

## 🔑 Generate Azure Credentials

### Step 1: Create Service Principal

```bash
# Login to Azure
az login

# Get your subscription ID
az account list --query "[].id" -o table

# Create service principal for CI/CD
az ad sp create-for-rbac \
  --name eventix-ci \
  --role Contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID

# Output example:
# {
#   "appId": "xxxxx",
#   "displayName": "eventix-ci",
#   "password": "xxxxx",
#   "tenant": "xxxxx"
# }
```

### Step 2: Get Your Subscription Info

```bash
# Subscription ID
az account show --query "id" -o tsv

# Tenant ID
az account show --query "tenantId" -o tsv
```

---

## 🔐 Configure GitHub Secrets

### Go to Repository Settings

1. **GitHub** → Your Repository
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**

### Add Secrets

Add each secret below (copy-paste from Azure output):

#### 1. `AZURE_CREDENTIALS`
```json
{
  "clientId": "appId from az ad sp create-for-rbac",
  "clientSecret": "password from az ad sp create-for-rbac",
  "subscriptionId": "YOUR_SUBSCRIPTION_ID",
  "tenantId": "YOUR_TENANT_ID"
}
```

**How to get it:**
```bash
az ad sp create-for-rbac \
  --name eventix-ci \
  --role Contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

#### 2. `AZURE_SUBSCRIPTION_ID`
```
Your Azure subscription ID (GUID format)
```

**Get it:**
```bash
az account show --query "id" -o tsv
```

#### 3. `AZURE_RESOURCE_GROUP`
```
eventix-rg
```

*(The resource group name you created)*

#### 4. `AZURE_FUNCTION_APP_NAME`
```
eventix-api
```

*(Name of your Azure Functions app)*

#### 5. `VITE_API_BASE_URL`
```
https://eventix-api.azurewebsites.net/api
```

*(Your Azure Functions base URL)*

#### 6. `VITE_STORAGE_ACCOUNT_NAME`
```
eventixstorage
```

*(Your storage account name)*

#### 7. `VITE_APPINSIGHTS_INSTRUMENTATION_KEY`
```
Your-Instrumentation-Key-UUID
```

**Get it:**
```bash
az monitor app-insights component show \
  --app eventix-insights \
  --resource-group eventix-rg \
  --query "instrumentationKey" -o tsv
```

#### 8. `AZURE_STATIC_WEB_APPS_API_TOKEN`
```
Your-Static-Web-Apps-Token
```

**Get it from:**
1. Azure Portal → Static Web Apps → eventix-app
2. **Manage deployment token**
3. Copy the token

---

## 🚀 Test Secrets

### Method 1: Using GitHub CLI

```bash
# If you have GitHub CLI installed
gh secret list
```

### Method 2: Test Workflow

```bash
# Push to trigger workflow
git push origin main

# Watch the workflow
gh run watch

# View logs
gh run view <run-id> --log
```

### Method 3: Manual Test

1. Go to **Actions** tab
2. Select **Deploy to Azure** workflow
3. Click **Run workflow**
4. Select branch and click **Run**

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] All 8 secrets added
- [ ] No typos in secret names
- [ ] Secret values are correct (no extra spaces)
- [ ] GitHub Actions have permission (Settings → Actions → General → Permissions → Allow all actions)
- [ ] Workflow file exists (`.github/workflows/azure-deploy.yml`)
- [ ] Branch protection allows CI/CD (if enabled)

---

## 🔄 Workflow Trigger

The CI/CD pipeline runs automatically on:

1. **Push to `main` branch**
2. **Push to `develop` branch**
3. **Pull requests to `main`**

Or manually via:
- **Actions** tab → **Deploy to Azure** → **Run workflow**

---

## 📊 Workflow Stages

The pipeline runs these stages:

```
1. Build
   ├── Setup Node.js
   ├── Install dependencies
   ├── Lint code
   ├── Build project
   └── Upload artifacts

2. Security Scan (Optional)
   ├── Check CVEs
   └── Check secrets

3. Deploy Infrastructure
   ├── Deploy Bicep template
   └── Create Azure resources

4. Deploy Frontend
   ├── Deploy to Static Web Apps
   └── Verify deployment

5. Deploy Backend
   ├── Deploy Azure Functions
   └── Verify deployment

6. Notify
   └── Send success message
```

---

## 🛠️ Troubleshooting

### Issue: "Invalid credentials"

```
❌ error: run_cleanup(): WARNING: cleanup failed, attempting cleanup of main process
```

**Solution:**
1. Verify `AZURE_CREDENTIALS` is valid JSON
2. Re-create service principal:
   ```bash
   az ad sp delete --id <appId>
   az ad sp create-for-rbac --name eventix-ci --role Contributor
   ```

### Issue: "Secret not found"

```
❌ The secret 'AZURE_CREDENTIALS' could not be found or is not accessible
```

**Solution:**
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is in correct repo/environment
3. Re-add the secret

### Issue: "Subscription not found"

```
❌ The subscription 'XXX' could not be found
```

**Solution:**
1. Verify `AZURE_SUBSCRIPTION_ID` is correct
2. Check you're logged into correct Azure account
3. Verify subscription is active

### Issue: "Insufficient permissions"

```
❌ The user or application does not have permission to perform action
```

**Solution:**
1. Service principal needs Contributor role:
   ```bash
   az role assignment create \
     --assignee <appId> \
     --role Contributor \
     --scope /subscriptions/YOUR_SUBSCRIPTION_ID
   ```

### Issue: "Static Web Apps token invalid"

```
❌ Static Web Apps API token is invalid or expired
```

**Solution:**
1. Get new token from Azure Portal
2. Update `AZURE_STATIC_WEB_APPS_API_TOKEN` secret
3. Re-run workflow

---

## 🔐 Security Best Practices

1. **Rotate Secrets Regularly**
   ```bash
   # Every 3-6 months, recreate service principal
   az ad sp delete --id <appId>
   az ad sp create-for-rbac --name eventix-ci
   ```

2. **Limit Scope**
   - Use resource group scope, not subscription
   - Only grant Contributor when needed

3. **Monitor Access**
   ```bash
   # Check service principal activity
   az monitor activity-log list \
     --resource-group eventix-rg \
     --caller <appId>
   ```

4. **Never Commit Secrets**
   - Keep secrets in GitHub only
   - Don't include in `.env` files
   - Use `.gitignore` to prevent leaks

---

## 📚 Environment Variables Reference

**Frontend Variables** (sent to browser):
```
VITE_ENVIRONMENT=production
VITE_API_BASE_URL
VITE_STORAGE_ACCOUNT_NAME
VITE_APPINSIGHTS_INSTRUMENTATION_KEY
```

**GitHub Secrets** (CI/CD only):
```
AZURE_CREDENTIALS
AZURE_SUBSCRIPTION_ID
AZURE_RESOURCE_GROUP
AZURE_FUNCTION_APP_NAME
AZURE_STATIC_WEB_APPS_API_TOKEN
```

---

## 🎯 Next Steps

After secrets are configured:

1. **Push code to trigger pipeline**
   ```bash
   git push origin main
   ```

2. **Monitor deployment**
   - Go to **Actions** tab
   - Watch the workflow run
   - Check for any failures

3. **Verify deployment**
   - Visit Static Web App URL
   - Check Azure Portal resources
   - Review Application Insights logs

---

## 📞 Support

**Issues?** Check:
1. [Troubleshooting](#troubleshooting) section
2. GitHub Actions logs (Actions → Run → View logs)
3. Azure Portal for resource status

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Production Ready

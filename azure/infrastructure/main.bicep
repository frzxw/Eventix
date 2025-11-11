param location string = 'southeastasia'
param environment string = 'prod'
param projectName string = 'eventix'
param apiContainerImage string = 'ghcr.io/your-org/eventix-api:latest'
param finalizerContainerImage string = 'ghcr.io/your-org/eventix-finalizer:latest'
param holdCleanerContainerImage string = 'ghcr.io/your-org/eventix-hold-cleaner:latest'
param holdCleanerCronSchedule string = '0 */5 * * * *'
param redisKeyPrefix string = 'eventix:'
param holdTtlSeconds int = 600
param holdExpirationScanLimit int = 100
param idempotencyTtlSeconds int = 900
param rateLimitMax int = 300
param rateLimitWindow string = 'PT1M'
@secure()
param postgresAdminUser string = 'eventix_admin'
@secure()
param postgresAdminPassword string

// Generate unique suffix for global resources
var uniqueSuffix = substring(uniqueString(resourceGroup().id), 0, 6)

// Resource naming
var storageAccountName = '${projectName}storage${uniqueSuffix}'
var postgresServerName = '${projectName}-pg-${environment}'
var postgresDatabaseName = '${projectName}-db'
var functionAppName = '${projectName}-api-${environment}'
var keyVaultName = '${projectName}-kv-${environment}'
var cacheForRedisName = '${projectName}-cache-${environment}'
var serviceBusName = '${projectName}-sb-${environment}'
var appInsightsName = '${projectName}-insights-${environment}'
var logAnalyticsWorkspaceName = '${projectName}-law-${environment}'
var containerAppsEnvName = '${projectName}-cae-${environment}'
var containerRegistryName = '${projectName}acr${uniqueSuffix}'
var containerRegistryLoginServer = '${containerRegistryName}.azurecr.io'
var apiContainerAppName = '${projectName}-api-ca-${environment}'
var finalizerContainerAppName = '${projectName}-finalizer-${environment}'
var holdCleanerJobName = '${projectName}-hold-cleaner-${environment}'

// ==================== Storage Account ====================
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

// Create blob containers
resource eventImagesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/event-images'
  properties: {
    publicAccess: 'None'
  }
}

resource qrCodesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/qr-codes'
  properties: {
    publicAccess: 'None'
  }
}

// ==================== PostgreSQL Flexible Server ====================
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
    capacity: 1
  }
  properties: {
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    version: '15'
    network: {
      publicNetworkAccess: 'Enabled'
    }
    storage: {
      storageSizeGB: 128
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  name: '${postgresServer.name}/${postgresDatabaseName}'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.UTF8'
  }
}

resource postgresFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  name: '${postgresServer.name}/AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ==================== Key Vault ====================
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
  }
}

// ==================== Azure Cache for Redis ====================
resource cacheForRedis 'Microsoft.Cache/redis@2023-08-01' = {
  name: cacheForRedisName
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// ==================== Service Bus ====================
resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: serviceBusName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 1
  }
  properties: {
    premiumMessagingPartitions: 0
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// Email Queue
resource emailQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'email-queue'
  properties: {
    lockDuration: 'PT30S'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: false
    requiresSession: false
    defaultMessageTimeToLive: 'P14D'
    deadLetteringOnMessageExpiration: true
    duplicateDetectionHistoryTimeWindow: 'PT10M'
    maxDeliveryCount: 10
    enableBatchedOperations: true
  }
}

// Order Queue
resource orderQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'order-queue'
  properties: {
    lockDuration: 'PT30S'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: false
    requiresSession: false
    defaultMessageTimeToLive: 'P14D'
    deadLetteringOnMessageExpiration: true
    duplicateDetectionHistoryTimeWindow: 'PT10M'
    maxDeliveryCount: 10
    enableBatchedOperations: true
  }
}

resource serviceBusRootAuth 'Microsoft.ServiceBus/namespaces/authorizationRules@2022-10-01-preview' = {
  name: '${serviceBusNamespace.name}/RootManageSharedAccessKey'
  properties: {
    rights: [
      'Listen'
      'Send'
      'Manage'
    ]
  }
}

resource serviceBusConnectionSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: '${keyVault.name}/SERVICE_BUS_CONNECTION_STRING'
  properties: {
    value: listKeys(serviceBusRootAuth.id, '2022-10-01-preview').primaryConnectionString
  }
}

resource redisPrimaryKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: '${keyVault.name}/REDIS_PRIMARY_KEY'
  properties: {
    value: cacheForRedis.listKeys().primaryKey
  }
}

resource postgresConnectionSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: '${keyVault.name}/POSTGRES_CONNECTION_STRING'
  properties: {
    value: format('postgresql://{0}:{1}@{2}:5432/{3}?sslmode=require', postgresAdminUser, uriComponent(postgresAdminPassword), postgresServer.properties.fullyQualifiedDomainName, postgresDatabaseName)
  }
}

// ==================== Container Registry ====================
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// ==================== Log Analytics Workspace ====================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    retentionInDays: 30
    features: {
      searchVersion: 1
    }
  }
  sku: {
    name: 'PerGB2018'
  }
}

// ==================== Container Apps Environment ====================
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: containerAppsEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ==================== Container App - API ====================
resource apiContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: apiContainerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'Auto'
      }
      registries: [
        {
          server: containerRegistryLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'postgres-connection-string'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=POSTGRES_CONNECTION_STRING)', keyVault.name)
        }
        {
          name: 'service-bus-connection'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=SERVICE_BUS_CONNECTION_STRING)', keyVault.name)
        }
        {
          name: 'redis-password'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=REDIS_PRIMARY_KEY)', keyVault.name)
        }
        {
          name: 'application-insights-connection'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: apiContainerImage
          env: [
            {
              name: 'NODE_ENV'
              value: environment == 'prod' ? 'production' : environment
            }
            {
              name: 'API_PORT'
              value: '8080'
            }
            {
              name: 'API_HOST'
              value: '0.0.0.0'
            }
            {
              name: 'POSTGRES_CONNECTION_STRING'
              secretRef: 'postgres-connection-string'
            }
            {
              name: 'SERVICE_BUS_CONNECTION_STRING'
              secretRef: 'service-bus-connection'
            }
            {
              name: 'SERVICE_BUS_FINALIZATION_QUEUE'
              value: orderQueue.name
            }
            {
              name: 'APPLICATION_INSIGHTS_CONNECTION_STRING'
              secretRef: 'application-insights-connection'
            }
            {
              name: 'REDIS_HOST'
              value: cacheForRedis.properties.hostName
            }
            {
              name: 'REDIS_PORT'
              value: '6380'
            }
            {
              name: 'REDIS_PASSWORD'
              secretRef: 'redis-password'
            }
            {
              name: 'REDIS_TLS_ENABLED'
              value: 'true'
            }
            {
              name: 'REDIS_KEY_PREFIX'
              value: redisKeyPrefix
            }
            {
              name: 'HOLD_TTL_SECONDS'
              value: string(holdTtlSeconds)
            }
            {
              name: 'HOLD_EXPIRATION_SCAN_LIMIT'
              value: string(holdExpirationScanLimit)
            }
            {
              name: 'IDEMPOTENCY_TTL_SECONDS'
              value: string(idempotencyTtlSeconds)
            }
            {
              name: 'RATE_LIMIT_MAX'
              value: string(rateLimitMax)
            }
            {
              name: 'RATE_LIMIT_WINDOW'
              value: rateLimitWindow
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-concurrency'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// ==================== Container App - Finalizer Worker ====================
resource finalizerContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: finalizerContainerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      registries: [
        {
          server: containerRegistryLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'postgres-connection-string'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=POSTGRES_CONNECTION_STRING)', keyVault.name)
        }
        {
          name: 'service-bus-connection'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=SERVICE_BUS_CONNECTION_STRING)', keyVault.name)
        }
        {
          name: 'redis-password'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=REDIS_PRIMARY_KEY)', keyVault.name)
        }
        {
          name: 'application-insights-connection'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'finalizer'
          image: finalizerContainerImage
          env: [
            {
              name: 'NODE_ENV'
              value: environment == 'prod' ? 'production' : environment
            }
            {
              name: 'POSTGRES_CONNECTION_STRING'
              secretRef: 'postgres-connection-string'
            }
            {
              name: 'SERVICE_BUS_CONNECTION_STRING'
              secretRef: 'service-bus-connection'
            }
            {
              name: 'SERVICE_BUS_FINALIZATION_QUEUE'
              value: orderQueue.name
            }
            {
              name: 'APPLICATION_INSIGHTS_CONNECTION_STRING'
              secretRef: 'application-insights-connection'
            }
            {
              name: 'REDIS_HOST'
              value: cacheForRedis.properties.hostName
            }
            {
              name: 'REDIS_PORT'
              value: '6380'
            }
            {
              name: 'REDIS_PASSWORD'
              secretRef: 'redis-password'
            }
            {
              name: 'REDIS_TLS_ENABLED'
              value: 'true'
            }
            {
              name: 'REDIS_KEY_PREFIX'
              value: redisKeyPrefix
            }
            {
              name: 'WORKER_MAX_CONCURRENCY'
              value: '5'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 10
        rules: [
          {
            name: 'servicebus-orders'
            custom: {
              type: 'azure-servicebus'
              metadata: {
                queueName: orderQueue.name
                messageCount: '5'
                namespace: serviceBusNamespace.name
              }
              authentication: [
                {
                  secretRef: 'service-bus-connection'
                  triggerParameter: 'connection'
                }
              ]
            }
          }
        ]
      }
    }
  }
}

// ==================== Container Apps Job - Hold Cleaner ====================
resource holdCleanerJob 'Microsoft.App/jobs@2023-05-01' = {
  name: holdCleanerJobName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerAppsEnv.id
    configuration: {
      registries: [
        {
          server: containerRegistryLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'redis-password'
          value: format('@Microsoft.KeyVault(VaultName={0};SecretName=REDIS_PRIMARY_KEY)', keyVault.name)
        }
        {
          name: 'application-insights-connection'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'hold-cleaner'
          image: holdCleanerContainerImage
          env: [
            {
              name: 'NODE_ENV'
              value: environment == 'prod' ? 'production' : environment
            }
            {
              name: 'REDIS_HOST'
              value: cacheForRedis.properties.hostName
            }
            {
              name: 'REDIS_PORT'
              value: '6380'
            }
            {
              name: 'REDIS_PASSWORD'
              secretRef: 'redis-password'
            }
            {
              name: 'REDIS_TLS_ENABLED'
              value: 'true'
            }
            {
              name: 'REDIS_KEY_PREFIX'
              value: redisKeyPrefix
            }
            {
              name: 'HOLD_EXPIRATION_SCAN_LIMIT'
              value: string(holdExpirationScanLimit)
            }
            {
              name: 'HOLD_RELEASE_RETAIN_SECONDS'
              value: string(holdTtlSeconds)
            }
            {
              name: 'APPLICATION_INSIGHTS_CONNECTION_STRING'
              secretRef: 'application-insights-connection'
            }
          ]
        }
      ]
      scale: {
        maxExecutions: 1
      }
    }
    schedule: {
      triggerType: 'Schedule'
      cronExpression: holdCleanerCronSchedule
      parallelism: 1
    }
  }
}

// ==================== Key Vault Access Policies for Managed Identities ====================
resource keyVaultAccessPolicies 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = {
  name: '${keyVault.name}/add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: apiContainerApp.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
      {
        tenantId: subscription().tenantId
        objectId: finalizerContainerApp.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
      {
        tenantId: subscription().tenantId
        objectId: holdCleanerJob.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
  dependsOn: [
    apiContainerApp
    finalizerContainerApp
    holdCleanerJob
  ]
}

// ==================== Application Insights ====================
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ==================== Storage Account for Function App ====================
resource functionStorageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${projectName}funcstore${uniqueSuffix}'
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

// ==================== App Service Plan for Functions ====================
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${projectName}-plan-${environment}'
  location: location
  kind: 'functionapp'
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: false
  }
}

// ==================== Function App ====================
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      http20Enabled: true
      minTlsVersion: '1.2'
      detailedErrorLoggingEnabled: true
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${functionStorageAccount.name};AccountKey=${functionStorageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: 'InstrumentationKey=${appInsights.properties.InstrumentationKey}'
        }
      ]
    }
  }
}

// Enable function app diagnostics
resource functionAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${functionAppName}-diagnostics'
  scope: functionApp
  properties: {
    workspaceId: appInsights.id
    logs: [
      {
        category: 'FunctionAppLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
  }
}

// ==================== CORS Configuration for Function App ====================
resource functionAppCors 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: functionApp
  name: 'web'
  properties: {
    cors: {
      allowedOrigins: [
        'https://${projectName}-app.azurestaticapps.net'
        'http://localhost:3000'
      ]
      supportCredentials: true
    }
  }
}

// ==================== Outputs ====================
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output postgresServerId string = postgresServer.id
output postgresServerName string = postgresServer.name
output postgresDatabaseName string = postgresDatabaseName
output keyVaultId string = keyVault.id
output keyVaultName string = keyVault.name
output cacheForRedisId string = cacheForRedis.id
output cacheForRedisHostname string = cacheForRedis.properties.hostName
output serviceBusId string = serviceBusNamespace.id
output appInsightsId string = appInsights.id
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output functionAppId string = functionApp.id
output functionAppName string = functionApp.name
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}/api'
output containerAppsEnvironmentId string = containerAppsEnv.id
output apiContainerAppName string = apiContainerApp.name
output finalizerContainerAppName string = finalizerContainerApp.name
output holdCleanerJobNameOutput string = holdCleanerJob.name

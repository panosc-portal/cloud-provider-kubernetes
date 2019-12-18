export class ApplicationConfig {
  database: {
    type: string,
    host: string,
    port: string,
    userName: string,
    password: string,
    name: string,
    schema: string,
    synchronize: boolean,
    logging: boolean
  }

  kubernetes: {
    clusterName: string,
    userName: string,
    contextName: string,
    protocol: string,
    host: string,
    port: string,
    defaultNamespace: string,
    creationTimeoutS: number,
    unschedulableTimeoutS: number,
    ownerLabel: string,
    secretsConfig: string
  }
  logging: {
    level: string
  }

  scheduler: {
    enabled: boolean,
    config: string
  }

  constructor(data?: Partial<ApplicationConfig>) {
    Object.assign(this, data);
  }
}

export function APPLICATION_CONFIG(): ApplicationConfig {
 return {
    database: {
      type: process.env.CLOUD_PROVIDER_K8S_DATABASE_TYPE,
      host: process.env.CLOUD_PROVIDER_K8S_DATABASE_HOST,
      port: process.env.CLOUD_PROVIDER_K8S_DATABASE_PORT,
      userName: process.env.CLOUD_PROVIDER_K8S_DATABASE_USERNAME,
      password: process.env.CLOUD_PROVIDER_K8S_DATABASE_PASSWORD,
      name: process.env.CLOUD_PROVIDER_K8S_DATABASE_NAME,
      schema: process.env.CLOUD_PROVIDER_K8S_DATABASE_SCHEMA,
      synchronize: process.env.CLOUD_PROVIDER_K8S_DATABASE_SYNCHRONIZE === 'true',
      logging: process.env.CLOUD_PROVIDER_K8S_DATABASE_LOGGING === 'true'
    },
    kubernetes: {
      clusterName: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_CLUSTER_NAME,
      userName: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_USERNAME,
      contextName: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_CONTEXT_NAME,
      protocol: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_PROTOCOL,
      host: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_HOST,
      port: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_PORT,
      defaultNamespace: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_DEFAULT_NAMESPACE != null ? process.env.CLOUD_PROVIDER_K8S_KUBERNETES_DEFAULT_NAMESPACE : 'panosc',
      creationTimeoutS: 600,
      unschedulableTimeoutS: 60,
      ownerLabel: 'cloud-provider',
      secretsConfig: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_SECRETS_CONFIG,
    },
    logging: {
      level: process.env.CLOUD_PROVIDER_K8S_LOG_LEVEL
    },
    scheduler: {
      enabled: process.env.CLOUD_PROVIDER_K8S_SCHEDULER_ENABLED != null ? (process.env.CLOUD_PROVIDER_K8S_SCHEDULER_CONFIG === 'true') : true,
      config: process.env.CLOUD_PROVIDER_K8S_SCHEDULER_CONFIG
    }
  }
} 

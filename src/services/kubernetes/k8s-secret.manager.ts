import { K8sSecret, K8sSecretRequest, K8sSecretRequestConfig } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger, LoggedError } from '../../utils';
import { APPLICATION_CONFIG } from '../../application-config';
import * as fs from 'fs';

export class K8sSecretManager {

  private _secretConfigs: K8sSecretRequestConfig[] = [];
  private _secrets: Map<string, Array<K8sSecret>> = new Map();

  constructor(private _dataSource: KubernetesDataSource) {
    if (APPLICATION_CONFIG().kubernetes.secretsConfig != null) {
      const configFile = APPLICATION_CONFIG().kubernetes.secretsConfig;
      if (fs.existsSync(configFile)) {
        try {
          const data = fs.readFileSync(configFile);
          
          this._secretConfigs = JSON.parse(data.toString()) as K8sSecretRequestConfig[];

        } catch (error) {
          logger.error(`Unable to read secretes config file '${configFile}': ${error.message}`);
        }
      
      } else {
        logger.warn(`No secretes config file has been provided`);
      }
    }
  }

  async processSecretForRepository(repository: string, namespace: string): Promise<string> {
    if (repository == null) {
      return null;
    }

    const config = this._secretConfigs.find(config => config.repository === repository);
    if  (config != null) {
      const secretRequest = new K8sSecretRequest(config);
      const secret = await this.createIfNotExist(secretRequest, namespace);
      
      return secret.name;

    } else {
      logger.warn(`Could not find a secret config for repository '${repository}'`);
      return null;
    }
  }

  async get(name: string, namespace: string): Promise<K8sSecret> {
    try {
      logger.debug(`Getting kubernetes secret '${name}' in namespace '${namespace}'`);
      const secret = await this._dataSource.k8sClient.api.v1.namespace(namespace).secrets(name).get();
      const k8sSecret = new K8sSecret(name, secret.body);

      if (k8sSecret.isValid()) {
        logger.debug(`Got kubernetes secret '${name}' in namespace '${namespace}'`);
        
        this._addSecretToStore(k8sSecret, namespace);

        return k8sSecret;
      
      } else {
        throw new LoggedError(`Kubernetes secret with compute Id '${name}' is not valid`);
      }

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes secret '${name}' in namespace '${namespace}' does not exist`);
        return null;

      } else {
        throw new LoggedError(`Failed to get kubernetes secret with compute Id '${name}': ${error.message}`);
      }
    }
  }

  async create(secretRequest: K8sSecretRequest, namespace: string): Promise<K8sSecret> {
    try {
      logger.debug(`Creating kubernetes secret '${secretRequest.name}' for repository '${secretRequest.config.repository}' in namespace '${namespace}'`);
      const secret = await this._dataSource.k8sClient.api.v1.namespaces(namespace).secrets.post({ body: secretRequest.model });

      const k8sSecret = new K8sSecret(secretRequest.name, secret.body);
      if (k8sSecret.isValid()) {
        logger.debug(`Secret '${k8sSecret.name}' for repository '${secretRequest.config.repository}' in namespace '${namespace}' has been created`);

        this._addSecretToStore(k8sSecret, namespace);

        return k8sSecret;

      } else {
        throw new LoggedError(`Kubernetes secret with name '${secretRequest.name}' is not valid`);
      }

    } catch (error) {
      throw new LoggedError(`Failed to create k8s secret with name '${secretRequest.name}': ${error.message}`);
    }
  }

  async createIfNotExist(secretRequest: K8sSecretRequest, namespace: string): Promise<K8sSecret> {
    const secretName = secretRequest.name;
    let secret = this._getSecretFromStore(secretName, namespace);
    if (secret == null) {
      const secret = await this.get(secretName, namespace);

      if (secret == null) {
        return this.create(secretRequest, namespace);
      }
    }
    return secret;
  }

  private _getSecretFromStore(name: string, namespace: string): K8sSecret {
    let namespaceSecrets = this._secrets.get(namespace);
    if (namespaceSecrets != null) {
      const secret = namespaceSecrets.find(existingSecret => existingSecret.name === name);
      return secret;
    }

    return null;
  }

  private _addSecretToStore(secret: K8sSecret, namespace: string) {
    let namespaceSecrets = this._secrets.get(namespace);
    if (namespaceSecrets == null) {
      namespaceSecrets = [];
      this._secrets.set(namespace, namespaceSecrets);
    }
    if (namespaceSecrets.find(existingSecret => existingSecret.name === secret.name) == null) {
      namespaceSecrets.push(secret);
    }
  }

}

import { bind, BindingScope, inject } from '@loopback/core';
import { K8sNamespace, K8sNamespaceRequest } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger, LoggedError } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class K8sNamespaceManager {
  constructor(@inject('datasources.kubernetes') private _dataSource: KubernetesDataSource) {
  }

  async getWithName(name: string) {
    try {
      logger.debug(`Getting kubernetes namespace '${name}'`);
      const namespace = await this._dataSource.K8sClient.api.v1.namespaces(name).get();
      const k8sNamespace = new K8sNamespace(name, namespace.body);
      if (k8sNamespace.isValid()) {
        logger.debug(`Got kubernetes namespace '${name}'`);
        return k8sNamespace;

      } else {
        throw new LoggedError(`Kubernetes namespace '${name}' is not valid`);
      }

    } catch (error) {
      if (error.statusCode === 404) {
        return null;

      } else {
        throw new LoggedError(`Failed to get kubernetes namespace with name '${name}': ${error.message}`);
      }
    }
  }

  async create(namespaceName: string): Promise<K8sNamespace> {
    try {
      logger.debug(`Creating kubernetes namespace '${namespaceName}'`);

      const namespaceRequest = new K8sNamespaceRequest(namespaceName);

      const namespace = await this._dataSource.K8sClient.api.v1.namespaces.post({ body: namespaceRequest.model });

      if (namespace.body == null) {
        throw new LoggedError(`Failed to create k8s namespace with name ${namespaceRequest.name} because namespace body is null`);

      } else {
        const newNamespace = new K8sNamespace(namespaceName, namespace.body);

        if (newNamespace.isValid()) {
          logger.debug(`Namespace ${namespaceName} has been created`);
          return newNamespace;

        } else {
          throw new LoggedError(`Kubernetes namespace '${namespaceName}' is not valid`);
        }
      }
    } catch (error) {
      throw new LoggedError(`Failed to create k8s namespace '${namespaceName}': ${error.message}`);
    }
  }

  async createIfNotExist(namespaceName: string): Promise<K8sNamespace> {
    const existingNamespace = await this.getWithName(namespaceName);
    if (existingNamespace == null) {
      return this.create(namespaceName);
    } else {
      return existingNamespace;
    }
  }

  async delete(name: string): Promise<boolean> {
    try {
      logger.debug(`Deleting kubernetes namespace '${name}'`);
      await this._dataSource.K8sClient.api.v1.namespaces(name).delete();
      logger.debug(`Namespace '${name}' has been deleted`);
      return true;

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Namespace '${name}' does not exist so not deleting`);

      } else {
        logger.error(`Error deleting namespace '${name}': ${error.message}`);
      }
      return false;
    }
  }
}

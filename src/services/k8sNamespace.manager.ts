import { bind, BindingScope, inject } from '@loopback/core';
import { K8sNamespace, K8sNamespaceRequest } from '../models';
import { KubernetesDataSource } from '../datasources';
import { logger } from '../utils';

@bind({ scope: BindingScope.SINGLETON })
export class K8sNamespaceManager {
  constructor(@inject('datasources.kubernetes') private _dataSource: KubernetesDataSource) {
  }

  async getNamespaceWithName(name: string) {
    try {
      const namespace = await this._dataSource.K8sClient.api.v1.namespaces(name).get();
      const k8sNamespace = new K8sNamespace(namespace.body);
      if (k8sNamespace.isValid()) {
        return k8sNamespace;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(error.message);
      return null;
    }
  }

  async createNamespace(namespaceRequest: K8sNamespaceRequest): Promise<K8sNamespace> {
    try {
      const namespace = await this._dataSource.K8sClient.api.v1.namespaces.post({ body: namespaceRequest.model });
      const newNamespace = new K8sNamespace(namespace.body);
      if (newNamespace.isValid()) {
        logger.debug('Namespace ' + newNamespace.name + ' has been created');
        return newNamespace;
      } else {
        logger.error('Did not manage to create a kubernetes namespace');
        return null;
      }
    } catch (error) {
      logger.error(error.message);
      return null;
    }
  }

  async createNamespaceIfNotExist(namespaceRequest: K8sNamespaceRequest): Promise<K8sNamespace> {
    const namespaceName = namespaceRequest.name;
    const existingNamespace = await this.getNamespaceWithName(namespaceName);
    if (existingNamespace == null) {
      return this.createNamespace(namespaceRequest);
    } else {
      return existingNamespace;
    }
  }

  async deleteNamespace(name: string) {
    try {
      const deletedNamespace = await this._dataSource.K8sClient.api.v1
        .namespaces(name)
        .delete();
      logger.debug('Namespace ' + name + ' has been deleted');
      return deletedNamespace;
    } catch (error) {
      logger.error(error.message);
      return null;
    }
  }
}

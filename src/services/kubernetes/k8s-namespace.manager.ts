import { bind, BindingScope, inject } from '@loopback/core';
import { K8sNamespace, K8sNamespaceRequest } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class K8sNamespaceManager {
  constructor(@inject('datasources.kubernetes') private _dataSource: KubernetesDataSource) {}

  async getWithName(name: string) {
    try {
      const namespace = await this._dataSource.K8sClient.api.v1.namespaces(name).get();
      const k8sNamespace = new K8sNamespace(namespace.body);
      if (k8sNamespace.isValid()) {
        return k8sNamespace;
      } else {
        return null;
      }
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to get deployment ${name}`);
      }
    }
  }

  async create(namespaceRequest: K8sNamespaceRequest): Promise<K8sNamespace> {
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
      if (error.statusCode === 409) {
        return null;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to create namespace ${namespaceRequest.name}`);
      }
    }
  }

  async createIfNotExist(namespaceRequest: K8sNamespaceRequest): Promise<K8sNamespace> {
    const namespaceName = namespaceRequest.name;
    const existingNamespace = await this.getWithName(namespaceName);
    if (existingNamespace == null) {
      return this.create(namespaceRequest);
    } else {
      return existingNamespace;
    }
  }

  async delete(name: string): Promise<boolean> {
    try {
      await this._dataSource.K8sClient.api.v1.namespaces(name).delete();
      logger.debug('Namespace ' + name + ' has been deleted');
      return true;

    } catch (error) {
      if (error.statusCode === 404) {
        return false;
        
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to delete namespace ${name}`);
      }
    }
  }
}

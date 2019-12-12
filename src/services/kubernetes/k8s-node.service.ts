import { inject } from '@loopback/core';
import { KubernetesDataSource } from '../../datasources';
import { K8sNode } from '../../models/kubernetes';
import { logger } from '../../utils';

export class K8sNodeService {
  constructor(@inject('datasources.kubernetes') private _dataSource: KubernetesDataSource) {
  }


  async getAll(): Promise<K8sNode[]> {
    try {
      const nodes = [];
      const response = await this._dataSource.K8sClient.api.v1.nodes.get();
      const nodeItems = response.body.items;
      for (const nodeItem of nodeItems) {
        const node = new K8sNode(nodeItem);
        if (node.isValid()) {
          nodes.push(node);
        }
      }
      return nodes;
    } catch (error) {
      logger.error(error);
    }
  }

  async getMaster(): Promise<K8sNode> {
    const k8sNodes = await this.getAll();
    for (const k8sNode of k8sNodes) {
      if (k8sNode.isMaster()) {
        return k8sNode;
      }
    }
    return null;
  }

  async get(name: string): Promise<K8sNode> {
    try {
      const response = await this._dataSource.K8sClient.api.v1.nodes(name).get();
      const node = new K8sNode(response.body);
      if (node.isValid()) {
        return node;
      } else {
        return null;
      }
    } catch (error) {
      if (error.statusCode == 404) {
        return null;
      }
      logger.error(error.message);
    }
  }
}
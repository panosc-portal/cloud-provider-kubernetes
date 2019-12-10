import { inject } from '@loopback/core';
import { KubernetesDataSource } from '../../datasources';
import { K8sNode } from '../../models/kubernetes';

export class K8sNodeService {
  constructor(@inject('datasources.kubernetes') private _dataSource: KubernetesDataSource) {
  }


  async getAll() {
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

    }
  }
}
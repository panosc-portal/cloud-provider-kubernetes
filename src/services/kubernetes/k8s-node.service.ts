import { inject, bind, BindingScope } from '@loopback/core';
import { KubernetesDataSource } from '../../datasources';
import { K8sNode } from '../../models/kubernetes';
import { logger, LoggedError } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class K8sNodeService {
  constructor(@inject('datasources.kubernetes') private _dataSource: KubernetesDataSource) {
  }

  async getAll(): Promise<K8sNode[]> {
    const nodes = [];
    try {
      logger.debug(`Getting all kubernetes nodes`);
      const response = await this._dataSource.K8sClient.api.v1.nodes.get();
      const nodeItems = response.body.items;
      for (const nodeItem of nodeItems) {
        const node = new K8sNode(nodeItem);
        if (node.isValid()) {
          nodes.push(node);
        }
      }
      logger.debug(`Got ${nodes.length} kubernetes nodes`);

    } catch (error) {
      throw new LoggedError(`Failed to get all kubernetes nodes: ${error.message}`);
    }

    return nodes;
  }

  async getMaster(): Promise<K8sNode> {
    const k8sNodes = await this.getAll();
    if (k8sNodes.length == 1) {
      return k8sNodes[0];

    } else {
      const masterNode = k8sNodes.find(node => node.isMaster());
      if (masterNode != null) {
        return masterNode;

      } else {
        throw new LoggedError(`Couldn't find a kubernetes master node`);
      }
    }
  }

  async get(name: string): Promise<K8sNode> {
    try {
      logger.debug(`Getting kubernetes node with name '${name}'`);

      const response = await this._dataSource.K8sClient.api.v1.nodes(name).get();
      const node = new K8sNode(response.body);

      if (node.isValid()) {
        logger.debug(`Got kubernetes node with name '${name}'`);
        return node;

      } else {
        throw new LoggedError(`Kubernetes node with name '${name}' is not valid`);
      }

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes nodde with name '${name}' does not exist`);
        return null;

      } else {
        throw new LoggedError(`Failed to get kubernetes node with name '${name}': ${error.message}`);
      }
    }
  }
}
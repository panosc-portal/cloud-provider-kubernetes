import { bind, BindingScope, inject } from '@loopback/core';
import { Instance, Node } from '../models';
import { K8sNodeService } from './kubernetes';

@bind({ scope: BindingScope.SINGLETON })
export class NodeService {
  constructor(@inject('services.K8sNodeService') private _k8sNodeService: K8sNodeService,) {
  }

  async getAll(): Promise<Node[]> {
    const nodes = [];
    const k8sNodes = await this._k8sNodeService.getAll();
    if (k8sNodes) {
      for (const k8sNode of k8sNodes) {
        const node = new Node({
          hostname: k8sNode.hostname,
          cpus: {
            available: k8sNode.cpuAllocatable,
            total: k8sNode.cpuCapacity,
            used: k8sNode.cpuCapacity - k8sNode.cpuAllocatable
          }, memory: {
            available: k8sNode.memoryAllocatable,
            total: k8sNode.memoryCapacity,
            used: k8sNode.memoryCapacity - k8sNode.memoryAllocatable
          }
        });
        nodes.push(node);
      }
      return nodes;
    }

  }

  async getByHostname(hostname: string): Promise<Node> {
    const k8sNode = await this._k8sNodeService.get(hostname);
    if (k8sNode) {
      return new Node({
        hostname: k8sNode.hostname(),
        cpus: {
          available: k8sNode.cpuAllocatable,
          total: k8sNode.cpuCapacity,
          used: k8sNode.cpuCapacity - k8sNode.cpuAllocatable
        }, memory: {
          available: k8sNode.memoryAllocatable,
          total: k8sNode.memoryCapacity,
          used: k8sNode.memoryCapacity - k8sNode.memoryAllocatable
        }
      });
    }
  };


  getInstancesByNode(node: Node): Promise<Instance[]> {

    return new Promise<Instance[]>(function(resolve, reject) {
      resolve();
    });
  }
}

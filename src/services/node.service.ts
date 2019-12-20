import { bind, BindingScope, inject } from '@loopback/core';
import { Instance, Node } from '../models';
import { K8sNodeService } from './kubernetes';

@bind({ scope: BindingScope.SINGLETON })
export class NodeService {
  constructor(@inject('services.K8sNodeService') private _k8sNodeService: K8sNodeService) {
  }

  async getAll(): Promise<Node[]> {
    const k8sNodes = await this._k8sNodeService.getAll();
    const nodes = k8sNodes.map(k8sNode => new Node({
      hostname: k8sNode.hostname,
      cpus: {
        available: k8sNode.cpuAllocatable,
        total: k8sNode.cpuCapacity,
        used: k8sNode.cpuCapacity - k8sNode.cpuAllocatable
      }, memory: {
        available: k8sNode.memoryAllocatableMB,
        total: k8sNode.memoryCapacityMB,
        used: k8sNode.memoryCapacityMB - k8sNode.memoryAllocatableMB
      }
    }));
    return nodes;
  }

  async getByHostname(hostname: string): Promise<Node> {
    const k8sNode = await this._k8sNodeService.get(hostname);
    if (k8sNode) {
      return new Node({
        hostname: k8sNode.hostname,
        cpus: {
          available: k8sNode.cpuAllocatable,
          total: k8sNode.cpuCapacity,
          used: k8sNode.cpuCapacity - k8sNode.cpuAllocatable
        }, memory: {
          available: k8sNode.memoryAllocatableMB,
          total: k8sNode.memoryCapacityMB,
          used: k8sNode.memoryCapacityMB - k8sNode.memoryAllocatableMB
        }
      });
    } else {
      return null;
    }
  };
}

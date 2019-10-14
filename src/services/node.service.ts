import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {Instance, Node} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class NodeService {
  constructor(/* Add @inject to inject parameters */) {}

  getAll(): Promise<Node[]> {
    return new Promise<Node[]>(function(resolve, reject) {
      resolve([]);
    });
  };

  getById(id: number): Promise<Node> {
    return new Promise<Node>(function(resolve, reject) {
      resolve();
    });
  }

  getInstancesByNodeId(id: number): Promise<Instance[]> {
    return new Promise<Instance[]>(function(resolve, reject) {
      resolve();
    });
  }
}

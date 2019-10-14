import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {Instance, InstanceState} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class InstanceService {
  constructor(/* Add @inject to inject parameters */) {
  }

  getAll(): Promise<Instance[]> {
    return new Promise<Instance[]>(function(resolve, reject) {
      resolve([]);
    });
  };


  getById(id: number): Promise<Instance> {
    return new Promise<Instance>(function(resolve, reject) {
      resolve();
    });
  }

  updateById(id: number): Promise<Instance> {
    return new Promise<Instance>(function(resolve, reject) {
      resolve();
    });
  }

  create(): Promise<Instance> {
    return new Promise<Instance>(function(resolve, reject) {
      resolve();
    });
  }

  getStateById(): Promise<InstanceState> {
    return new Promise<InstanceState>(function(resolve, reject) {
      resolve();
    });
  }

  deleteById(): void {
  }

  actionById(): void {
  }

}

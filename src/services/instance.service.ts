import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {Instance, InstanceState, K8sInstance} from '../models';
import { K8sInstanceServiceTest} from './k8s-instance.service';

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

  async create(): Promise<K8sInstance> {
    // TODO : change for creation of instance object
    return K8sInstanceServiceTest.createK8sInstance()
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

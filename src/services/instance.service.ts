import {bind, BindingScope, inject} from '@loopback/core';
import {Image, Instance, InstanceState, K8sInstance} from '../models';
import { K8sInstanceServiceTest} from './k8s-instance.service';
import { InstanceRepository} from '../repositories';

@bind({scope: BindingScope.SINGLETON})
export class InstanceService {
  constructor(@inject('instance-repository') private _instanceRepository: InstanceRepository) {
  }

  getAll(): Promise<Instance[]> {
    return this._instanceRepository.getAll()
  }


  getById(id:number): Promise<Instance>{
    return this._instanceRepository.getById(id);
  }

  updateById(id: number): Promise<Instance> {
    return new Promise<Instance>(function(resolve, reject) {
      resolve();
    });
  }

  async create(): Promise<Instance> {
    const kubeInstance:K8sInstance = await K8sInstanceServiceTest.createK8sInstance();
    const instanceName = kubeInstance.deployment.name;
    return new Instance({name:instanceName})
  }

  getStateById(): Promise<InstanceState> {
    return new Promise<InstanceState>(function(resolve, reject) {
      resolve();
    });
  }

  async deleteById(id:number): Promise<void> {
    await this._instanceRepository.deleteById(id)
  }

  actionById(): void {
  }

}

import {bind, BindingScope, inject} from '@loopback/core';
import { Instance, InstanceState, K8sInstance} from '../models';
import { K8sInstanceServiceTest} from './k8s-instance.service';
import { InstanceRepository} from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({scope: BindingScope.SINGLETON})
export class InstanceService extends BaseService<Instance> {

  constructor(@repository(InstanceRepository) repo: InstanceRepository) {
    super(repo)
  }

  updateById(id: number): Promise<Instance> {
    return new Promise<Instance>(function(resolve, reject) {
      resolve();
    });
  }

  async create(): Promise<Instance> {
    const kubeInstance: K8sInstance = await K8sInstanceServiceTest.createK8sInstance();
    const instanceName = kubeInstance.deployment.name;
    return new Instance({name: instanceName});
  }

  getStateById(): Promise<InstanceState> {
    return new Promise<InstanceState>(function(resolve, reject) {
      resolve();
    });
  }

  actionById(): void {
  }

  getAll(): Promise<Instance[]> {
    return this._repository.find(null, {leftJoin: ['image', 'flavour', 'protocols']});
  }
}

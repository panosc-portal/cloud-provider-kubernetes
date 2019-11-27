import {bind, BindingScope, inject} from '@loopback/core';
import {Flavour, Image, Instance, InstanceState, K8sInstance} from '../models';
import {K8sInstanceService} from './k8sInstance.service';
import {InstanceRepository, QueryOptions} from '../repositories';
import {repository} from '@loopback/repository';
import {BaseService} from './base.service';

@bind({scope: BindingScope.SINGLETON})
export class InstanceService extends BaseService<Instance> {

  constructor(@repository(InstanceRepository) repo: InstanceRepository, @inject('services.K8sInstanceService') private k8sInstanceService: K8sInstanceService) {
    super(repo);
  }

  updateById(id: number): Promise<Instance> {
    return new Promise<Instance>(function(resolve, reject) {
      resolve();
    });
  }

  async create(instance: Instance): Promise<Instance> {
    instance = await this.save(instance);

    // Check saves in db
    if (instance.id != null) {
      // TODO: Make this an async command/action - return before it is completed because it could be slow
      const k8sInstance: K8sInstance = await this.k8sInstanceService.createK8sInstance(instance);

      // Set k8sInstance information in DB (such as deployment and service identifiers, service host, service ports)

      // Update instance status
    }
   
    return instance;
  }

  getStateById(): Promise<InstanceState> {
    return new Promise<InstanceState>(function(resolve, reject) {
      resolve();
    });
  }

  actionById(): void {
  }

  getAll(): Promise<Instance[]> {
    return this._repository.find(null, {leftJoins: ['image', 'flavour', 'protocols']} as QueryOptions);
  }
}

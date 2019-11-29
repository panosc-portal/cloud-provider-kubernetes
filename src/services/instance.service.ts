import { bind, BindingScope, inject } from '@loopback/core';
import { Instance } from '../models';
import { K8sInstanceService } from './k8sInstance.service';
import { InstanceRepository, QueryOptions } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceService extends BaseService<Instance> {
  constructor(
    @repository(InstanceRepository) repo: InstanceRepository,
    @inject('services.K8sInstanceService') private _k8sInstanceService: K8sInstanceService
  ) {
    super(repo);
  }

  async create(instance: Instance): Promise<Instance> {
    instance = await this.save(instance);

    // Check saves in db
    if (instance.id != null) {
      // TODO: Make this an async command/action - return before it is completed because it could be slow
      await this._k8sInstanceService.createK8sInstance(instance);

      // Set k8sInstance information in DB (such as deployment and service identifiers, service host, service ports)

      // Update instance status
    }

    return instance;
  }

  executeAction(instance: Instance): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getAll(): Promise<Instance[]> {
    return this._repository.find(null, { leftJoins: ['image', 'flavour', 'protocols'] } as QueryOptions);
  }
}

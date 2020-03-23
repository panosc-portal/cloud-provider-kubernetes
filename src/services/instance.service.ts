import { bind, BindingScope, inject } from '@loopback/core';
import { Instance, InstanceStatus } from '../models';
import { InstanceRepository } from '../repositories';
import { repository, WhereBuilder, Where } from '@loopback/repository';
import { BaseService } from './base.service';
import { InstanceProtocolService } from './instance-protocol.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceService extends BaseService<Instance, InstanceRepository> {

  get instanceProtocolService(): InstanceProtocolService {
    return this._instanceProtocolService;
  }

  constructor(@repository(InstanceRepository) repo: InstanceRepository, @inject('services.InstanceProtocolService') private _instanceProtocolService: InstanceProtocolService) {
    super(repo);
  }

  getAllWithStates(states: InstanceStatus[]): Promise<Instance[]> {
    return this._repository.getAllWithStates(states);
  }

  async getAllNamespaceComputeIds(): Promise<{ namespace: string, computeId: string }[]> {
    return this._repository.getAllNamespaceComputeIds();
  }

  count(where?: Where): Promise<number> {
    if (where) {
      where = new WhereBuilder()
      .eq('deleted', false)
      .and(where)
      .build();

    } else {
      where = new WhereBuilder()
      .eq('deleted', false)
      .build();
    }

    return this._repository.count(where);
  }

  getInstancesByNodeHostname(name: string): Promise<Instance[]> {
    return this._repository.getInstancesByNodeHostname(name);
  }

  async deleteProtocols(instance: Instance): Promise<boolean> {
    const didDelete = this._instanceProtocolService.deleteForInstance(instance);
    if (didDelete) {
      instance.protocols = [];
    }

    return didDelete;
  }
}

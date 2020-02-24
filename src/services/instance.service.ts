import { bind, BindingScope } from '@loopback/core';
import { Instance, InstanceStatus } from '../models';
import { InstanceRepository } from '../repositories';
import { repository, WhereBuilder, Where } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceService extends BaseService<Instance, InstanceRepository> {
  constructor(@repository(InstanceRepository) repo: InstanceRepository) {
    super(repo);
  }

  getAllWithStates(states: InstanceStatus[]): Promise<Instance[]> {
    return this._repository.getAllWithStates(states);
  }

  async getAllNamespaceComputeIds(): Promise<{ namespace: string; computeId: string }[]> {
    return this._repository.getAllNamespaceComputeIds();
  }

  count(where?: Where): Promise<number> {
    if (where) {
      where = new WhereBuilder()
        .eq('deleted', false)
        .and(where)
        .build();
    } else {
      where = new WhereBuilder().eq('deleted', false).build();
    }

    return this._repository.count(where);
  }

  getInstancesByNodeHostname(name: string): Promise<Instance[]> {
    return this._repository.getInstancesByNodeHostname(name);
  }
}

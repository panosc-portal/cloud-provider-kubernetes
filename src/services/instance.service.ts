import { bind, BindingScope, inject } from '@loopback/core';
import { Instance, InstanceStatus } from '../models';
import { InstanceRepository, QueryOptions } from '../repositories';
import { repository, FilterBuilder, WhereBuilder } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceService extends BaseService<Instance, InstanceRepository> {
  constructor(@repository(InstanceRepository) repo: InstanceRepository) {
    super(repo);
  }

  getAll(): Promise<Instance[]> {
    const where = new WhereBuilder().eq('deleted', false).build();
    const filter = new FilterBuilder().where(where).build();
    return this._repository.find(filter, { leftJoins: ['image', 'flavour', 'protocols'] } as QueryOptions);
  }

  getAllWithStates(states: InstanceStatus[]): Promise<Instance[]> {
    const where = new WhereBuilder()
      .eq('deleted', false)
      .inq('status', states)
      .build();
    const filter = new FilterBuilder().where(where).build();
    return this._repository.find(filter, { leftJoins: ['image', 'flavour', 'protocols'] } as QueryOptions);
  }

  async getAllNamespaceComputeIds(): Promise<{namespace: string, computeId: string}[]> {
    return this._repository.getAllNamespaceComputeIds();
  }
}

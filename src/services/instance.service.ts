import { bind, BindingScope, inject } from '@loopback/core';
import { Instance } from '../models';
import { InstanceRepository, QueryOptions } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceService extends BaseService<Instance> {
  constructor(@repository(InstanceRepository) repo: InstanceRepository) {
    super(repo);
  }

  getAll(): Promise<Instance[]> {
    return this._repository.find(null, { leftJoins: ['image', 'flavour', 'protocols'] } as QueryOptions);
  }
}

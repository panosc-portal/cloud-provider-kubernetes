import { bind, BindingScope } from '@loopback/core';
import { InstanceProtocol, Instance } from '../models';
import { InstanceProtocolRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceProtocolService extends BaseService<InstanceProtocol, InstanceProtocolRepository> {
  constructor(@repository(InstanceProtocolRepository) repo: InstanceProtocolRepository) {
    super(repo);
  }

  deleteForInstance(instance: Instance): Promise<boolean> {
    return this._repository.deleteForInstance(instance);
  }
}

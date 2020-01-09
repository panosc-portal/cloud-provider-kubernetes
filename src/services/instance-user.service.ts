import { bind, BindingScope } from '@loopback/core';
import { InstanceUser } from '../models';
import { InstanceUserRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceUserService extends BaseService<InstanceUser, InstanceUserRepository> {
  constructor(@repository(InstanceUserRepository) repo: InstanceUserRepository) {
    super(repo);
  }
}

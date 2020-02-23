import { bind, BindingScope } from '@loopback/core';
import { InstanceAccount } from '../models';
import { InstanceAccountRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceAccountService extends BaseService<InstanceAccount, InstanceAccountRepository> {
  constructor(@repository(InstanceAccountRepository) repo: InstanceAccountRepository) {
    super(repo);
  }
}

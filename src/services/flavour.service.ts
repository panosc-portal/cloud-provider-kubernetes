import { bind, BindingScope } from '@loopback/core';
import { Flavour } from '../models';
import { FlavourRepository } from '../repositories';
import { repository, FilterBuilder } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class FlavourService extends BaseService<Flavour, FlavourRepository> {
  constructor(@repository(FlavourRepository) repo: FlavourRepository) {
    super(repo);
  }

  getAll(): Promise<Flavour[]> {
    const filter = new FilterBuilder().order('cpu', 'memory').build();
    return this._repository.find(filter);
  }

}

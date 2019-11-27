import {bind, BindingScope} from '@loopback/core';
import {Flavour} from '../models';
import {FlavourRepository} from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({scope: BindingScope.SINGLETON})
export class FlavourService extends BaseService<Flavour> {
  
  constructor(@repository(FlavourRepository) repo: FlavourRepository) {
    super(repo);
  }

}


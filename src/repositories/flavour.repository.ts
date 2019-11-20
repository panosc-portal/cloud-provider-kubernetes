import {Flavour, Image} from '../models';
import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';
import {TypeORMDataSource} from '../datasources';

export class FlavourRepository extends BaseRepository<Flavour, number> {

  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Image);
  }

}


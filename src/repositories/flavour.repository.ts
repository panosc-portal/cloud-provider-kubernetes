import {Flavour, Image} from '../models';
import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';
import {TypeormDataSource} from '../datasources';

export class FlavourRepository extends BaseRepository<Flavour> {


  constructor(@inject('datasources.typeorm') dataSource: TypeormDataSource) {
    super(dataSource, Image);
  }

}


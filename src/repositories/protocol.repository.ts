import { Protocol} from '../models';
import {TypeORMDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';

export class ProtocolRepository extends BaseRepository<Protocol, number> {

  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Protocol);
  }
}

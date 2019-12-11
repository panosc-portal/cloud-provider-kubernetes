import { InstanceProtocol } from '../models';
import { TypeORMDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';

export class ProtocolRepository extends BaseRepository<InstanceProtocol, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, InstanceProtocol);
  }
}

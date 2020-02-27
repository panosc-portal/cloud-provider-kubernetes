import { InstanceProtocol, Instance } from '../models';
import { inject } from '@loopback/core';
import { TypeORMDataSource } from '../datasources';
import { BaseRepository } from './base.repository';

export class InstanceProtocolRepository extends BaseRepository<InstanceProtocol, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, InstanceProtocol);
  }

  deleteForInstance(instance: Instance): Promise<boolean> {
    return this.deleteWhere({instance: instance});
  }
}

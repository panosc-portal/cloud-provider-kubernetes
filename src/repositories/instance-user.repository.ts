import { InstanceUser } from '../models';
import { inject } from '@loopback/core';
import { TypeORMDataSource } from '../datasources';
import { BaseRepository } from './base.repository';

export class InstanceUserRepository extends BaseRepository<InstanceUser, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, InstanceUser);
  }
}

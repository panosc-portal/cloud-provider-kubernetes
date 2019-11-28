import { Instance } from '../models';
import { TypeORMDataSource } from '../datasources';
import { inject } from '@loopback/core';

import { BaseRepository } from './base.repository';

export class InstanceRepository extends BaseRepository<Instance, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Instance);
  }
}

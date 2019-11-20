import { InstanceService} from '../models';
import {TypeORMDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';

export class InstanceServiceRepository extends BaseRepository<InstanceService, number> {

  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, InstanceService);
  }
}

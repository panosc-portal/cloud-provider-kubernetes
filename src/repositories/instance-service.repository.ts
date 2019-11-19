import { InstanceService} from '../models';
import {TypeormDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';

export class InstanceServiceRepository extends BaseRepository<InstanceService> {

  constructor(@inject('datasources.typeorm') dataSource: TypeormDataSource) {
    super(dataSource, InstanceService);
  }
}

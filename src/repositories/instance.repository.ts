import {Instance} from '../models';
import {TypeormDataSource} from '../datasources';
import {inject} from '@loopback/core';

import {BaseRepository} from './base.repository';

export class InstanceRepository extends BaseRepository<Instance> {


  constructor(@inject('datasources.typeorm') dataSource: TypeormDataSource) {
    super(dataSource, Instance);
  }

  async getAllInstances(): Promise<Instance[]> {
    return this.getAll({ relations: ["image","flavour","instanceServices"] });
  }

}
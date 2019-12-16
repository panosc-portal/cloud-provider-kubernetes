import { Instance } from '../models';
import { TypeORMDataSource } from '../datasources';
import { inject } from '@loopback/core';

import { BaseRepository } from './base.repository';

export class InstanceRepository extends BaseRepository<Instance, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Instance);
  }

  async getAllNamespaceComputeIds(): Promise<{namespace: string, computeId: string}[]> {
    const repository = await this.init();
    const queryBuilder = repository.createQueryBuilder('instance');

    const data = await queryBuilder.select(["instance.namespace", "instance.computeId"]).getMany();
    return data.map(instance => ({namespace: instance.namespace, computeId: instance.computeId}));
  }
}

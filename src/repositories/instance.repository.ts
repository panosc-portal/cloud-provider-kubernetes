import { Instance, InstanceStatus } from '../models';
import { TypeORMDataSource } from '../datasources';
import { inject } from '@loopback/core';

import { BaseRepository } from './base.repository';
import { In } from 'typeorm';

export class InstanceRepository extends BaseRepository<Instance, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Instance);
  }

  find(): Promise<Instance[]> {
    return super.find({ where: { deleted: false }, order: { id: 'ASC' } });
  }

  getAllWithStates(states: InstanceStatus[]): Promise<Instance[]> {
    return super.find({ where: { deleted: false, status: In(states) }, order: { id: 'ASC' } });
  }

  getInstancesByNodeHostname(name: string): Promise<Instance[]> {
    return super.find({ where: { deleted: false, nodeHostname: name }, order: { id: 'ASC' } });
  }

  async getAllNamespaceComputeIds(): Promise<{ namespace: string; computeId: string }[]> {
    const repository = await this.init();
    const queryBuilder = repository.createQueryBuilder('instance');

    const data = await queryBuilder.select(['instance.namespace', 'instance.computeId']).getMany();
    return data.map(instance => ({ namespace: instance.namespace, computeId: instance.computeId }));
  }
}

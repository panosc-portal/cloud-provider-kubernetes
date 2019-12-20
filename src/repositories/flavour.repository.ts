import { Flavour } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';

export class FlavourRepository extends BaseRepository<Flavour, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Flavour);
  }

  async getUsageCount(): Promise<{flavourId: number, flavourName: string, instanceCount: number}[]> {
    const command = `
      select im.id::integer as flavour_id, im.name as flavour_name, count(i.id)::integer as instance_count
      from instance i, flavour im
      where i.flavour_id = im.id
      and i.deleted = false
      group by im.id, im.name;
    `;
    const rows = await this.execute(command);

    return rows.map((row: any) => ({flavourId: row.flavour_id, flavourName: row.flavour_name, instanceCount: row.instance_count}));
  }

}

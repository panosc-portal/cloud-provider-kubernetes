import { Image } from '../models';
import { inject } from '@loopback/core';
import { TypeORMDataSource } from '../datasources';
import { BaseRepository } from './base.repository';
import { LoggedError } from '../utils';

export class ImageRepository extends BaseRepository<Image, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Image);
  }

  async getUsageCount(): Promise<{imageId: number, imageName: string, instanceCount: number}[]> {
    try {
      const command = `
        select im.id::integer as image_id, im.name as image_name, count(i.id)::integer as instance_count
        from instance i, image im
        where i.image_id = im.id
        and i.deleted = false
        group by im.id, im.name;
      `;
      const rows = await this.execute(command);

      return rows.map((row: any) => ({imageId: row.image_id, imageName: row.image_name, instanceCount: row.instance_count}));

    } catch (error) {
      throw new LoggedError(`Failed to get image usage count from database: ${error.message}`);
    }
  }

}

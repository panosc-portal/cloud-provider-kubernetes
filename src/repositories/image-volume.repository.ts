import { ImageVolume } from '../models';
import { inject } from '@loopback/core';
import { TypeORMDataSource } from '../datasources';
import { BaseRepository } from './base.repository';

export class ImageVolumeRepository extends BaseRepository<ImageVolume, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, ImageVolume);
  }
}

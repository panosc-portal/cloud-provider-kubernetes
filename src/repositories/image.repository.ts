import {Image} from '../models';
import {inject} from '@loopback/core';
import { TypeormDataSource } from '../datasources';
import { BaseRepository } from './base.repository';

export class ImageRepository extends BaseRepository<Image> {

  constructor(@inject('datasources.typeorm') dataSource: TypeormDataSource) {
    super(dataSource, Image);
  }
}

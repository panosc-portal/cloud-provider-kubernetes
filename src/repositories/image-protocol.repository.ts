import { ImageProtocol } from '../models';
import { inject } from '@loopback/core';
import { TypeORMDataSource } from '../datasources';
import { BaseRepository } from './base.repository';

export class ImageProtocolRepository extends BaseRepository<ImageProtocol, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, ImageProtocol);
  }
}

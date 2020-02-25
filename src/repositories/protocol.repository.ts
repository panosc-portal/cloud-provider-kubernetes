import { Protocol } from '../models';
import { inject } from '@loopback/core';
import { TypeORMDataSource } from '../datasources';
import { BaseRepository } from './base.repository';
import { In } from 'typeorm';

export class ProtocolRepository extends BaseRepository<Protocol, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Protocol);
  }

  find(): Promise<Protocol[]> {
    return super.find({ order: { id: 'ASC' } });
  }

  getProtocolById(protocolId: number) {
    return super.find({ where: { id: protocolId}, order: {id: 'ASC'} });
  }

  getProtocolByIds(protocolIds: number[]) {
    return super.find({ where: { id: In(protocolIds)}, order: {id: 'ASC'} });
  }

}

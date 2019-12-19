import { bind, BindingScope } from '@loopback/core';
import { Image, Protocol } from '../models';
import { ImageRepository, QueryOptions } from '../repositories';
import { repository, FilterBuilder, WhereBuilder } from '@loopback/repository';
import { BaseService } from './base.service';
import { ProtocolRepository } from '../repositories/protocol.repository';

@bind({ scope: BindingScope.SINGLETON })
export class ImageService extends BaseService<Image, ImageRepository> {

  constructor(@repository(ImageRepository) repo: ImageRepository, @repository(ProtocolRepository) private _protocolRepository: ProtocolRepository) {
    super(repo);
  }

  getAll(): Promise<Image[]> {
    const filter = new FilterBuilder().order('image.id').build();
    return this._repository.find(filter, { leftJoins: ['protocols'] } as QueryOptions);
  }

  getAllProtocols(): Promise<Protocol[]> {
    return this._protocolRepository.find();
  }

  getProtocolByIds(protocolIds: number[]) {
    const where = new WhereBuilder()
      .inq('id', protocolIds)
      .build();
    const filter = new FilterBuilder().where(where).order('protocol.id').build();
    return this._protocolRepository.find(filter);
  }

  getImageUsageCount(): Promise<{imageId: number, imageName: string, instanceCount: number}[]> {
    return this._repository.getImageUsageCount();
  }
}

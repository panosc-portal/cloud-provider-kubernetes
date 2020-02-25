import { bind, BindingScope } from '@loopback/core';
import { Image, Protocol } from '../models';
import { ImageRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';
import { ProtocolRepository } from '../repositories/protocol.repository';

@bind({ scope: BindingScope.SINGLETON })
export class ImageService extends BaseService<Image, ImageRepository> {

  constructor(@repository(ImageRepository) repo: ImageRepository, @repository(ProtocolRepository) private _protocolRepository: ProtocolRepository) {
    super(repo);
  }

  getAllProtocols(): Promise<Protocol[]> {
    return this._protocolRepository.find();
  }

  getProtocolById(protocolId: number) {
    return this._protocolRepository.getProtocolById(protocolId);
  }

  getProtocolByIds(protocolIds: number[]) {
    return this._protocolRepository.getProtocolByIds(protocolIds);
  }

  getUsageCount(): Promise<{imageId: number, imageName: string, instanceCount: number}[]> {
    return this._repository.getUsageCount();
  }
}

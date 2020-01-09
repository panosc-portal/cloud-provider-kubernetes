import { bind, BindingScope } from '@loopback/core';
import { ImageProtocol } from '../models';
import { ImageProtocolRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class ImageProtocolService extends BaseService<ImageProtocol, ImageProtocolRepository> {
  constructor(@repository(ImageProtocolRepository) repo: ImageProtocolRepository) {
    super(repo);
  }
}

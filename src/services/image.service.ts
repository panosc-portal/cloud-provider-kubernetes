import { bind, BindingScope } from '@loopback/core';
import { Image } from '../models';
import { ImageRepository, QueryOptions } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class ImageService extends BaseService<Image, ImageRepository> {
  constructor(@repository(ImageRepository) repo: ImageRepository) {
    super(repo);
  }

  getAll(): Promise<Image[]> {
    return this._repository.find(null, { leftJoins: ['protocols'] } as QueryOptions);
  }
}

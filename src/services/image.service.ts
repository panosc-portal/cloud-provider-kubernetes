import { bind, BindingScope } from '@loopback/core';
import { Image } from '../models';
import { ImageRepository, QueryOptions } from '../repositories';
import { repository, WhereBuilder, FilterBuilder } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class ImageService extends BaseService<Image, ImageRepository> {
  constructor(@repository(ImageRepository) repo: ImageRepository) {
    super(repo);
  }

  getAll(): Promise<Image[]> {
    const filter = new FilterBuilder().order('image.id').build();
    return this._repository.find(filter, { leftJoins: ['protocols'] } as QueryOptions);
  }
}

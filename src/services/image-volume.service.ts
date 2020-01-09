import { bind, BindingScope } from '@loopback/core';
import { ImageVolume } from '../models';
import { ImageVolumeRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class ImageVolumeService extends BaseService<ImageVolume, ImageVolumeRepository> {
  constructor(@repository(ImageVolumeRepository) repo: ImageVolumeRepository) {
    super(repo);
  }
}

import {bind, BindingScope, inject} from '@loopback/core';
import {Image} from '../models';
import {ImageRepository} from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({scope: BindingScope.SINGLETON})
export class ImageService extends BaseService<Image> {

  constructor(@repository(ImageRepository) repo: ImageRepository) {
    super(repo);
  }

}


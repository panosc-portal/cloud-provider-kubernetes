import {bind, BindingScope, inject} from '@loopback/core';
import {Image} from '../models';
import {ImageRepository} from '../repositories';
import { repository } from '@loopback/repository';

@bind({scope: BindingScope.SINGLETON})
export class ImageService {
  constructor(@repository(ImageRepository) private _imageRepository: ImageRepository) {}

  getAll(): Promise<Image[]> {
    return this._imageRepository.find();
  }

  getById(id:number): Promise<Image>{
    return this._imageRepository.findById(id);
  }

  save(image: Image): Promise<Image> {
    if (image.id == null) {
      return this._imageRepository.save(image);

    } else {
      return this.update(image);
    }
  }

  delete(image: Image): Promise<boolean> {
    return this._imageRepository.deleteById(image.id);
  }

  update(image: Image):Promise<Image> {
    return this._imageRepository.updateById(image.id, image);
  }
}


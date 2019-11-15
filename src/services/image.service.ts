import {bind, BindingScope, inject} from '@loopback/core';
import {Image} from '../models';
import {ImageRepository} from '../repositories';

@bind({scope: BindingScope.SINGLETON})
export class ImageService {
  constructor(@inject('image-repository') private _imageRepository: ImageRepository) {}

  async getAll(): Promise<Image[]> {
    return this._imageRepository.getAll();
  }

  getById(id:number): Promise<Image>{
    return new Promise<Image>(function(resolve,reject) {
      resolve()
    })
  }

  updateById(id:number):Promise<Image>{
    return new Promise<Image>(function(resolve,reject) {
      resolve()
    })
  }

}

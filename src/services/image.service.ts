import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {Image} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class ImageService {
  constructor(/* Add @inject to inject parameters */) {}

  getAll(): Promise<Image[]> {
    return new Promise<Image[]>(function(resolve, reject) {
      resolve([]);
    });
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

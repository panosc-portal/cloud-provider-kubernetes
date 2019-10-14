import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {Flavour} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class FlavourService {
  constructor(/* Add @inject to inject parameters */) {
  }


  getAll(): Promise<Flavour[]> {
    return  new Promise<Flavour[]>(function(resolve, reject) {
      resolve([]);
    });
  }

  getById(id:number): Promise<Flavour>{
    return new Promise<Flavour>(function(resolve,reject) {
      resolve()
    })
  }
}

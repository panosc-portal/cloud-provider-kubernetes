import {bind, BindingScope, inject} from '@loopback/core';
import {Flavour} from '../models';
import {FlavourRepository, } from '../repositories';


@bind({scope: BindingScope.SINGLETON})
export class FlavourService {
  constructor(@inject('flavour-repository') private _flavourRepository: FlavourRepository) {
  }


  getAll(): Promise<Flavour[]> {
    return this._flavourRepository.getAll()
  }

  getById(id:number): Promise<Flavour>{
    return new Promise<Flavour>(function(resolve,reject) {
      resolve()
    })
  }
}

import {bind, BindingScope, inject} from '@loopback/core';
import {Flavour} from '../models';
import {FlavourRepository} from '../repositories';


@bind({scope: BindingScope.SINGLETON})
export class FlavourService {
  constructor(@inject('flavour-repository') private _flavourRepository: FlavourRepository) {
  }


  getAll(): Promise<Flavour[]> {
    return this._flavourRepository.getAll();
  }

  getById(id: number): Promise<Flavour> {
    return this._flavourRepository.getById(id);
  }

  async update(id:number,flavour:Flavour):Promise<Flavour>{
    await this._flavourRepository.updateById(id,flavour);
    return this._flavourRepository.getById(id);
  }
}


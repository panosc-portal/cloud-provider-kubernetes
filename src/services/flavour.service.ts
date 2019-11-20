import {bind, BindingScope, inject} from '@loopback/core';
import {Flavour} from '../models';
import {FlavourRepository} from '../repositories';
import { repository } from '@loopback/repository';


@bind({scope: BindingScope.SINGLETON})
export class FlavourService {
  constructor(@repository(FlavourRepository) private _flavourRepository: FlavourRepository) {
  }


  getAll(): Promise<Flavour[]> {
    return this._flavourRepository.find();
  }

  getById(id: number): Promise<Flavour> {
    return this._flavourRepository.findById(id);
  }

  async update(id:number,flavour:Flavour):Promise<Flavour>{
    await this._flavourRepository.updateById(id,flavour);
    return this._flavourRepository.findById(id);
  }
}


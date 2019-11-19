import {DefaultCrudRepository, BelongsToAccessor} from '@loopback/repository';
import {Flavour, FlavourRelations, Instance} from '../models';
import {inject} from '@loopback/core';
import { DataSource } from 'loopback-datasource-juggler';

export class FlavourRepository extends DefaultCrudRepository<Flavour,
  typeof Flavour.prototype.id,
  FlavourRelations> {

  public readonly instance: BelongsToAccessor<Instance, typeof Flavour.prototype.id>;

  constructor(
    @inject('datasources.postgres') dataSource: DataSource) {
    super(Flavour, dataSource);
  }

  async getAll() {
    return this.find();
  }

  async getById(id : number){
    return this.findById(id)
  }


}


import {DefaultCrudRepository, BelongsToAccessor} from '@loopback/repository';
import {Flavour, FlavourRelations, Instance} from '../models';
import {PostgresDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class FlavourRepository extends DefaultCrudRepository<Flavour,
  typeof Flavour.prototype.id,
  FlavourRelations> {

  public readonly instance: BelongsToAccessor<Instance, typeof Flavour.prototype.id>;

  constructor(
    @inject('datasources.postgreSQL') dataSource: PostgresDataSource) {
    super(Flavour, dataSource);
  }

  async getAll() {
    return this.find();
  }

  async getById(id : number){
    return this.findById(id)
  }


}


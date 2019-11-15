import {DefaultCrudRepository, BelongsToAccessor} from '@loopback/repository';
import {Instance, InstanceRelations, Image, Flavour} from '../models';
import {PostgresDataSource} from '../datasources';
import {inject} from '@loopback/core';


export class InstanceRepository extends DefaultCrudRepository<Instance,
  typeof Instance.prototype.id,
  InstanceRelations> {

  public readonly image: BelongsToAccessor<Image, typeof Instance.prototype.id>;

  public readonly flavour: BelongsToAccessor<Flavour, typeof Instance.prototype.id>;

  constructor(
    @inject('datasources.postgreSQL') dataSource: PostgresDataSource) {
    super(Instance, dataSource);
  }

  getAll(){
    return this.find()
  }

}

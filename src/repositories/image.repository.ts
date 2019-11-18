import {BelongsToAccessor, DefaultCrudRepository} from '@loopback/repository';
import {Image, ImageRelations, Instance} from '../models';
import {PostgresDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ImageRepository extends DefaultCrudRepository<Image,
  typeof Image.prototype.id,
  ImageRelations> {

  public readonly instance: BelongsToAccessor<Instance, typeof Image.prototype.id>;

  constructor(
    @inject('datasources.postgreSQL') dataSource: PostgresDataSource) {
    super(Image, dataSource);
    //this.instance = this.createBelongsToAccessorFor('instance', instanceRepositoryGetter);
  }

  async getAll() {
    return this.find();
  }

  async getById(id : number){
    return this.findById(id)
  }


}

import {BelongsToAccessor, DefaultCrudRepository} from '@loopback/repository';
import {Image, ImageRelations, Instance} from '../models';
import {inject} from '@loopback/core';
import { DataSource } from 'loopback-datasource-juggler';

export class ImageRepository extends DefaultCrudRepository<Image,
  typeof Image.prototype.id,
  ImageRelations> {

  public readonly instance: BelongsToAccessor<Instance, typeof Image.prototype.id>;

  constructor(
    @inject('datasources.postgreSQL') dataSource: DataSource) {
    super(Image, dataSource);
  }

  async getAll() {
    return this.find();
  }

  async getById(id : number){
    return this.findById(id)
  }


}

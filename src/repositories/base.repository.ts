import {TypeormDataSource} from '../datasources';
import {DeleteResult, FindManyOptions, ObjectType, Repository, UpdateResult} from 'typeorm';
import {Options} from '@loopback/repository';

export class BaseRepository<T>{

  private _repository: Repository<T>;

  constructor(private _dataSource: TypeormDataSource, private _entityClass: ObjectType<T>) {
  }

  private async init() {
    if (this._repository == null) {
      this._repository = await this._dataSource.repository(this._entityClass);
    }
  }

  async getAll(options?: FindManyOptions<T>): Promise<Array<T>> {
    await this.init();
    return this._repository.find(options);
  }

  async getById(id: number): Promise<T> {
    await this.init();
    return this._repository.findOne(id);
  }

  async updateById(id:number, data:object):Promise<UpdateResult>{
    await this.init();
    return this._repository.update(id, data);
  }

  async deleteById(id: number, options?: Options):Promise<DeleteResult> {
    await this.init();
    return  this._repository.delete(id);
  }



}

import { TypeormDataSource } from '../datasources';
import { Repository, ObjectType } from 'typeorm';

export class BaseRepository<T> {

  private _repository: Repository<T>;

  constructor(private _dataSource: TypeormDataSource, private _entityClass: ObjectType<T> ) {
  }

  private async init() {
    if (this._repository == null) {
      this._repository = await this._dataSource.repository(this._entityClass);
    }
  }

  async getAll(): Promise<Array<T>> {
    const entityManager = await this._dataSource.entityManager();
    return entityManager.find(this._entityClass);
  }

  async getById(id : number): Promise<T> {
    await this.init();
    const result = await this._repository.findOne(id);
    return result;
  }

}

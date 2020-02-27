import { BaseRepository } from '../repositories';
import { Where, Command, NamedParameters, PositionalParameters, AnyObject } from '@loopback/repository';
import { FindConditions } from 'typeorm';

export class BaseService<T extends { id: number }, R extends BaseRepository<T, number>> {
  constructor(protected _repository: R) {}

  getAll(): Promise<T[]> {
    return this._repository.find();
  }

  getById(id: number): Promise<T> {
    return this._repository.findById(id);
  }

  save(object: T): Promise<T> {
    return this._repository.save(object);
  }

  delete(object: T): Promise<boolean> {
    return this._repository.deleteById(object.id);
  }

  deleteWhere(findConditions: FindConditions<T>): Promise<boolean> {
    return this._repository.deleteWhere(findConditions);
  }

  count(where?: Where): Promise<number> {
    return this._repository.count(where);
  }

  async execute(command: Command, parameters?: NamedParameters | PositionalParameters): Promise<AnyObject> {
    return this._repository.execute(command, parameters);
  }
}

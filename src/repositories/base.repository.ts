import {TypeORMDataSource} from '../datasources';
import {Repository, ObjectType, OrderByCondition, SelectQueryBuilder} from 'typeorm';
import {Options, Filter, Where, Command, NamedParameters, PositionalParameters, WhereBuilder, AnyObject, } from '@loopback/repository';

/*
 * Some implementation details from https://github.com/raymondfeng/loopback4-extension-repository-typeorm
 */
export class BaseRepository<T, ID> {
  private _repository: Repository<T>;

  constructor(private _dataSource: TypeORMDataSource, private _entityClass: ObjectType<T>) {
  }

  private async init() {
    if (this._repository == null) {
      this._repository = await this._dataSource.repository(this._entityClass);
    }
  }

  async save(entity: T, options?: Options): Promise<T> {
    await this.init();
    const result = this._repository.save(entity);
    return result;
  }

  async find(filter?: Filter, options?: Options): Promise<T[]> {
    await this.init();
    const queryBuilder = await this.buildQuery(filter);
    const result = queryBuilder.getMany();
    return result;
  }

  async findById(id: ID, filter?: Filter, options?: Options): Promise<T> {
    await this.init();
    const result = await this._repository.findOne(id);
    if (result == null) {
      throw new Error('Not found');
    }
    return result;
  }

  async deleteById(id: ID, options?: Options): Promise<boolean> {
    await this.init();

    const whereClause = new WhereBuilder().eq('id', id).build();

    const queryBuilder = await this.buildDelete(whereClause);

    try {
      await queryBuilder.execute();
      return true;

    } catch (error) {
      throw error;
    }
  }

  async updateById(id: ID, data:object): Promise<T> {
    await this.init();

    try {
      await this._repository.update(id, data);
      return this.findById(id);

    } catch (error) {
      throw error;
    }
  }

  async updateAll(data: T, where?: Where, options?: Options): Promise<boolean> {
    await this.init();
    const queryBuilder = await this.buildUpdate(data, where);
    try {
      await queryBuilder.execute();
      return true;

    } catch (error) {
      throw error;
    }
  }

  async deleteAll(where?: Where, options?: Options): Promise<boolean>  {
    await this.init();
    const queryBuilder = await this.buildDelete(where);
    
    try {
      await queryBuilder.execute();
      return true;

    } catch (error) {
      throw error;
    }
  }

  async count(where?: Where, options?: Options): Promise<number> {
    await this.init();
    const result = await this._repository.count(<Partial<T>>where);
    return result;
  }

  async exists(id: ID, options?: Options): Promise<boolean> {
    await this.init();
    const result = await this._repository.findOne(id);
    return result != null;
  }

  async execute(command: Command, parameters: NamedParameters | PositionalParameters, options?: Options): Promise<AnyObject> {
    await this.init();
    const result = await this._repository.query(<string>command, <any[]>parameters);
    return result;
  }

  /**
   * Convert order clauses to OrderByCondition
   * @param order An array of orders
   */
  private buildOrder(order: string[]) {
    let orderBy: OrderByCondition = {};
    for (const o of order) {
      const match = /^([^\s]+)( (ASC|DESC))?$/.exec(o);
      if (!match) continue;
      const field = match[1];
      const dir = (match[3] || 'ASC') as 'ASC' | 'DESC';
      orderBy[match[1]] = dir;
    }
    return orderBy;
  }

  /**
   * Build a TypeORM query from LoopBack Filter
   * @param filter Filter object
   */
  private async buildQuery(filter?: Filter): Promise<SelectQueryBuilder<T>> {
    await this.init();
    const queryBuilder = this._repository.createQueryBuilder();
    if (!filter) return queryBuilder;
    queryBuilder.limit(filter.limit).offset(filter.offset);
    if (filter.fields) {
      queryBuilder.select(Object.keys(filter.fields));
    }
    if (filter.order) {
      queryBuilder.orderBy(this.buildOrder(filter.order));
    }
    if (filter.where) {
      queryBuilder.where(this.buildWhere(filter.where));
    }
    return queryBuilder;
  }

  /**
   * Convert where object into where clause
   * @param where Where object
   */
  private buildWhere(where: any): string {
    const clauses: string[] = [];
    if (where.and) {
      const and = where.and.map((w: any) => `(${this.buildWhere(w)})`).join(' AND ');
      clauses.push(and);
    }
    if (where.or) {
      const or = where.or.map((w: any) => `(${this.buildWhere(w)})`).join(' OR ');
      clauses.push(or);
    }
    // FIXME [rfeng]: Build parameterized clauses
    for (const key in where) {
      let clause;
      if (key === 'and' || key === 'or') continue;
      const condition = where[key];
      if (condition.eq) {
        clause = `${key} = ${condition.eq}`;
      } else if (condition.neq) {
        clause = `${key} != ${condition.neq}`;
      } else if (condition.lt) {
        clause = `${key} < ${condition.lt}`;
      } else if (condition.lte) {
        clause = `${key} <= ${condition.lte}`;
      } else if (condition.gt) {
        clause = `${key} > ${condition.gt}`;
      } else if (condition.gte) {
        clause = `${key} >= ${condition.gte}`;
      } else if (condition.inq) {
        const vals = condition.inq.join(', ');
        clause = `${key} IN (${vals})`;
      } else if (condition.between) {
        const v1 = condition.between[0];
        const v2 = condition.between[1];
        clause = `${key} BETWEEN ${v1} AND ${v2}`;
      } else {
        // Shorthand form: {x:1} => X = 1
        clause = `${key} = ${condition}`;
      }
      clauses.push(clause);
    }
    return clauses.join(' AND ');
  }

  /**
   * Build an `update` statement from LoopBack-style parameters
   * @param dataObject Data object to be updated
   * @param where Where object
   */
  private async buildUpdate(dataObject: T, where?: Where) {
    await this.init();
    let queryBuilder = this._repository
      .createQueryBuilder()
      .update(this._entityClass)
      .set(dataObject);
    if (where) queryBuilder.where(this.buildWhere(where));
    return queryBuilder;
  }

  /**
   * Build a `delete` statement from LoopBack-style parameters
   * @param where Where object
   */
  private async buildDelete(where?: Where) {
    await this.init();
    let queryBuilder = this._repository
      .createQueryBuilder()
      .delete()
      .from(this._entityClass);
    if (where) queryBuilder.where(this.buildWhere(where));
    return queryBuilder;
  }

}

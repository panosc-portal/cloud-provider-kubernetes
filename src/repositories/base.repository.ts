import { TypeORMDataSource } from '../datasources';
import { Repository, ObjectType, OrderByCondition, SelectQueryBuilder } from 'typeorm';
import { Filter, Where, Command, NamedParameters, PositionalParameters, WhereBuilder, AnyObject } from '@loopback/repository';

interface ParamterizedClause {
  clause: string;
  parameters: any;
  isComposite: boolean;
}

export interface QueryOptions {
  leftJoins?: string[];
}

/*
 * Some implementation details from https://github.com/raymondfeng/loopback4-extension-repository-typeorm
 */
export class BaseRepository<T, ID> {
  private _repository: Repository<T>;

  constructor(private _dataSource: TypeORMDataSource, private _entityClass: ObjectType<T>) {}

  async init(): Promise<Repository<T>> {
    if (this._repository == null) {
      this._repository = await this._dataSource.repository(this._entityClass);
    }
    return this._repository;
  }

  async save(entity: T): Promise<T> {
    await this.init();
    const result = this._repository.save(entity);
    return result;
  }

  async find(filter?: Filter, options?: QueryOptions): Promise<T[]> {
    await this.init();
    const entityName = this._entityClass.name.toLowerCase();

    let queryBuilder = await this.buildQuery(entityName, filter);
    if (options != null && options.leftJoins != null) {
      options.leftJoins.forEach((relation: string) => {
        queryBuilder = queryBuilder.leftJoinAndSelect(`${entityName}.${relation}`, relation);
      });
    }

    const result = queryBuilder.getMany();
    return result;
  }

  async findById(id: ID): Promise<T> {
    await this.init();
    const result = await this._repository.findOne(id);
    return result;
  }

  async deleteById(id: ID): Promise<boolean> {
    await this.init();

    const whereClause = new WhereBuilder().eq('id', id).build();

    const queryBuilder = await this.buildDelete(whereClause);

    await queryBuilder.execute();
    return true;
  }

  async updateById(id: ID, data: object): Promise<T> {
    await this.init();

    await this._repository.update(id, data);
    return this.findById(id);
  }

  async updateAll(data: T, where?: Where): Promise<boolean> {
    await this.init();
    const queryBuilder = await this.buildUpdate(data, where);
    await queryBuilder.execute();
    return true;
  }

  async deleteAll(where?: Where): Promise<boolean> {
    await this.init();
    const queryBuilder = await this.buildDelete(where);

    await queryBuilder.execute();
    return true;
  }

  async count(where?: Where): Promise<number> {
    await this.init();
    const result = await this._repository.count(<Partial<T>>where);
    return result;
  }

  async exists(id: ID): Promise<boolean> {
    await this.init();
    const result = await this._repository.findOne(id);
    return result != null;
  }

  async execute(command: Command, parameters: NamedParameters | PositionalParameters): Promise<AnyObject> {
    await this.init();
    const result = await this._repository.query(<string>command, <any[]>parameters);
    return result;
  }

  /**
   * Convert order clauses to OrderByCondition
   * @param order An array of orders
   */
  buildOrder(order: string[]) {
    const orderBy: OrderByCondition = {};
    for (const o of order) {
      const match = /^([^\s]+)( (ASC|DESC))?$/.exec(o);
      if (!match) continue;
      const dir = (match[3] || 'ASC') as 'ASC' | 'DESC';
      orderBy[match[1]] = dir;
    }
    return orderBy;
  }

  /**
   * Build a TypeORM query from LoopBack Filter
   * @param filter Filter object
   */
  async buildQuery(name: string, filter?: Filter): Promise<SelectQueryBuilder<T>> {
    await this.init();
    const queryBuilder = this._repository.createQueryBuilder(name);
    if (!filter) return queryBuilder;
    queryBuilder.limit(filter.limit).offset(filter.offset);
    if (filter.fields) {
      queryBuilder.select(Object.keys(filter.fields));
    }
    if (filter.order) {
      queryBuilder.orderBy(this.buildOrder(filter.order));
    }
    if (filter.where) {
      const whereClause = this.buildWhere(filter.where);
      queryBuilder.where(whereClause.clause, whereClause.parameters);
    }
    return queryBuilder;
  }

  /**
   * Convert where object into where clause
   * @param where Where object
   */
  buildWhere(where: any, parameters?: any): ParamterizedClause {
    function getNextParameterName(params: any): string {
      const index = Object.keys(params).length + 1;
      return `p${index}`;
    }

    const clauses: string[] = [];
    parameters = parameters || {};

    if (where.and) {
      const andClauses = where.and.map((w: any) => this.buildWhere(w, parameters));
      const and = andClauses.map((pc: ParamterizedClause) => pc.clause).join(' AND ');
      clauses.push(and);
      andClauses.forEach((pc: ParamterizedClause) => {
        Object.assign(parameters, pc.parameters);
      });
    }
    if (where.or) {
      const orClauses = where.or.map((w: any) => this.buildWhere(w, parameters));
      const or = orClauses
        .map((pc: ParamterizedClause) => (pc.isComposite ? `(${pc.clause})` : pc.clause))
        .join(' OR ');
      clauses.push(`(${or})`);
      orClauses.forEach((pc: ParamterizedClause) => {
        Object.assign(parameters, pc.parameters);
      });
    }

    for (const key in where) {
      if (key === 'and' || key === 'or') continue;

      let clause;
      const condition = where[key];
      if (condition.eq) {
        const parameterName = getNextParameterName(parameters);
        parameters[parameterName] = condition.eq;
        clause = `${key} = :${parameterName}`;
      } else if (condition.neq) {
        const parameterName = getNextParameterName(parameters);
        parameters[parameterName] = condition.neq;
        clause = `${key} != :${parameterName}`;
      } else if (condition.lt) {
        const parameterName = getNextParameterName(parameters);
        parameters[parameterName] = condition.lt;
        clause = `${key} < :${parameterName}`;
      } else if (condition.lte) {
        const parameterName = getNextParameterName(parameters);
        parameters[parameterName] = condition.lte;
        clause = `${key} <= :${parameterName}`;
      } else if (condition.gt) {
        const parameterName = getNextParameterName(parameters);
        parameters[parameterName] = condition.gt;
        clause = `${key} > :${parameterName}`;
      } else if (condition.gte) {
        const parameterName = getNextParameterName(parameters);
        parameters[parameterName] = condition.gte;
        clause = `${key} >= :${parameterName}`;
      } else if (condition.inq) {
        let vals = '';
        for (let i = 0; i < condition.inq.length; i++) {
          const parameterValue = condition.inq[i];
          const parameterName = getNextParameterName(parameters);
          parameters[parameterName] = parameterValue;

          vals += i > 0 ? `, :${parameterName}` : `:${parameterName}`;
        }

        clause = `${key} IN (${vals})`;
      } else if (condition.nin) {
        let vals = '';
        for (let i = 0; i < condition.nin.length; i++) {
          const parameterValue = condition.nin[i];
          const parameterName = getNextParameterName(parameters);
          parameters[parameterName] = parameterValue;

          vals += i > 0 ? `, :${parameterName}` : `:${parameterName}`;
        }

        clause = `${key} NOT IN (${vals})`;
      } else if (condition.between) {
        const p1Name = getNextParameterName(parameters);
        parameters[p1Name] = condition.between[0];
        const p2Name = getNextParameterName(parameters);
        parameters[p2Name] = condition.between[1];
        clause = `${key} BETWEEN :${p1Name} AND :${p2Name}`;
      } else {
        // Shorthand form: {x:1} => X = 1
        const parameterName = getNextParameterName(parameters);
        parameters[parameterName] = condition;
        clause = `${key} = :${parameterName}`;
      }
      clauses.push(clause);
    }
    return {
      clause: clauses.join(' AND '),
      parameters: parameters,
      isComposite: where.and != null || where.or != null || clauses.length > 1
    };
  }

  /**
   * Build an `update` statement from LoopBack-style parameters
   * @param dataObject Data object to be updated
   * @param where Where object
   */
  async buildUpdate(dataObject: T, where?: Where) {
    await this.init();
    const queryBuilder = this._repository
      .createQueryBuilder()
      .update(this._entityClass)
      .set(dataObject);

    if (where) {
      const whereClause = this.buildWhere(where);
      queryBuilder.where(whereClause.clause, whereClause.parameters);
    }
    return queryBuilder;
  }

  /**
   * Build a `delete` statement from LoopBack-style parameters
   * @param where Where object
   */
  async buildDelete(where?: Where) {
    await this.init();
    const queryBuilder = this._repository
      .createQueryBuilder()
      .delete()
      .from(this._entityClass);

    if (where) {
      const whereClause = this.buildWhere(where);
      queryBuilder.where(whereClause.clause, whereClause.parameters);
    }
    return queryBuilder;
  }
}

import { TypeORMDataSource } from '../datasources';
import { Repository, ObjectType, OrderByCondition, SelectQueryBuilder, FindManyOptions, FindConditions } from 'typeorm';
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
  protected _repository: Repository<T>;

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

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    await this.init();

    const result = await this._repository.find(options);
    return result;
  }

  async findById(id: ID): Promise<T> {
    await this.init();
    const result = await this._repository.findOne(id);
    return result;
  }

  async deleteById(id: ID): Promise<boolean> {
    await this.init();

    await this._repository.delete(id);
    return true;
  }

  async deleteWhere(findConditions: FindConditions<T>): Promise<boolean> {
    await this.init();

    await this._repository.delete(findConditions);
    return true;
  }

  async updateById(id: ID, data: object): Promise<T> {
    await this.init();

    await this._repository.update(id, data);
    return this.findById(id);
  }

  async count(where?: Where): Promise<number> {
    await this.init();

    const whereClause = this.buildWhere(where);
    const queryBuilder = this._repository.createQueryBuilder();
    queryBuilder.where(whereClause.clause, whereClause.parameters);

    const result = queryBuilder.getCount();
    return result;
  }

  async exists(id: ID): Promise<boolean> {
    await this.init();
    const result = await this._repository.findOne(id);
    return result != null;
  }

  async execute(command: Command, parameters?: NamedParameters | PositionalParameters): Promise<AnyObject> {
    await this.init();
    const result = await this._repository.query(<string>command, <any[]>parameters);
    return result;
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

    if (where) {
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
    }

    return {
      clause: clauses.join(' AND '),
      parameters: parameters,
      isComposite: where ? where.and != null || where.or != null || clauses.length > 1 : false
    };
  }

}

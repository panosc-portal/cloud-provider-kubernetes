import {DefaultCrudRepository} from '@loopback/repository';
import {InstanceService, InstanceServiceRelations} from '../models';
import {PostgresDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class InstanceServiceRepository extends DefaultCrudRepository<
  InstanceService,
  typeof InstanceService.prototype.id,
  InstanceServiceRelations
> {
  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
  ) {
    super(InstanceService, dataSource);
  }
}

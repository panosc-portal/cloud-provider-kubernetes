import {
  DefaultCrudRepository,
  BelongsToAccessor,
  repository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {Instance, InstanceRelations, Image, Flavour, InstanceService} from '../models';
import {PostgresDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {InstanceServiceRepository} from './instance-service.repository';
import {FlavourRepository} from './flavour.repository';
import {ImageRepository} from './image.repository';
import { DataSource } from 'loopback-datasource-juggler';

export class InstanceRepository extends DefaultCrudRepository<Instance,
  typeof Instance.prototype.id,
  InstanceRelations> {

  public readonly instanceServices: HasManyRepositoryFactory<InstanceService, typeof Instance.prototype.id>;

  public readonly flavour: BelongsToAccessor<Flavour, typeof Instance.prototype.id>;

  constructor(
    @inject('datasources.postgres') dataSource: DataSource, @repository.getter('InstanceServiceRepository') protected instanceServiceRepositoryGetter: Getter<InstanceServiceRepository>, @repository.getter('FlavourRepository') protected flavourRepositoryGetter: Getter<FlavourRepository>) {
    super(Instance, dataSource);
    this.flavour = this.createBelongsToAccessorFor('flavour_id', flavourRepositoryGetter,);
    this.registerInclusionResolver('flavour', this.flavour.inclusionResolver);
    this.instanceServices = this.createHasManyRepositoryFactoryFor('instanceServices', instanceServiceRepositoryGetter,);
    this.registerInclusionResolver('instanceServices', this.instanceServices.inclusionResolver);
  }

  getAll() {
    return this.find({include:[{relation:'instanceServices'},{relation:'flavour'}]});
  }

  getById(id: number) {
    return this.findById(id);
  }



}
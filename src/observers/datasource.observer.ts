import {
  lifeCycleObserver,
  inject,
  CoreBindings,
  LifeCycleObserver,
} from '@loopback/core';
import { CloudProviderKubernetesApplication } from '..';
import { TypeORMDataSource } from '../datasources';

@lifeCycleObserver('datasource')
export class DatasourceObserver implements LifeCycleObserver {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app: CloudProviderKubernetesApplication) {
  }

  async start(): Promise<void> {
    console.log('Initialising datasource.');

    const datasource: TypeORMDataSource = await this.app.get('datasources.typeorm');
    await datasource.connection();
    console.log('Datasource initialised.');
  }

  async stop(): Promise<void> {
  }
}

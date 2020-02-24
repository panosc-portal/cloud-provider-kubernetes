import { bind, BindingScope, inject } from '@loopback/core';
import { Health } from '../models/enumerations';
import { TypeORMDataSource, KubernetesDataSource } from '../datasources';

@bind({ scope: BindingScope.SINGLETON })
export class HealthService {
  constructor(
    @inject('datasources.typeorm') private _dbDataSource: TypeORMDataSource,
    @inject('datasources.kubernetes') private _k8sDataSource: KubernetesDataSource
  ) {}

  async getHealth(): Promise<Health> {
    const dbConnection = await this._dbDataSource.connection();
    const dbConnected = dbConnection.isConnected;

    const k8sConnected = this._k8sDataSource.isConnected();

    if (dbConnected && k8sConnected) {
      return Health.UP;
    } else {
      return Health.DOWN;
    }
  }
}

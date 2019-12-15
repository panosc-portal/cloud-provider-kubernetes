import { Connection, createConnection, EntityManager, ObjectType, Repository } from 'typeorm';
import { lifeCycleObserver, LifeCycleObserver, inject, CoreBindings } from '@loopback/core';
import { logger } from '../utils';
import { CloudProviderKubernetesApplication } from '..';
import { timeout } from 'cron';

@lifeCycleObserver('datasource')
export class TypeORMDataSource implements LifeCycleObserver {
  static dataSourceName = 'typeorm';

  private _config: any;
  private _connection: Connection;
  private _connectionPromise: Promise<Connection>;

  constructor(/*@inject(CoreBindings.APPLICATION_INSTANCE) private application?: CloudProviderKubernetesApplication*/) {
    this._config = {
      type: process.env.CLOUD_PROVIDER_K8S_DATABASE_TYPE,
      host: process.env.CLOUD_PROVIDER_K8S_DATABASE_HOST,
      port: process.env.CLOUD_PROVIDER_K8S_DATABASE_PORT,
      username: process.env.CLOUD_PROVIDER_K8S_DATABASE_USERNAME,
      password: process.env.CLOUD_PROVIDER_K8S_DATABASE_PASSWORD,
      database: process.env.CLOUD_PROVIDER_K8S_DATABASE_NAME,
      schema: process.env.CLOUD_PROVIDER_K8S_DATABASE_SCHEMA,
      entities: ['dist/models/*.js'],
      synchronize: process.env.CLOUD_PROVIDER_K8S_DATABASE_SYNCHRONIZE === 'true',
      logging: process.env.CLOUD_PROVIDER_K8S_DATABASE_LOGGING === 'true'
    };
  }

  /**
   * Start the datasource when application is started
   */
  async start(): Promise<void> {
    logger.info('Initialising database connection');
    await this.connection();
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  async stop(): Promise<void> {
    if (this._connection) {
      logger.info('Closing database connection');
      await this._connection.close();
      this._connection = null;
    }
  }

  mergeConfig(config: any) {
    Object.keys(config).forEach(key => {
      this._config[key] = config[key];
    });
  }

  async connection(): Promise<Connection> {
    try {
      let connection = this._connection;
      if (connection == null && this._connectionPromise == null) {
        this._connectionPromise = createConnection(this._config);
        connection = this._connection = await this._connectionPromise;

      } else if (connection == null && this._connectionPromise != null) {
        connection = await this._connectionPromise;
      }

      return connection;
    } catch (error) {
      logger.error(error.message);
      process.exit();
    }
  }

  async entityManager(): Promise<EntityManager> {
    const connection = await this.connection();
    return connection.manager;
  }

  async repository<T>(entityClass: ObjectType<T>): Promise<Repository<T>> {
    const connection = await this.connection();
    return connection.getRepository(entityClass);
  }
}

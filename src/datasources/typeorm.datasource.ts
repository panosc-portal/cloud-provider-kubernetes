import { Connection, createConnection, EntityManager, ObjectType, Repository } from 'typeorm';
import { lifeCycleObserver, LifeCycleObserver, inject, CoreBindings } from '@loopback/core';
import { logger } from '../utils';
import { CloudProviderKubernetesApplication } from '..';
import { timeout } from 'cron';
import { APPLICATION_CONFIG } from '../application-config';

@lifeCycleObserver('datasource')
export class TypeORMDataSource implements LifeCycleObserver {
  static dataSourceName = 'typeorm';

  private _config: any;
  private _connection: Connection;
  private _connectionPromise: Promise<Connection>;

  constructor(/*@inject(CoreBindings.APPLICATION_INSTANCE) private application?: CloudProviderKubernetesApplication*/) {
    this._config = {
      type: APPLICATION_CONFIG().database.type,
      host: APPLICATION_CONFIG().database.host,
      port: APPLICATION_CONFIG().database.port,
      username: APPLICATION_CONFIG().database.userName,
      password: APPLICATION_CONFIG().database.password,
      database: APPLICATION_CONFIG().database.name,
      schema: APPLICATION_CONFIG().database.schema,
      entities: ['dist/models/*.js'],
      synchronize: APPLICATION_CONFIG().database.synchronize,
      logging: APPLICATION_CONFIG().database.logging
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

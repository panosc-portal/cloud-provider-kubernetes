import { Connection, createConnection, EntityManager, ObjectType, Repository } from "typeorm";
import { lifeCycleObserver, LifeCycleObserver } from "@loopback/core";

@lifeCycleObserver('datasource')
export class TypeORMDataSource implements LifeCycleObserver {
  static dataSourceName = 'typeorm';

  private _config: any;
  private _connection: Connection;

  constructor() {
    this._config = {
      type: process.env.CLOUD_PROVIDER_K8S_DATABASE_TYPE,
      host: process.env.CLOUD_PROVIDER_K8S_DATABASE_HOST,
      port: process.env.CLOUD_PROVIDER_K8S_DATABASE_PORT,
      username: process.env.CLOUD_PROVIDER_K8S_DATABASE_USERNAME,
      password: process.env.CLOUD_PROVIDER_K8S_DATABASE_PASSWORD,
      database: process.env.CLOUD_PROVIDER_K8S_DATABASE_NAME,
      schema: process.env.CLOUD_PROVIDER_K8S_DATABASE_SCHEMA,
      entities: [
          "dist/models/*.js"
      ],
      synchronize: (process.env.CLOUD_PROVIDER_K8S_DATABASE_SYNCHRONIZE === "true"),
      logging: (process.env.CLOUD_PROVIDER_K8S_DATABASE_LOGGING === "true")
    };
  }


  /**
   * Start the datasource when application is started
   */
  async start(): Promise<void> {
    console.log('Initialising datasource.');
    await this.connection();
    console.log('Datasource initialised.');
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  async stop(): Promise<void> {
    if (this._connection) {
      this._connection.close();
      this._connection = null;
    }
  }

  mergeConfig(config: any) {
    Object.keys(config).forEach(key => {
      this._config[key] = config[key];
    })
  }

  async connection(): Promise<Connection> {
    try {
      if (this._connection == null) {
        const connection = await createConnection(this._config);
        this._connection = connection;
      }

      return this._connection;

    } catch (error) {
      console.error(error);
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
import { Connection, createConnection, EntityManager, ObjectType, Repository } from "typeorm";

export class TypeormDataSource {
  static dataSourceName = 'typeorm';

  private _config: any;
  private _connection: Connection;

  constructor() {
    this._config = {
      type: process.env.CLOUD_PROVIDER_K8S_DATABASE_TYPE,
      host: process.env.CLOUD_PROVIDER_K8S_DATABASE_HOST,
      port: process.env.CLOUD_PROVIDER_K8S_DATABASE_PORT,
      username: process.env.CLOUD_PROVIDER_K8S_DATABASE_USERNAME,
      password: process.env.CLOUD_PROVIDER_K8S_DATABASE_NAME,
      database: process.env.CLOUD_PROVIDER_K8S_DATABASE_DATABASE,
      schema: process.env.CLOUD_PROVIDER_K8S_DATABASE_SCHEMA,
      entities: [
          // __dirname + "models/*.js"
          "dist/models/*.js"
      ],
      synchronize: false,
      logging: (process.env.CLOUD_PROVIDER_K8S_DATABASE_LOGGING == "true")
    };
  }

  setConfig(config: any) {
    Object.keys(config).forEach(key => {
      this._config[key] = config[key];
    })
  }

  private async connection(): Promise<Connection> {
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

import { Connection, createConnection, EntityManager, ObjectType, Repository } from "typeorm";
import { resolve } from "dns";

export class TypeormDataSource {
  static dataSourceName = 'typeorm';

  private _config: any;
  private _connection: Connection;

  constructor() {
    this._config = {
      type: "postgres",
      host: process.env.CLOUD_PROVIDER_K8S_POSTGRES_HOST,
      port: process.env.CLOUD_PROVIDER_K8S_POSTGRES_PORT,
      username: process.env.CLOUD_PROVIDER_K8S_POSTGRES_USERNAME,
      password: process.env.CLOUD_PROVIDER_K8S_POSTGRES_PASSWORD,
      database: process.env.CLOUD_PROVIDER_K8S_POSTGRES_DATABASE,
      schema: process.env.CLOUD_PROVIDER_K8S_POSTGRES_SCHEMA,
      entities: [
          // __dirname + "models/*.js"
          "dist/models/*.js"
      ],
      synchronize: false,
      logging: (process.env.CLOUD_PROVIDER_K8S_POSTGRES_LOGGING == "true")
    };
  }

  private connection(): Promise<Connection> {
    return new Promise((resolve) => {
      if (this._connection != null) {
        resolve(this._connection);

      } else {
        createConnection(this._config)
          .then(connection => {
            this._connection = connection;

            resolve(this._connection);
          })
          .catch(error => {
            console.error(error);
            process.exit();
          })
      }
    });
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

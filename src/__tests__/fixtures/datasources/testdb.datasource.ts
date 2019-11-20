import {juggler} from '@loopback/repository';
import { TypeORMDataSource } from '../../../datasources';

export const testDataSource = setupDataSource();

export function setupDataSource(): TypeORMDataSource {

  const dataSource = new TypeORMDataSource();
  dataSource.mergeConfig({
    type: "sqlite",
    name: "memory",
    database: ":memory:",
    synchronize: true,
    logging: false
  });

  return dataSource;
}
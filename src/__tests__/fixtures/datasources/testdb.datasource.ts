import {juggler} from '@loopback/repository';
import { TypeormDataSource } from '../../../datasources';

export const testDataSource = setupDataSource();

export function setupDataSource(): TypeormDataSource {

  const dataSource = new TypeormDataSource();
  dataSource.setConfig({
    type: "sqlite",
    name: "memory",
    database: ":memory:",
    synchronize: true
  });

  return dataSource;
}
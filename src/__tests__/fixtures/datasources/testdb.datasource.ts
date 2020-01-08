import { TypeORMDataSource } from '../../../datasources';

export const testDataSource = setupDataSource();

export function setupDataSource(): TypeORMDataSource {
  const dataSource = new TypeORMDataSource();

  return dataSource;
}

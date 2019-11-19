import {juggler} from '@loopback/repository';

export const testDataSource: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});

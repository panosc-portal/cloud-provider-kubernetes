import {FlavourRepository, ImageRepository, InstanceRepository, ProtocolRepository } from '../../repositories';
import {testDataSource} from '../fixtures/datasources/testdb.datasource';
import * as fs from 'fs';
import { TypeORMDataSource } from '../../datasources';
import { logger } from '../../utils';

async function emptyDatabase(datasource: TypeORMDataSource) {
  await new ProtocolRepository(datasource).deleteAll();
  await new InstanceRepository(datasource).deleteAll();
  await new FlavourRepository(datasource).deleteAll();
  await new ImageRepository(datasource).deleteAll();
}

export function givenInitialisedTestDatabase() {
  return givenInitialisedDatabase(testDataSource);
}

export async function givenInitialisedDatabase(datasource: TypeORMDataSource) {
  await emptyDatabase(datasource);

  const entityManager = await datasource.entityManager();

  const fixtures = fs.readFileSync('./resources/__tests__/fixtures.sql', 'utf8');
  const sqlQueries = fixtures.replace(/(\r\n|\n|\r)/gm, "").split(';').filter(query => query.length > 0).map(query => query + ';');
  for (let i = 0; i < sqlQueries.length; i++) {
    const sqlQuery = sqlQueries[i];
    try {
      logger.debug(`Executing fixtures SQL query : ${sqlQuery}`);
      await entityManager.query(sqlQuery);

    } catch (error) {
        logger.error(error);
    }
  }
}
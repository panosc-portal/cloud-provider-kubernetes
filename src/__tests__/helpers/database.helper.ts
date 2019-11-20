import {FlavourRepository, ImageRepository, InstanceRepository } from '../../repositories';
import {testDataSource} from '../fixtures/datasources/testdb.datasource';
import * as fs from 'fs';

export async function emptyDatabase() {
  await new FlavourRepository(testDataSource).deleteAll();
  await new ImageRepository(testDataSource).deleteAll();
  await new InstanceRepository(testDataSource).deleteAll();
}

export async function givenInitialisedDatabase() {
  await emptyDatabase();

  const entityManager = await testDataSource.entityManager();

  const fixtures = fs.readFileSync('./resources/__tests__/fixtures.sql', 'utf8');
  const sqlQueries = fixtures.replace(/(\r\n|\n|\r)/gm, "").split(';').filter(query => query.length > 0).map(query => query + ';');
  for (let i = 0; i < sqlQueries.length; i++) {
    const sqlQuery = sqlQueries[i];
    try {
      await entityManager.query(sqlQuery);

    } catch (error) {
        console.error(error);
    }
  }
}
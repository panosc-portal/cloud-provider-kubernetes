import {FlavourRepository, ImageRepository, InstanceRepository } from '../../repositories';
import {testDataSource} from '../fixtures/datasources/testdb.datasource';
import * as fs from 'fs';

export async function givenEmptyDatabase() {
  await new FlavourRepository(testDataSource).deleteAll();
  await new ImageRepository(testDataSource).deleteAll();
//   await new InstanceRepository(testDataSource).deleteAll();
}

export async function buildDataBase() {
    const creationScript = fs.readFileSync('./resources/databaseCreation.sql', 'utf8');

    const connector = testDataSource.connector;
    if (connector != null) {
        // try {
        //     await connector.execute(creationScript);
        // } catch (error) {
        //     console.error(error);
        // }
    }


}
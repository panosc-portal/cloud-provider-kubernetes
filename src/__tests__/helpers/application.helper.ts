import { CloudProviderKubernetesApplication } from '../..';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { TypeORMDataSource } from '../../datasources';
import { KubernetesMockServer } from '../kubernetesMock/KubernetesMockServer';
import { createBindingFromClass } from '@loopback/core';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new CloudProviderKubernetesApplication({
    rest: restConfig,
    ignoreDotenv: true
  });

  app.add(createBindingFromClass(KubernetesMockServer));

  await app.boot();
  await app.start();
  const datasource: TypeORMDataSource = await app.get('datasources.typeorm');

  const client = createRestAppClient(app);

  return { app, client, datasource };
}

export interface AppWithClient {
  app: CloudProviderKubernetesApplication;
  client: Client;
  datasource: TypeORMDataSource;
}

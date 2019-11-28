import { CloudProviderKubernetesApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
import { logger } from './utils';

export { CloudProviderKubernetesApplication };

export async function main(options: ApplicationConfig = {}) {
  const app = new CloudProviderKubernetesApplication(options);
  await app.boot();

  await app.start();

  const url = app.restServer.url;
  logger.info(`Server is running at ${url}`);

  return app;
}

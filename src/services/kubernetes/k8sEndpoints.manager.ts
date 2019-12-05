import { logger } from '../../utils';
import { KubernetesDataSource } from '../../datasources';

export class K8sEndpointsManager {
  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getServiceEndpoints(name: string, namespace) {
    try {
      const serviceEndpoint = await this._dataSource.K8sClient.api.v1
        .namespaces(namespace)
        .endpoint(name).get();
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to get service endpoints ${name} `);
      }
    }
  }
}
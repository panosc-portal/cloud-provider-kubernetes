import { K8sService, K8sServiceRequest } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';

export class K8sServiceManager {
  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getWithComputeId(computeId: string, namespace: string) {
    try {
      const service = await this._dataSource.K8sClient.api.v1
        .namespaces(namespace)
        .services(computeId)
        .get();
      const serviceEndpoint = await this._dataSource.K8sClient.api.v1
        .namespaces(namespace)
        .endpoint(computeId).get();
      const k8sService = new K8sService(service.body, serviceEndpoint.body);
      if (k8sService.isValid()) {
        return k8sService;
      } else {
        return null;
      }
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to get service ${computeId} `);
      }
    }
  }


  async create(serviceRequest: K8sServiceRequest, namespace: string): Promise<K8sService> {
    try {
      const service = await this._dataSource.K8sClient.api.v1
        .namespace(namespace)
        .services.post({ body: serviceRequest.model });
      const serviceEndpoint = await this._dataSource.K8sClient.api.v1
        .namespaces(namespace)
        .endpoint(serviceRequest.name).get();
      const newService = new K8sService(service.body, serviceEndpoint.body);
      if (newService.isValid()) {
        logger.debug(`Service  ${newService.name}  has been created`);
        return newService;
      } else {
        logger.error('Did not manage to create a kubernetes service');
      }
    } catch (error) {
      if (error.statusCode === 409) {
        return null;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to create service ${serviceRequest.name}`);
      }
    }
  }

  async createIfNotExist(serviceRequest: K8sServiceRequest, namespace: string): Promise<K8sService> {
    const serviceName = serviceRequest.name;
    const existingService = await this.getWithComputeId(serviceName, namespace);
    if (existingService == null) {
      return this.create(serviceRequest, namespace);
    } else {
      return existingService;
    }
  }

  async deleteWithComputeId(computeId: string, namespace: string): Promise<boolean> {
    try {
      await this._dataSource.K8sClient.api.v1
        .namespaces(namespace)
        .services(computeId)
        .delete();
      logger.debug(`Service  ${computeId} has been deleted`);
      return true;

    } catch (error) {
      if (error.statusCode === 404) {
        return false;

      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to delete service ${computeId} `);
      }
    }
  }
}

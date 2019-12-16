import { K8sService, K8sServiceRequest } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';

export class K8sServiceManager {
  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getWithComputeId(computeId: string, namespace: string): Promise<K8sService> {
    try {
      logger.debug(`Getting kubernetes service '${computeId}' in namespace '${namespace}'`);
      const service = await this._dataSource.K8sClient.api.v1.namespaces(namespace).services(computeId).get();
      const serviceEndpoint = await this.getEndpointsWithComputeId(computeId, namespace);
      const k8sService = new K8sService(computeId, service.body, serviceEndpoint.body);

      if (k8sService.isValid()) {
        logger.debug(`Got kubernetes service '${computeId}' in namespace '${namespace}'`);
        return k8sService;

      } else {
        logger.error(`Kubernetes service with compute Id '${computeId}' is not valid`);
        throw new Error(`Kubernetes service with compute Id '${computeId}' is not valid`);
      }

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes service '${computeId}' in namespace '${namespace}' does not exist`);
        return null;

      } else {
        logger.error(`Failed to get kubernetes service with compute Id '${computeId}': ${error.message}`);
        throw new Error(`Failed to get kubernetes service with compute Id '${computeId}': ${error.message}`);
      }
    }
  }

  async getEndpointsWithComputeId(computeId: string, namespace: string): Promise<any> {
    try {
      logger.debug(`Getting kubernetes service endpoints '${computeId}' in namespace '${namespace}'`);
      const serviceEndpoint = await this._dataSource.K8sClient.api.v1.namespaces(namespace).endpoint(computeId).get();

      logger.debug(`Got kubernetes service endpoints '${computeId}' in namespace '${namespace}'`);

      return serviceEndpoint;

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes service endpoints '${computeId}' in namespace '${namespace}' does not exist`);
        return null;

      } else {
        logger.error(`Failed to get kubernetes service endpoints with compute Id '${computeId}': ${error.message}`);
        throw new Error(`Failed to get kubernetes service endpoints with compute Id '${computeId}': ${error.message}`);
      }
    }
  }

  async create(serviceRequest: K8sServiceRequest, namespace: string): Promise<K8sService> {
    try {
      logger.debug(`Creating kubernetes service '${serviceRequest.name}' in namespace '${namespace}'`);
      const service = await this._dataSource.K8sClient.api.v1.namespace(namespace).services.post({ body: serviceRequest.model });
      const serviceEndpoint = await this.getEndpointsWithComputeId(serviceRequest.name, namespace);

      if (service.body == null || serviceEndpoint.body == null) {
        logger.error(`Failed to create k8s deployment with compute Id ${serviceRequest.name} because service body or serviceEndpoint body is null`);
        throw new Error(`Failed to create k8s deployment with compute Id ${serviceRequest.name} because service body or serviceEndpoint body is null`);
      } else {
        const newService = new K8sService(serviceRequest.name, service.body, serviceEndpoint.body);

        if (newService.isValid()) {
          logger.debug(`Service '${newService.name}' in namespace '${namespace}' has been created`);
          return newService;

        } else {
          logger.error(`Kubernetes service with compute Id '${serviceRequest.name}' is not valid`);
          throw new Error(`Kubernetes service with compute Id '${serviceRequest.name}' is not valid`);
        }
      }
    } catch (error) {
      logger.error(`Failed to create k8s service with compute Id '${serviceRequest.name}': ${error.message}`);
      throw new Error(`Failed to create k8s service with compute Id '${serviceRequest.name}': ${error.message}`);
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
      logger.debug(`Deleting kubernetes service '${computeId}' from namespace '${namespace}'`);
      await this._dataSource.K8sClient.api.v1.namespaces(namespace).services(computeId).delete();
      logger.debug(`Service '${computeId}' has been deleted`);
      return true;

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Service '${computeId}' does not exist so not deleting`);

      } else {
        logger.error(`Error deleting service '${computeId}': ${error.message}`);
      }
      return false;
    }
  }
}

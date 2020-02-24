import { K8sService, K8sServiceRequest, Instance } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger, LoggedError } from '../../utils';
import { APPLICATION_CONFIG } from '../../application-config';

export class K8sServiceManager {
  constructor(private _dataSource: KubernetesDataSource) {}

  async getWithComputeId(computeId: string, namespace: string): Promise<K8sService> {
    try {
      logger.debug(`Getting kubernetes service '${computeId}' in namespace '${namespace}'`);
      const service = await this._dataSource.getService(computeId, namespace);
      const serviceEndpoint = await this.getEndpointsWithComputeId(computeId, namespace);
      const k8sService = new K8sService(computeId, service, serviceEndpoint);

      if (k8sService.isValid()) {
        logger.debug(`Got kubernetes service '${computeId}' in namespace '${namespace}'`);
        return k8sService;
      } else {
        throw new LoggedError(`Kubernetes service with compute Id '${computeId}' is not valid`);
      }
    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes service '${computeId}' in namespace '${namespace}' does not exist`);
        return null;
      } else {
        throw new LoggedError(`Failed to get kubernetes service with compute Id '${computeId}': ${error.message}`);
      }
    }
  }

  async getEndpointsWithComputeId(computeId: string, namespace: string): Promise<any> {
    try {
      logger.debug(`Getting kubernetes service endpoints '${computeId}' in namespace '${namespace}'`);
      const serviceEndpoint = await this._dataSource.getEndpoints(computeId, namespace);

      logger.debug(`Got kubernetes service endpoints '${computeId}' in namespace '${namespace}'`);

      return serviceEndpoint;
    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes service endpoints '${computeId}' in namespace '${namespace}' does not exist`);
        return null;
      } else {
        throw new LoggedError(
          `Failed to get kubernetes service endpoints with compute Id '${computeId}': ${error.message}`
        );
      }
    }
  }

  async create(instance: Instance, computeId: string, namespace: string): Promise<K8sService> {
    try {
      const serviceRequest = new K8sServiceRequest({ name: computeId, image: instance.image });

      logger.debug(
        `Creating kubernetes service for instance '${instance.id}' (${instance.name}) with computeId '${serviceRequest.name}' in namespace '${namespace}'`
      );
      const service = await this._dataSource.createService(serviceRequest, namespace);

      const serviceEndpoint = await this.getEndpointsWithComputeId(serviceRequest.name, namespace);

      const newService = new K8sService(serviceRequest.name, service, serviceEndpoint);

      if (newService.isValid()) {
        logger.debug(
          `Kubernetes service for instance '${instance.id}' ('${instance.name}') with computeId '${computeId}' created successfully`
        );
        return newService;
      } else {
        throw new LoggedError(
          `Kubernetes service for instance '${instance.id}' (${instance.name}) with compute Id '${computeId}' is not valid`
        );
      }
    } catch (error) {
      throw new LoggedError(
        `Failed to create k8s service for instance '${instance.id}' (${instance.name}) with compute Id '${computeId}': ${error.message}`
      );
    }
  }

  async deleteWithComputeId(computeId: string, namespace: string): Promise<boolean> {
    try {
      logger.debug(`Deleting kubernetes service '${computeId}' from namespace '${namespace}'`);
      await this._dataSource.deleteService(computeId, namespace);
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

  async cleanup(validInstances: { namespace: string; computeId: string }[]): Promise<number> {
    try {
      const servicesResponse = await this._dataSource.getAllServicesWithLabelSelector(
        `owner=${APPLICATION_CONFIG().kubernetes.ownerLabel}`
      );
      const services = servicesResponse.map((service: any) => ({
        name: service.metadata.name,
        namespace: service.metadata.namespace
      }));

      const invalidServices = services.filter(service => {
        return (
          validInstances.find(
            instance => instance.computeId === service.name && instance.namespace === service.namespace
          ) == null
        );
      });

      // Delete invalid services
      if (invalidServices.length > 0) {
        logger.debug(`Cleaning k8s services: deleting ${invalidServices.length}`);
        const results = await Promise.all(
          invalidServices.map(service => {
            return this.deleteWithComputeId(service.name, service.namespace);
          })
        );
        const deletedCount = results.filter(result => result === true).length;
        logger.debug(`Cleaned k8s services: deleted ${deletedCount}`);

        return deletedCount;
      }
    } catch (error) {
      logger.error(`Error caught while cleaning k8s services: ${error.message}`);
    }

    return 0;
  }
}

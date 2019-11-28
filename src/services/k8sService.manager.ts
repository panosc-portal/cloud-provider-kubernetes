import {K8sService, K8sServiceRequest} from '../models';
import {KubernetesDataSource} from '../datasources';
import { logger } from '../utils';


export class K8sServiceManager {

  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getServiceWithName(name: string, namespace: string) {
    try {
      const service = await this._dataSource.K8sClient.api.v1.namespaces(namespace)
        .services(name)
        .get();
      const k8sService = new K8sService(service.body);
      if (k8sService.isValid()) {
        return k8sService;
      } else {
        return null;
      }
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      } else {
        throw error;
      }
    }
  }

  async createService(serviceRequest: K8sServiceRequest, namespace: string): Promise<K8sService> {
    const service = await this._dataSource.K8sClient.api.v1.namespace(namespace).services.post({body: serviceRequest.model});
    const newService = new K8sService(service.body);
    if (newService.isValid()) {
      logger.debug('Service ', newService.name, ' has been created');
      return newService;
    } else {
      throw new Error('Did not manage to create a kubernetes service');
    }
  }

  async createServiceIfNotExist(serviceRequest: K8sServiceRequest, namespace: string): Promise<K8sService> {
    const serviceName = serviceRequest.name;
    const existingService = await this.getServiceWithName(serviceName, namespace);
    if (existingService == null) {
      return this.createService(serviceRequest, namespace);
    } else {
      return existingService;
    }
  }

}

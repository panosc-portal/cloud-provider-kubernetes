import {bind, BindingScope, inject} from '@loopback/core';
import {K8sService, K8sServiceRequest} from '../models';
import {KubernetesDataSource} from '../datasources';


@bind({scope: BindingScope.SINGLETON})
export class K8sServiceManager {

  constructor(@inject('datasources.kubernetes') private dataSource: KubernetesDataSource) {
  }

  async getServiceWithName(name: string) {
    try {
      const service = await this.dataSource.K8sClient.api.v1.namespaces(this.dataSource.defaultNamespace)
        .services(name)
        .get();
      const k8sService = new K8sService({k8sResponse: service.body});
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

  async createService(serviceRequest: K8sServiceRequest): Promise<K8sService> {
    const service = await this.dataSource.K8sClient.api.v1.namespace(this.dataSource.defaultNamespace).services.post({body: serviceRequest.modal});
    const newService = new K8sService(service.body);
    if (newService.isValid()) {
      return newService;
    } else {
      throw new Error('Did not manage to create a kubernetes service');
    }
  }

  async createServiceIfNotExist(serviceRequest: K8sServiceRequest): Promise<K8sService> {
    const serviceName = serviceRequest.name;
    const existingService = await this.getServiceWithName(serviceName);
    if (existingService == null) {
      return this.createService(serviceRequest);
    } else {
      return existingService;
    }
  }

}

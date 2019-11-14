import {bind, /* inject, */ BindingScope, inject} from '@loopback/core';
import {K8sService, K8sServiceRequest} from '../models';
import {KubernetesDataSource} from '../datasources';

@bind({scope: BindingScope.SINGLETON})
export class K8sServiceManagerService {

  constructor(@inject('datasources.kubernetes')
              protected dataSource: KubernetesDataSource = new KubernetesDataSource()) {
  }

  async getServiceWithName(name: string) {
    try {
      const service = await this.dataSource.K8sClient.api.v1.namespaces(this.dataSource.defaultNamespace).services(name).get();
      return new K8sService({k8sResponse: service.body});
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      } else {
        throw error;
      }
    }
  }

  async createService(serviceRequest: K8sServiceRequest): Promise<K8sService> {
    const serviceName = serviceRequest.name;
    const existingService = await this.getServiceWithName(serviceName);
    if (existingService == null) {
      const service = await this.dataSource.K8sClient.api.v1.namespace(this.dataSource.defaultNamespace).services.post({body: serviceRequest.modal});
      return new K8sService({k8sResponse: service.body});
    } else {
      return existingService;
    }
  }

}

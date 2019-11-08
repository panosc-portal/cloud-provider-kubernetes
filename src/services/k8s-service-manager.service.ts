import {bind, /* inject, */ BindingScope, inject} from '@loopback/core';
import { K8sService, K8sServiceRequest} from '../models';
import {KubernetesDataSource} from '../datasources';

@bind({scope: BindingScope.SINGLETON})
class K8sServiceManagerService {
  private static dataSource: KubernetesDataSource;
  constructor(@inject('datasources.kubernetes')
              protected dataSource: KubernetesDataSource = new KubernetesDataSource()) {
  }

  /*
   * Add service methods here
   */
   async createService( serviceRequest: K8sServiceRequest) {
    const service = await this.dataSource.K8sClient.api.v1.namespace("visa").services.post({body: serviceRequest.modal});
    return new K8sService({k8sResponse:service.body});
  }

  }
export const K8sServiceManager = new K8sServiceManagerService;

import {expect} from '@loopback/testlab';
import {getTestApplicationContext} from '../../helpers/context.helper';
import {K8sServiceManager} from '../../../services';
import {K8sServiceRequest} from '../../../models';
import set = Reflect.set;

describe('K8sServiceManager', () => {
  let k8sServiceManager: K8sServiceManager;

  before('getK8sServiceManager', async () => {
    k8sServiceManager = getTestApplicationContext().k8sInstanceService.serviceManager;
  });


  it('create kubernetes service', async () => {
    const k8sServiceRequest = new K8sServiceRequest({name: 'test'});
    const K8sService = await k8sServiceManager.createService(k8sServiceRequest);
    console.log(K8sService);
  });
});

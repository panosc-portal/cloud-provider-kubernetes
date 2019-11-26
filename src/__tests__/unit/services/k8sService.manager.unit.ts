import {expect} from '@loopback/testlab';
import {getTestApplicationContext} from '../../helpers/context.helper';
import {K8sServiceManager} from '../../../services';
import {K8sServiceRequest} from '../../../models';
import {KubernetesMockServer} from '../../kubernetesMock/KubernetesMockServer';

describe('K8sServiceManager', () => {
  let k8sServiceManager: K8sServiceManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    kubernetesMockServer.start();
    k8sServiceManager = getTestApplicationContext().k8sInstanceService.serviceManager;
  });

  after('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes service', async () => {
    const k8sServiceRequest = new K8sServiceRequest( 'test');
    const k8sService = await k8sServiceManager.createService(k8sServiceRequest,"panosc");
    expect(k8sService).to.not.be.null();
    expect(k8sService.name).to.be.equal('test');
    expect(k8sService.port).to.not.be.null();
  });
});

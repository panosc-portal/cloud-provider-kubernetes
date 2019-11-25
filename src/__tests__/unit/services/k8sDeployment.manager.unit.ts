import {expect} from '@loopback/testlab';
import {getTestApplicationContext} from '../../helpers/context.helper';
import {K8sDeploymentManager} from '../../../services';
import {K8sDeploymentRequest} from '../../../models';
import {KubernetesMockServer} from '../../kubernetesMock/KubernetesMockServer';

describe('K8sDeploymentManager', () => {
  let k8sDeploymentManager: K8sDeploymentManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    kubernetesMockServer.start();
    k8sDeploymentManager = getTestApplicationContext().k8sInstanceService.deploymentManager;
  });

  after('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes deployment', async () => {
    const k8sDeploymentRequest = new K8sDeploymentRequest({name: 'test', image: 'danielguerra/ubuntu-xrdp'});
    const k8sDeployment = await k8sDeploymentManager.createDeployment(k8sDeploymentRequest);
    expect(k8sDeployment).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });
});



import {expect} from '@loopback/testlab';
import {getTestApplicationContext} from '../../helpers/context.helper';
import {K8sDeploymentManager, K8sNamespaceManager} from '../../../services';
import {K8sDeploymentRequest, K8sNamespaceRequest} from '../../../models';
import {KubernetesMockServer} from '../../kubernetesMock/KubernetesMockServer';

describe('K8sDeploymentManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  let k8sDeploymentManager: K8sDeploymentManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    kubernetesMockServer.start();
    k8sNamespaceManager = getTestApplicationContext().k8sInstanceService.namespaceManager;
    k8sDeploymentManager = getTestApplicationContext().k8sInstanceService.deploymentManager;
  });

  after('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.createNamespace(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest('test' , 'danielguerra/ubuntu-xrdp');
    const k8sDeployment = await k8sDeploymentManager.createDeployment(k8sDeploymentRequest, 'panosc');
    expect(k8sDeployment).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

  it('get a non existing deployment', async () => {
    const k8sDeployment =await k8sDeploymentManager.getDeploymentsWithName("test1","panosc");
    expect(k8sDeployment).to.be.null()
  });

  it('create and get kubernetes deployment', async () => {
    const k8sDeploymentRequest = new K8sDeploymentRequest( 'test' , 'danielguerra/ubuntu-xrdp');
    await k8sDeploymentManager.createDeployment(k8sDeploymentRequest,"panosc");
    const k8sDeployment =await k8sDeploymentManager.getDeploymentsWithName("test","panosc");
    expect(k8sDeployment).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

});



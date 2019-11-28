import {expect} from '@loopback/testlab';
import {getTestApplicationContext} from '../../helpers/context.helper';
import {K8sDeploymentRequest, K8sNamespaceRequest} from '../../../models';
import {KubernetesMockServer} from '../../kubernetesMock/KubernetesMockServer';
import {K8sNamespaceManager} from '../../../services';

describe('K8sNamespaceManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sNamespaceManager', async () => {
    kubernetesMockServer.start();
    k8sNamespaceManager = getTestApplicationContext().k8sInstanceService.namespaceManager;
  });

  after('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes namespace', async () => {
    const k8sNamespaceRequest = new K8sNamespaceRequest( 'test');
    const k8sNamespace = await k8sNamespaceManager.createNamespace(k8sNamespaceRequest);
    expect(k8sNamespace).to.not.be.null();
    expect(k8sNamespace.name).to.be.equal('test');
  });

  it('get a non existing namespace', async () => {
    const k8sNamespace =await k8sNamespaceManager.getNamespaceWithName("test1");
    expect(k8sNamespace).to.be.null()
  });

  it('create and get kubernetes namespace', async () => {
    const k8sNamespaceRequest = new K8sNamespaceRequest( 'testNamespace' );
    await k8sNamespaceManager.createNamespace(k8sNamespaceRequest);
    const k8sNamespace =await k8sNamespaceManager.getNamespaceWithName('testNamespace');
    expect(k8sNamespace).to.not.be.null();
    expect(k8sNamespace.name).to.be.equal('testNamespace');
  });
});

import { expect } from '@loopback/testlab';
import { getTestApplicationContext } from '../../helpers/context.helper';
import { K8sNamespaceRequest } from '../../../models';
import { KubernetesMockServer } from '../../kubernetesMock/KubernetesMockServer';
import { K8sNamespaceManager } from '../../../services';

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

  it('create kubernetes service', async () => {
    const k8sNamespaceRequest = new K8sNamespaceRequest('test');
    const k8sNamespace = await k8sNamespaceManager.createNamespace(k8sNamespaceRequest);
    expect(k8sNamespace).to.not.be.null();
    expect(k8sNamespace.name).to.be.equal('test');
  });
});

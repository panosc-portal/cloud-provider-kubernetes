import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import { K8sNamespaceManager } from '../../../../services';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';

describe('K8sNamespaceManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sNamespaceManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sNamespaceManager = testApplicationContext.k8sInstanceService.namespaceManager;
  });

  beforeEach('startMockServer', async () => {
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes namespace', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('test');
    expect(k8sNamespace || null).to.not.be.null();
    expect(k8sNamespace.name).to.be.equal('test');
  });

  it('get a non existing namespace', async () => {
    const k8sNamespace = await k8sNamespaceManager.getWithName('test');
    expect(k8sNamespace || null).to.be.null();
  });

  it('create and get kubernetes namespace', async () => {
    await k8sNamespaceManager.create('testnamespace');
    const k8sNamespace = await k8sNamespaceManager.getWithName('testnamespace');
    expect(k8sNamespace || null).to.not.be.null();
    expect(k8sNamespace.name).to.be.equal('testnamespace');
  });

  it('create the same namespace twice', async () => {
    await k8sNamespaceManager.create('testnamespace');
    let k8sNamespace2 = null;
    try {
      k8sNamespace2 = await k8sNamespaceManager.create('testnamespace');
    } catch (error) {
    }
    expect(k8sNamespace2 || null).to.be.null();
  });

  it('delete an inexistent namespace', async () => {
    const deletedDeployment = await k8sNamespaceManager.delete('test');
    expect(deletedDeployment).to.be.false();
  });

  it('create and delete a namespace', async () => {
    await k8sNamespaceManager.create('test');
    const deletedDeployment = await k8sNamespaceManager.delete('test');
    expect(deletedDeployment).to.be.true();
  });
});

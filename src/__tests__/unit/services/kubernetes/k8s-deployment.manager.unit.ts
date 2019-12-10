import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import { K8sDeploymentManager, K8sNamespaceManager } from '../../../../services';
import { K8sDeploymentRequest, K8sNamespaceRequest } from '../../../../models';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';

describe('K8sDeploymentManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  let k8sDeploymentManager: K8sDeploymentManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sNamespaceManager = testApplicationContext.k8sInstanceService.namespaceManager;
    k8sDeploymentManager = testApplicationContext.k8sInstanceService.deploymentManager;
  });

  beforeEach('startMockServer', async () => {
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: 'danielguerra/ubuntu-xrdp',
      memory: 10,
      cpu: 1
    });
    const k8sDeployment = await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    expect(k8sDeployment).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

  it('get a non existing deployment', async () => {
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment).to.be.null();
  });

  it('create and get kubernetes deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: 'danielguerra/ubuntu-xrdp',
      memory: 10,
      cpu: 1
    });
    await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

  it('create two kubernetes deployment with same name', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: 'danielguerra/ubuntu-xrdp',
      memory: 10,
      cpu: 1
    });
    await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    const k8sDeploymentRequest2 = new K8sDeploymentRequest({
      name: 'test',
      image: 'danielguerra/ubuntu-xrdp',
      memory: 10,
      cpu: 1
    });
    const k8sDeploument2 = await k8sDeploymentManager.create(k8sDeploymentRequest2, 'panosc');
    expect(k8sDeploument2).to.be.null();
  });

  it('delete an inexistent deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const deletedDeployment = await k8sDeploymentManager.deleteWithComputeId('test', 'panosc');
    expect(deletedDeployment).to.be.false();
  });

  it('create and delete a deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: 'danielguerra/ubuntu-xrdp',
      memory: 10,
      cpu: 1
    });
    await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    const deletedService = await k8sDeploymentManager.deleteWithComputeId('testdeployment', 'panosc');
    expect(deletedService).to.be.not.null();
  });
});

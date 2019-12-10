import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import { K8sServiceManager, K8sNamespaceManager } from '../../../../services';
import { K8sServiceRequest, K8sNamespaceRequest } from '../../../../models';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';

describe('K8sServiceManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  let k8sServiceManager: K8sServiceManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sNamespaceManager = testApplicationContext.k8sInstanceService.namespaceManager;
    k8sServiceManager = testApplicationContext.k8sInstanceService.serviceManager;
  });

  beforeEach('startMockServer', async () => {
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes service', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sServiceRequest = new K8sServiceRequest('test');
    const k8sService = await k8sServiceManager.create(k8sServiceRequest, 'panosc');
    expect(k8sService).to.not.be.null();
    expect(k8sService.name).to.be.equal('test');
    expect(k8sService.ports).to.not.be.null();
  });

  it('get a non existing service', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sService = await k8sServiceManager.getWithComputeId('test1', 'panosc');
    expect(k8sService).to.be.null();
  });

  it('create and get kubernetes service', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sServiceRequest = new K8sServiceRequest('test-service');
    await k8sServiceManager.create(k8sServiceRequest, 'panosc');
    const k8sService = await k8sServiceManager.getWithComputeId('test-service', 'panosc');
    expect(k8sService).to.not.be.null();
    expect(k8sService.name).to.be.equal('test-service');
  });

  it('delete an inexistent service', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const deletedService = await k8sServiceManager.deleteWithComputeId('test', 'panosc');
    expect(deletedService).to.be.false();
  });

  it('create and delete a service', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sServiceRequest = new K8sServiceRequest('test-service');
    await k8sServiceManager.create(k8sServiceRequest, 'panosc');
    const deletedService = await k8sServiceManager.deleteWithComputeId('test-service', 'panosc');
    expect(deletedService).to.be.not.null();
  });
});

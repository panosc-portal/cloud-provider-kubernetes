import { expect } from '@loopback/testlab';
import { getTestApplicationContext } from '../../helpers/context.helper';
import { K8sServiceManager, K8sNamespaceManager } from '../../../services';
import { K8sServiceRequest, K8sNamespaceRequest } from '../../../models';
import { KubernetesMockServer } from '../../kubernetesMock/KubernetesMockServer';

describe('K8sServiceManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  let k8sServiceManager: K8sServiceManager;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    k8sNamespaceManager = getTestApplicationContext().k8sInstanceService.namespaceManager;
    k8sServiceManager = getTestApplicationContext().k8sInstanceService.serviceManager;
  });

  beforeEach('startMockServer', async () => {
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes service', async () => {
    const k8sNamespace = await k8sNamespaceManager.createNamespace(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sServiceRequest = new K8sServiceRequest('test');
    const k8sService = await k8sServiceManager.createService(k8sServiceRequest, 'panosc');
    expect(k8sService).to.not.be.null();
    expect(k8sService.name).to.be.equal('test');
    expect(k8sService.ports).to.not.be.null();
  });

  it('get a non existing service', async () => {
    const k8sNamespace = await k8sNamespaceManager.createNamespace(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sService = await k8sServiceManager.getServiceWithName('test1', 'panosc');
    expect(k8sService).to.be.null();
  });

  it('create and get kubernetes service', async () => {
    const k8sNamespace = await k8sNamespaceManager.createNamespace(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sServiceRequest = new K8sServiceRequest('testService');
    await k8sServiceManager.createService(k8sServiceRequest, 'panosc');
    const k8sService = await k8sServiceManager.getServiceWithName('testService', 'panosc');
    expect(k8sService).to.not.be.null();
    expect(k8sService.name).to.be.equal('testService');
  });

  it('delete an inexistent service', async () => {
    const k8sNamespace = await k8sNamespaceManager.createNamespace(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const deletedService = await k8sServiceManager.deleteService('test', 'panosc');
    expect(deletedService).to.be.false();
  });

  it('create and delete a service', async () => {
    const k8sNamespace = await k8sNamespaceManager.createNamespace(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const k8sServiceRequest = new K8sServiceRequest('testService');
    await k8sServiceManager.createService(k8sServiceRequest, 'panosc');
    const deletedService = await k8sServiceManager.deleteService('testService', 'panosc');
    expect(deletedService).to.be.not.null();
  });
});

import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import { K8sDeploymentManager, K8sNamespaceManager, InstanceService } from '../../../../services';
import { K8sDeploymentRequest, K8sNamespaceRequest } from '../../../../models';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';
import { givenInitialisedTestDatabase } from '../../../helpers/database.helper';

describe('K8sDeploymentManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  let k8sDeploymentManager: K8sDeploymentManager;
  let instanceService: InstanceService;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sNamespaceManager = testApplicationContext.k8sInstanceService.namespaceManager;
    k8sDeploymentManager = testApplicationContext.k8sInstanceService.deploymentManager;
    instanceService = testApplicationContext.instanceService;
  });

  beforeEach('startMockServer', async () => {
    await givenInitialisedTestDatabase();
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour
    });
    const k8sDeployment = await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    expect(k8sDeployment).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

  it('creates kubernetes deployment request with expected ports', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour
    });
    expect(k8sDeploymentRequest.model.spec.template.spec.containers[0].ports.length).to.equal(2);
  });

  it('creates kubernetes deployment with expected ports', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour
    });

    const k8sDeployment = await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    expect(k8sDeployment).to.not.be.null();

    expect(k8sDeployment.ports.length).to.equal(2);

    const portNumbers = k8sDeployment.ports.map(port => port.containerPort);
    expect(portNumbers.includes(3389)).to.be.true();
    expect(portNumbers.includes(22)).to.be.true();
  });

  it('get a non existing deployment', async () => {
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment).to.be.null();
  });

  it('create and get kubernetes deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour
    });
    await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

  it('create two kubernetes deployment with same name', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour
    });
    await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    const k8sDeploymentRequest2 = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour
    });
    const k8sDeployment2 = await k8sDeploymentManager.create(k8sDeploymentRequest2, 'panosc');
    expect(k8sDeployment2).to.be.null();
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

    const instance = await instanceService.getById(1);
    expect(instance).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour
    });
    await k8sDeploymentManager.create(k8sDeploymentRequest, 'panosc');
    const deletedService = await k8sDeploymentManager.deleteWithComputeId('testdeployment', 'panosc');
    expect(deletedService).to.be.not.null();
  });
});

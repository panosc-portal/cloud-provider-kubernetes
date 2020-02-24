import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import {
  FlavourService,
  ImageService,
  InstanceService,
  K8sInstanceService,
  K8sNamespaceManager
} from '../../../../services';
import { givenInitialisedTestDatabase } from '../../../helpers/database.helper';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';
import { Instance, InstanceUser } from '../../../../models';

describe('K8sInstanceService', () => {
  let k8sInstanceService: K8sInstanceService;
  let k8sNamespaceManager: K8sNamespaceManager;

  let instanceService: InstanceService;
  let imageService: ImageService;
  let flavourService: FlavourService;

  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sNamespaceManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sInstanceService = testApplicationContext.k8sInstanceService;
    k8sNamespaceManager = testApplicationContext.k8sInstanceService.namespaceManager;

    imageService = testApplicationContext.imageService;
    flavourService = testApplicationContext.flavourService;
    instanceService = testApplicationContext.instanceService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  beforeEach('startMockServer', async () => {
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes instance', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(3);
    const k8sInstance = await k8sInstanceService.create(instance);
    expect(k8sInstance).to.be.not.null();
  });

  it('create and delete kubernetes instance', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(3);
    const k8sInstance = await k8sInstanceService.create(instance);
    const instanceDeleted = await k8sInstanceService.delete(k8sInstance.computeId, 'panosc-kubernetes-instances');

    expect(instanceDeleted).to.be.true();
  });

  it('create instance and verify label connection', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(3);
    const k8sInstance = await k8sInstanceService.create(instance);
    const deploymentLabels = k8sInstance.deployment.labels;
    const serviceLabels = k8sInstance.service.selectorLabel;
    expect(deploymentLabels.app).to.be.equal(serviceLabels.app);
  });

  it('create instance with service error', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);
    const user = new InstanceUser({ id: 1, username: 'testuser', uid: 1000, gid: 1000, homePath: '/home/testuser' });

    const instance = new Instance({ id: 999, image: image, flavour: flavour, name: 'endpoint-error', user: user });

    const k8sInstance = await k8sInstanceService.create(instance);

    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');
  });

  it('create instance with deployment error pod BackOff', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);
    const user = new InstanceUser({ id: 1, username: 'testuser', uid: 1000, gid: 1000, homePath: '/home/testuser' });

    const instance = new Instance({ id: 999, image: image, flavour: flavour, name: 'pod-crash-loop', user: user });

    const k8sInstance = await k8sInstanceService.create(instance);

    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');
  });

  it('create instance with deployment error pod ContainerCreating timeout', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);
    const user = new InstanceUser({ id: 1, username: 'testuser', uid: 1000, gid: 1000, homePath: '/home/testuser' });

    const instance = new Instance({
      id: 999,
      image: image,
      flavour: flavour,
      name: 'pod-container-creating-timeout',
      user: user
    });

    const k8sInstance = await k8sInstanceService.create(instance);

    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');
  });

  it('create instance with deployment error pod ErrImagePull', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);
    const user = new InstanceUser({ id: 1, username: 'testuser', uid: 1000, gid: 1000, homePath: '/home/testuser' });

    const instance = new Instance({ id: 999, image: image, flavour: flavour, name: 'pod-err-image-pull', user: user });

    const k8sInstance = await k8sInstanceService.create(instance);

    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');
  });

  it('create instance with ssh and rdp protocols and check service and deployment response', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    const k8sInstance = await k8sInstanceService.create(instance);
    const k8sDeploymentPorts = k8sInstance.deployment.ports;
    const k8sServicePorts = k8sInstance.service.ports;

    expect(k8sDeploymentPorts.length).to.equal(2);
    expect(k8sDeploymentPorts[0].name).to.equal('ssh');
    expect(k8sDeploymentPorts[0].containerPort).to.equal(22);
    expect(k8sDeploymentPorts[1].name).to.equal('rdp');
    expect(k8sDeploymentPorts[1].containerPort).to.equal(3389);

    expect(k8sServicePorts.length).to.equal(2);
    expect(k8sServicePorts[0].name).to.equal('ssh');
    expect(k8sServicePorts[0].port).to.equal(22);
    expect(k8sServicePorts[1].name).to.equal('rdp');
    expect(k8sServicePorts[1].port).to.equal(3389);
  });

  it('create instance without protocols', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc-kubernetes-instances');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(8);
    let caughtError = null;
    try {
      await k8sInstanceService.create(instance);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).to.not.be.null();
    expect(caughtError.message).to.endWith('image does not contain any protocols');
  });
});

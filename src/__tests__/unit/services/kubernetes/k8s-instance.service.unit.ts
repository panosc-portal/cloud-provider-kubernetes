import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import {
  FlavourService,
  ImageService,
  InstanceService, K8sDeploymentManager,
  K8sInstanceService,
  K8sNamespaceManager, K8sServiceManager, K8sNodeService
} from '../../../../services';
import {
  K8sInstance,
  K8sNamespaceRequest,
} from '../../../../models/kubernetes';
import { givenInitialisedTestDatabase } from '../../../helpers/database.helper';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';

describe('K8sInstanceService', () => {
  let k8sInstanceService: K8sInstanceService;
  let k8sNamespaceManager: K8sNamespaceManager;
  let k8sServiceManager: K8sServiceManager;
  let k8sDeploymentManager: K8sDeploymentManager;
  let k8sNodeService: K8sNodeService;

  let instanceService: InstanceService;
  let imageService: ImageService;
  let flavourService: FlavourService;

  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sNamespaceManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sInstanceService = testApplicationContext.k8sInstanceService;
    k8sNamespaceManager = testApplicationContext.k8sInstanceService.namespaceManager;
    k8sServiceManager = testApplicationContext.k8sInstanceService.serviceManager;
    k8sDeploymentManager = testApplicationContext.k8sInstanceService.deploymentManager;
    k8sNodeService = testApplicationContext.k8sInstanceService.nodeService;

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
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(3);
    const k8sInstance = await k8sInstanceService.create(instance);
    expect(k8sInstance).to.be.not.null();
  });

  it('create and delete kubernetes instance', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(3);
    const k8sInstance = await k8sInstanceService.create(instance);
    const instanceDeleted = await k8sInstanceService.delete(k8sInstance.computeId);

    expect(instanceDeleted).to.be.true();
  });

  it('create instance and verify label connection', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(3);
    const k8sInstance = await k8sInstanceService.create(instance);
    const deploymentLabels = k8sInstance.deployment.labels;
    const serviceLabels = k8sInstance.service.selectorLabel;
    expect(deploymentLabels.app).to.be.equal(serviceLabels.app);
  });

  it('create instance with service error', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);

    const deploymentRequest = k8sInstanceService.requestFactoryService.createK8sDeploymentRequest({
      name: 'default-instance',
      image: image,
      flavour: flavour
    });
    const deployment = await k8sDeploymentManager.create(deploymentRequest, 'panosc');

    const serviceRequest = k8sInstanceService.requestFactoryService.createK8sServiceRequest({
      name: 'endpoint-error',
      image: image
    });
    const service = await k8sServiceManager.create(serviceRequest, 'panosc');


    const node = await k8sNodeService.getMaster();
    const k8sInstance = new K8sInstance(deployment, service, 'test-instance', node.hostname);
    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');
  });

it('create instance with deployment error pod BackOff', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);

    const deploymentRequest = k8sInstanceService.requestFactoryService.createK8sDeploymentRequest({
      name: 'pod-crashLoop',
      image: image,
      flavour: flavour
    });
    const deployment = await k8sDeploymentManager.create(deploymentRequest, 'panosc');

    const serviceRequest = k8sInstanceService.requestFactoryService.createK8sServiceRequest({
      name: 'default-instance',
      image: image
    });
    const service = await k8sServiceManager.create(serviceRequest, 'panosc');


    const node = await k8sNodeService.getMaster();
    const k8sInstance = new K8sInstance(deployment, service, 'test-instance', node.hostname);
    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');

  });

  it('create instance with deployment error pod ContainerCreating timeout', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);

    const deploymentRequest =  k8sInstanceService.requestFactoryService.createK8sDeploymentRequest({
      name: 'pod-ContainerCreatingTimeout',
      image: image,
      flavour: flavour
    });
    const deployment = await k8sDeploymentManager.create(deploymentRequest, 'panosc');

    const serviceRequest = k8sInstanceService.requestFactoryService.createK8sServiceRequest({
      name: 'default-instance',
      image: image
    });
    const service = await k8sServiceManager.create(serviceRequest, 'panosc');


    const node = await k8sInstanceService.nodeService.getMaster();
    const k8sInstance = new K8sInstance(deployment, service, 'test-instance', node.hostname);
    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');
  });

  it('create instance with deployment error pod ErrImagePull', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(1);

    const deploymentRequest = k8sInstanceService.requestFactoryService.createK8sDeploymentRequest({
      name: 'pod-ErrImagePull',
      image: image,
      flavour: flavour
    });
    const deployment = await k8sDeploymentManager.create(deploymentRequest, 'panosc');

    const serviceRequest = k8sInstanceService.requestFactoryService.createK8sServiceRequest({
      name: 'default-instance',
      image: image
    });
    const service = await k8sServiceManager.create(serviceRequest, 'panosc');


    const node = await k8sNodeService.getMaster();
    const k8sInstance = new K8sInstance(deployment, service, 'test-instance', node.hostname);
    expect(k8sInstance).not.to.be.null();
    expect(k8sInstance.state.status).to.be.equal('ERROR');

  });

});

import { expect } from '@loopback/testlab';
import { getTestApplicationContext } from '../../../helpers/context.helper';
import { KubernetesMockServer } from '../../../kubernetesMock/KubernetesMockServer';
import {
  FlavourService,
  ImageService,
  InstanceService,
  K8sInstanceService,
  K8sNamespaceManager
} from '../../../../services';
import { K8sNamespaceRequest } from '../../../../models/kubernetes';
import { Instance, Protocol } from '../../../../models/domain';
import { InstanceStatus, ProtocolName } from '../../../../models/enumerations';
import { givenInitialisedTestDatabase } from '../../../helpers/database.helper';

describe('K8sInstanceService', () => {
  let k8sInstanceService: K8sInstanceService;
  let k8sNamespaceManager: K8sNamespaceManager;
  let imageService: ImageService;
  let flavourService: FlavourService;
  let instanceService: InstanceService;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sNamespaceManager', async () => {
    k8sNamespaceManager = getTestApplicationContext().k8sInstanceService.namespaceManager;
    k8sInstanceService = getTestApplicationContext().k8sInstanceService;
    imageService = getTestApplicationContext().imageService;
    flavourService = getTestApplicationContext().flavourService;
    instanceService = getTestApplicationContext().instanceService;
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
    const k8sInstance = await k8sInstanceService.createK8sInstance(instance);
    expect(k8sInstance).to.be.not.null();
  });

  it('create and delete kubernetes instance', async () => {
    const k8sNamespace = await k8sNamespaceManager.create(new K8sNamespaceRequest('panosc'));
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(3);
    const k8sInstance = await k8sInstanceService.createK8sInstance(instance);
    const deleteInstance = await k8sInstanceService.deleteK8sInstance(k8sInstance.computeId);
    console.log(deleteInstance);
  });
});

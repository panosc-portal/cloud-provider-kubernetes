import { FlavourRepository, ImageRepository, InstanceRepository, InstanceAccountRepository, InstanceProtocolRepository, ImageProtocolRepository, ImageVolumeRepository } from '../../repositories';
import { FlavourService, ImageService, InstanceService, K8sInstanceService, K8sNodeService, InstanceActionService, InstanceAccountService, InstanceProtocolService, ImageProtocolService, ImageVolumeService } from '../../services';
import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { KubernetesDataSource } from '../../datasources';
import { ProtocolRepository } from '../../repositories/protocol.repository';

export interface TestApplicationContext {
  flavourRepository: FlavourRepository;
  imageRepository: ImageRepository;
  instanceRepository: InstanceRepository;
  flavourService: FlavourService;
  imageService: ImageService;
  instanceService: InstanceService;
  instanceProtocolService: InstanceProtocolService;
  imageProtocolService: ImageProtocolService;
  imageVolumeService: ImageVolumeService;
  instanceAccountService: InstanceAccountService;
  instanceActionService: InstanceActionService;
  k8sInstanceService: K8sInstanceService;
  k8sNodeService: K8sNodeService;
}

export function createTestApplicationContext(): TestApplicationContext {
  const kubernetesDataSource = new KubernetesDataSource();

  const flavourRepository: FlavourRepository = new FlavourRepository(testDataSource);
  const imageRepository: ImageRepository = new ImageRepository(testDataSource);
  const instanceRepository: InstanceRepository = new InstanceRepository(testDataSource);
  const instanceProtocolRepository: InstanceProtocolRepository = new InstanceProtocolRepository(testDataSource);
  const imageProtocolRepository: ImageProtocolRepository = new ImageProtocolRepository(testDataSource);
  const imageVolumeRepository: ImageVolumeRepository = new ImageVolumeRepository(testDataSource);
  const protocolRepository: ProtocolRepository = new ProtocolRepository(testDataSource);
  const instanceAccountRepository: InstanceAccountRepository = new InstanceAccountRepository(testDataSource);

  const flavourService: FlavourService = new FlavourService(flavourRepository);
  const imageService: ImageService = new ImageService(imageRepository, protocolRepository);
  const instanceProtocolService: InstanceProtocolService = new InstanceProtocolService(instanceProtocolRepository);
  const instanceService: InstanceService = new InstanceService(instanceRepository, instanceProtocolService);
  const imageProtocolService: ImageProtocolService = new ImageProtocolService(imageProtocolRepository);
  const imageVolumeService: ImageVolumeService = new ImageVolumeService(imageVolumeRepository);
  const instanceAccountService: InstanceAccountService = new InstanceAccountService(instanceAccountRepository);

  const k8sInstanceService = new K8sInstanceService(kubernetesDataSource);
  const k8sNodeService = new K8sNodeService(kubernetesDataSource);

  const instanceActionService: InstanceActionService = new InstanceActionService(instanceService, k8sInstanceService);
  return {
    flavourRepository,
    imageRepository,
    instanceRepository,
    flavourService,
    imageService,
    instanceService,
    instanceProtocolService,
    imageProtocolService,
    imageVolumeService,
    instanceAccountService,
    instanceActionService,
    k8sInstanceService,
    k8sNodeService
  };
}

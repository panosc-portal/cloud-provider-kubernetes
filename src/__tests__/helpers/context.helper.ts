import { FlavourRepository, ImageRepository, InstanceRepository } from '../../repositories';
import {
  FlavourService,
  ImageService,
  InstanceService,
  K8sInstanceService,
  K8sNodeService,
  InstanceActionService,
} from '../../services';
import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { KubernetesDataSource } from '../../datasources';

export interface TestApplicationContext {
  flavourRepository: FlavourRepository;
  imageRepository: ImageRepository;
  instanceRepository: InstanceRepository;
  flavourService: FlavourService;
  imageService: ImageService;
  instanceService: InstanceService;
  instanceActionService: InstanceActionService;
  k8sInstanceService: K8sInstanceService;
  k8sNodeService: K8sNodeService;
}

export function createTestApplicationContext(): TestApplicationContext {
  const kubernetesDataSource = new KubernetesDataSource();

  const flavourRepository: FlavourRepository = new FlavourRepository(testDataSource);
  const imageRepository: ImageRepository = new ImageRepository(testDataSource);
  const instanceRepository: InstanceRepository = new InstanceRepository(testDataSource);

  const flavourService: FlavourService = new FlavourService(flavourRepository);
  const imageService: ImageService = new ImageService(imageRepository);
  const instanceService: InstanceService = new InstanceService(instanceRepository);

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
    instanceActionService,
    k8sInstanceService,
    k8sNodeService
  };
}

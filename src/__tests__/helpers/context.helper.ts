import * as dotenv from 'dotenv';
import {FlavourRepository, ImageRepository, InstanceRepository} from '../../repositories';
import {
  FlavourService,
  ImageService,
  InstanceService,
  K8sInstanceService,
  K8sServiceManager, K8sDeploymentManager,
} from '../../services';
import {testDataSource} from '../fixtures/datasources/testdb.datasource';
import {KubernetesDataSource} from '../../datasources';

export interface TestApplicationContext {
  flavourRepository: FlavourRepository;
  imageRepository: ImageRepository;
  instanceRepository: InstanceRepository;
  flavourService: FlavourService;
  imageService: ImageService;
  instanceService: InstanceService;
  k8sInstanceService: K8sInstanceService
}

export function getTestApplicationContext(): TestApplicationContext {

  const kubernetesDataSource = new KubernetesDataSource();

  const flavourRepository: FlavourRepository = new FlavourRepository(testDataSource);
  const imageRepository: ImageRepository = new ImageRepository(testDataSource);
  const instanceRepository: InstanceRepository = new InstanceRepository(testDataSource);

  const flavourService: FlavourService = new FlavourService(flavourRepository);
  const imageService: ImageService = new ImageService(imageRepository);
  const k8sInstanceService = new K8sInstanceService(kubernetesDataSource);
  const instanceService: InstanceService = new InstanceService(instanceRepository, k8sInstanceService);


  return {flavourRepository, imageRepository, instanceRepository, flavourService, imageService, instanceService, k8sInstanceService};
}

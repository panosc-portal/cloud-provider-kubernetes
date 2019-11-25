import * as dotenv from "dotenv";
import {FlavourRepository, ImageRepository, InstanceRepository } from '../../repositories';
import {FlavourService, ImageService, InstanceService, K8sInstanceService, K8sDeploymentManagerService, K8sServiceManagerService, K8sRequestFactoryService } from '../../services';
import {testDataSource} from '../fixtures/datasources/testdb.datasource';
import { KubernetesDataSource } from "../../datasources";

export interface TestApplicationContext {
    flavourRepository: FlavourRepository;
    imageRepository: ImageRepository;
    instanceRepository: InstanceRepository;
    flavourService: FlavourService;
    imageService: ImageService;
    instanceService: InstanceService;
  }

export function getTestApplicationContext(): TestApplicationContext {

  const kubernetesDataSource = new KubernetesDataSource();
  const k8sDeploymentManagerService = new K8sDeploymentManagerService(kubernetesDataSource);
  const k8sServiceManagerService = new K8sServiceManagerService(kubernetesDataSource);

  const flavourRepository: FlavourRepository = new FlavourRepository(testDataSource);
  const imageRepository: ImageRepository = new ImageRepository(testDataSource);
  const instanceRepository: InstanceRepository = new InstanceRepository(testDataSource);

  const flavourService: FlavourService = new FlavourService(flavourRepository);
  const imageService: ImageService = new ImageService(imageRepository);
  const k8sInstanceService = new K8sInstanceService(k8sDeploymentManagerService, k8sServiceManagerService);
  const instanceService: InstanceService = new InstanceService(instanceRepository, k8sInstanceService);

  return { flavourRepository, imageRepository, instanceRepository, flavourService, imageService, instanceService }
}

import * as dotenv from "dotenv";
import {FlavourRepository, ImageRepository, InstanceRepository } from '../../repositories';
import {
  FlavourService,
  ImageService,
  InstanceService,
  K8sInstanceService,
  K8sServiceManager, K8sDeploymentManager,
} from '../../services';
import {testDataSource} from '../fixtures/datasources/testdb.datasource';
import { KubernetesDataSource } from "../../datasources";

export interface TestApplicationContext {
    flavourRepository: FlavourRepository;
    imageRepository: ImageRepository;
    instanceRepository: InstanceRepository;
    flavourService: FlavourService;
    imageService: ImageService;
    instanceService: InstanceService;
    k8sServiceManager: K8sServiceManager
    k8sDeploymentManager:K8sDeploymentManager
  }

export function getTestApplicationContext(): TestApplicationContext {

  const kubernetesDataSource = new KubernetesDataSource();
  const k8sDeploymentManager = new K8sDeploymentManager(kubernetesDataSource);
  const k8sServiceManager = new K8sServiceManager(kubernetesDataSource);

  const flavourRepository: FlavourRepository = new FlavourRepository(testDataSource);
  const imageRepository: ImageRepository = new ImageRepository(testDataSource);
  const instanceRepository: InstanceRepository = new InstanceRepository(testDataSource);

  const flavourService: FlavourService = new FlavourService(flavourRepository);
  const imageService: ImageService = new ImageService(imageRepository);
  const k8sInstanceService = new K8sInstanceService(k8sDeploymentManager, k8sServiceManager);
  const instanceService: InstanceService = new InstanceService(instanceRepository, k8sInstanceService);


    return { flavourRepository, imageRepository, instanceRepository, flavourService, imageService, instanceService,k8sServiceManager,k8sDeploymentManager }
}

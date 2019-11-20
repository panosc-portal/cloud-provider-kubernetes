import {FlavourRepository, ImageRepository, InstanceRepository } from '../../repositories';
import {FlavourService, ImageService, InstanceService } from '../../services';
import {testDataSource} from '../fixtures/datasources/testdb.datasource';

export interface TestApplicationContext {
    flavourRepository: FlavourRepository;
    imageRepository: ImageRepository;
    instanceRepository: InstanceRepository;
    flavourService: FlavourService;
    imageService: ImageService;
    instanceService: InstanceService;
  }

export function getTestApplicationContext(): TestApplicationContext {

    const flavourRepository: FlavourRepository = new FlavourRepository(testDataSource);
    const imageRepository: ImageRepository = new ImageRepository(testDataSource);
    const instanceRepository: InstanceRepository = new InstanceRepository(testDataSource);

    const flavourService: FlavourService = new FlavourService(flavourRepository);
    const imageService: ImageService = new ImageService(imageRepository);
    const instanceService: InstanceService = new InstanceService(instanceRepository);

    return { flavourRepository, imageRepository, instanceRepository, flavourService, imageService, instanceService }
}

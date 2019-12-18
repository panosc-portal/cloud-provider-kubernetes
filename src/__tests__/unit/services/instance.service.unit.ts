import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { InstanceService, ImageService, FlavourService } from '../../../services';
import { Instance, Protocol, ProtocolName, InstanceStatus, InstanceProtocol } from '../../../models';

describe('InstanceService', () => {
  let instanceService: InstanceService;
  let imageService: ImageService;
  let flavourService: FlavourService;

  before('getInstanceService', async () => {
    const testApplicationContext = createTestApplicationContext();
    imageService = testApplicationContext.imageService;
    instanceService = testApplicationContext.instanceService;
    flavourService = testApplicationContext.flavourService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all instances', async () => {
    const instances = await instanceService.getAll();

    expect(instances.length).to.equal(4);
  });

  it('gets all instances with states', async () => {
    const instances = await instanceService.getAllWithStates([InstanceStatus.ACTIVE, InstanceStatus.BUILDING]);

    expect(instances.length).to.equal(4);
  });

  it('gets an instance', async () => {
    const instance = await instanceService.getById(1);

    expect(instance).to.not.be.null();
    expect(instance.name).to.equal('instance1');
  });

  it('saves an instance', async () => {
    const instances = await instanceService.getAll();
    expect(instances.length).to.equal(4);

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(2);

    const instance = new Instance({
      name: 'instance 3',
      description: 'A new instance',
      image: image,
      flavour: flavour,
      hostname: 'test.host.eu',
      status: InstanceStatus.BUILDING,
      currentCPU: 0,
      currentMemory: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      namespace: 'panosc',
      protocols: [
        new Protocol({ name: ProtocolName.SSH, port: 2222 }),
        new Protocol({ name: ProtocolName.RDP, port: 1234 })
      ]
    });

    await instanceService.save(instance);
    expect(instance.id).to.not.be.null();

    const persistedInstance = await instanceService.getById(instance.id);
    expect(persistedInstance).to.not.be.null();
    expect(persistedInstance.image).to.not.be.null();
    expect(persistedInstance.image.id).to.equal(1);
    expect(persistedInstance.flavour).to.not.be.null();
    expect(persistedInstance.flavour.id).to.equal(2);
    expect(persistedInstance.protocols.length).to.equal(2);
    persistedInstance.protocols.forEach(protocol => {
      expect(protocol.id).to.not.be.null();
    });
  });

  it('deletes an instance', async () => {
    let instances = await instanceService.getAll();
    const numberOfInstancesOriginally = instances.length;

    const instance = instances[0];
    const image = instance.image;
    expect(image).to.not.be.null();
    const flavour = instance.flavour;
    expect(flavour).to.not.be.null();

    await instanceService.delete(instance);

    instances = await instanceService.getAll();
    expect(instances.length).to.equal(numberOfInstancesOriginally - 1);

    // Make sure image not deleted
    const persistedImage = imageService.getById(image.id);
    expect(persistedImage).to.not.be.null();

    // Make sure flavour not deleted
    const persistedFlavour = flavourService.getById(flavour.id);
    expect(persistedFlavour).to.not.be.null();
  });

  it('updates an instance', async () => {
    const instances = await instanceService.getAll();

    const instance = instances[0];
    instance.name = 'A new name';

    const persistedInstance = await instanceService.save(instance);
    expect(persistedInstance).to.not.be.null();
    expect(persistedInstance.id).to.equal(instance.id);
    expect(persistedInstance.name).to.equal(instance.name);

    const instancesAfterUpdate = await instanceService.getAll();
    expect(instancesAfterUpdate.length).to.equal(instances.length);
  });
});

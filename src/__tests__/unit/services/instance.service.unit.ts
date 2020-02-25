import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { InstanceService, ImageService, FlavourService, InstanceUserService, InstanceProtocolService } from '../../../services';
import { Instance, Protocol, ProtocolName, InstanceStatus, InstanceProtocol, InstanceUser } from '../../../models';

describe('InstanceService', () => {
  let instanceService: InstanceService;
  let imageService: ImageService;
  let flavourService: FlavourService;
  let instanceUserService: InstanceUserService;
  let instanceProtocolService: InstanceProtocolService;

  before('getInstanceService', async () => {
    const testApplicationContext = createTestApplicationContext();
    imageService = testApplicationContext.imageService;
    instanceService = testApplicationContext.instanceService;
    flavourService = testApplicationContext.flavourService;
    instanceUserService = testApplicationContext.instanceUserService;
    instanceProtocolService = testApplicationContext.instanceProtocolService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all instances', async () => {
    const instances = await instanceService.getAll();

    expect(instances.length).to.equal(7);
  });

  it('gets all instances with states', async () => {
    const instances = await instanceService.getAllWithStates([InstanceStatus.ACTIVE, InstanceStatus.BUILDING]);

    expect(instances.length).to.equal(7);
  });

  it('gets an instance', async () => {
    const instance = await instanceService.getById(1);

    expect(instance || null).to.not.be.null();
    expect(instance.name).to.equal('instance1');
  });

  it('saves an instance', async () => {
    const instances = await instanceService.getAll();
    expect(instances.length).to.equal(7);

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(2);
    const user = new InstanceUser({accountId: 1, username: 'testuser', uid: 1000, gid: 1000, homePath: '/home/testuser'});

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
        new InstanceProtocol({ name: ProtocolName.SSH, port: 2222 }),
        new InstanceProtocol({ name: ProtocolName.RDP, port: 1234 })
      ],
      user: user
    });

    await instanceService.save(instance);
    expect(instance.id || null).to.not.be.null();

    const persistedInstance = await instanceService.getById(instance.id);
    expect(persistedInstance || null).to.not.be.null();
    expect(persistedInstance.image || null).to.not.be.null();
    expect(persistedInstance.image.id).to.equal(1);
    expect(persistedInstance.flavour || null).to.not.be.null();
    expect(persistedInstance.flavour.id).to.equal(2);
  });

  it('saves protocols with an instance', async () => {
    const instances = await instanceService.getAll();
    expect(instances.length).to.equal(7);

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(2);
    const user = new InstanceUser({accountId: 1, username: 'testuser', uid: 1000, gid: 1000, homePath: '/home/testuser'});

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
        new InstanceProtocol({ name: ProtocolName.SSH, port: 2222 }),
        new InstanceProtocol({ name: ProtocolName.RDP, port: 1234 })
      ],
      user: user
    });

    await instanceService.save(instance);
    expect(instance.id || null).to.not.be.null();

    const persistedInstance = await instanceService.getById(instance.id);
    expect(persistedInstance || null).to.not.be.null();
    expect(persistedInstance.protocols || null).to.not.be.null();
    expect(persistedInstance.protocols.length).to.equal(2);
    persistedInstance.protocols.forEach(protocol => {
      expect(protocol.id || null).to.not.be.null();
    });
  });


  it('saves a user with an instance', async () => {
    const instances = await instanceService.getAll();
    expect(instances.length).to.equal(7);

    const image = await imageService.getById(1);
    const flavour = await flavourService.getById(2);
    const user = new InstanceUser({accountId: 1, username: 'testuser', uid: 1000, gid: 1000, homePath: '/home/testuser'});

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
        new InstanceProtocol({ name: ProtocolName.SSH, port: 2222 }),
        new InstanceProtocol({ name: ProtocolName.RDP, port: 1234 })
      ],
      user: user
    });

    await instanceService.save(instance);
    expect(instance.id || null).to.not.be.null();

    const persistedInstance = await instanceService.getById(instance.id);
    expect(persistedInstance || null).to.not.be.null();
    expect(persistedInstance.user || null).to.not.be.null();
    expect(persistedInstance.user.id || null).to.not.be.null();
    expect(persistedInstance.user.username).to.equal('testuser');
  });

  it('deletes an instance', async () => {
    let instances = await instanceService.getAll();
    const numberOfInstancesOriginally = instances.length;

    const instance = instances.find(instance => instance.id === 5);
    const image = instance.image;
    expect(image || null).to.not.be.null();
    const flavour = instance.flavour;
    expect(flavour || null).to.not.be.null();

    await instanceService.delete(instance);

    instances = await instanceService.getAll();
    expect(instances.length).to.equal(numberOfInstancesOriginally - 1);

    // Make sure image not deleted
    const persistedImage = await imageService.getById(image.id);
    expect(persistedImage || null).to.not.be.null();

    // Make sure flavour not deleted
    const persistedFlavour = await flavourService.getById(flavour.id);
    expect(persistedFlavour || null).to.not.be.null();
  });

  it('deletes instance protocols when deleting an instance', async () => {
    let instances = await instanceService.getAll();
    const numberOfInstancesOriginally = instances.length;

    const instance = instances.find(instance => instance.id === 5);
    const protocols = instance.protocols;
    expect(protocols || null).to.not.be.null();
    expect(protocols.length).to.be.greaterThan(0);

    await instanceService.delete(instance);

    instances = await instanceService.getAll();
    expect(instances.length).to.equal(numberOfInstancesOriginally - 1);

    // make sure protocols deleted
    const persistedInstanceProtocol = await instanceProtocolService.getById(protocols[0].id);
    expect(persistedInstanceProtocol || null).to.be.null();
  });

  it('deletes a user when deleting an instance', async () => {
    let instances = await instanceService.getAll();
    const numberOfInstancesOriginally = instances.length;

    const instance = instances.find(instance => instance.id === 5);
    const user = instance.user;
    expect(user || null).to.not.be.null();

    await instanceService.delete(instance);

    instances = await instanceService.getAll();
    expect(instances.length).to.equal(numberOfInstancesOriginally - 1);

    // make sure user deleted
    const persistedUser = await instanceUserService.getById(user.id);
    expect(persistedUser || null).to.be.null();
  });

  it('updates an instance', async () => {
    const instances = await instanceService.getAll();

    const instance = instances[0];
    instance.name = 'A new name';

    const persistedInstance = await instanceService.save(instance);
    expect(persistedInstance || null).to.not.be.null();
    expect(persistedInstance.id).to.equal(instance.id);
    expect(persistedInstance.name).to.equal(instance.name);

    const instancesAfterUpdate = await instanceService.getAll();
    expect(instancesAfterUpdate.length).to.equal(instances.length);
  });
});

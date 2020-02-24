import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../../helpers/context.helper';
import { InstanceCommand, InstanceCommandType, InstanceStatus } from '../../../../models';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';

describe('InstanceActionService', () => {
  let context: TestApplicationContext;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getInstanceService', async () => {
    context = createTestApplicationContext();
  });

  beforeEach('Initialise Database', async () => {
    await givenInitialisedTestDatabase();
    kubernetesMockServer.start();

    await context.k8sInstanceService.initDefaultNamespace();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('Runs a command', async () => {
    let instance = await context.instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.status).to.equal(InstanceStatus.BUILDING);

    const command = new InstanceCommand(instance, InstanceCommandType.CREATE);
    await context.instanceActionService.execute(command);

    instance = await context.instanceService.getById(1);

    expect(instance.status).to.be.equal(InstanceStatus.ACTIVE);
    expect(instance.computeId || null).to.not.be.null();

    expect(instance.protocols || null).to.not.be.null();
    expect(instance.protocols.length).to.be.greaterThan(0);
    expect(instance.protocols[0].id || null).to.not.be.null();
  });

  it('Queues a command', async () => {
    let instance = await context.instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.status).to.equal(InstanceStatus.BUILDING);

    const stateCommand = new InstanceCommand(instance, InstanceCommandType.STATE);
    const createCommand = new InstanceCommand(instance, InstanceCommandType.CREATE);
    const statePromise = context.instanceActionService.execute(stateCommand);
    const createPromise = context.instanceActionService.execute(createCommand);

    await statePromise;
    instance = await context.instanceService.getById(1);
    expect(instance.status).to.be.equal(InstanceStatus.BUILDING);
    expect(instance.computeId || null).to.be.null();

    await createPromise;
    instance = await context.instanceService.getById(1);

    expect(instance.status).to.be.equal(InstanceStatus.ACTIVE);
    expect(instance.computeId || null).to.not.be.null();
  });

  it('Refuses a deplicated command', async () => {
    const instance = await context.instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.status).to.equal(InstanceStatus.BUILDING);

    const command1 = new InstanceCommand(instance, InstanceCommandType.CREATE);
    const command2 = new InstanceCommand(instance, InstanceCommandType.CREATE);
    const promise1 = context.instanceActionService.execute(command1);

    let isError = false;
    try {
      await context.instanceActionService.execute(command2);
    } catch (error) {
      isError = true;
    }

    await promise1;
    expect(isError).to.be.true();
  });
});

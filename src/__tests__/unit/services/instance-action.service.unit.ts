import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { getTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { InstanceActionService, InstanceService } from '../../../services';
import { InstanceCommand, InstanceCommandType, InstanceStatus } from '../../../models';
import { KubernetesMockServer } from '../../kubernetesMock/KubernetesMockServer';

describe('InstanceActionService', () => {
  let context: TestApplicationContext;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getInstanceService', async () => {
    context = getTestApplicationContext();
  });

  beforeEach('Initialise Database', async () => {
    await givenInitialisedTestDatabase();
    kubernetesMockServer.start();

    await context.k8sInstanceService.initDefaultNamespace();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('Run command', async () => {
    let instance = await context.instanceService.getById(1);
    expect(instance).to.not.be.null();
    expect(instance.status).to.equal(InstanceStatus.PENDING);

    const command = new InstanceCommand(instance, InstanceCommandType.CREATE);
    await context.instanceActionService.queueCommand(command);

    instance = await context.instanceService.getById(1);
    expect(instance.status).to.be.equal(InstanceStatus.BUILDING);
    expect(instance.computeId).to.not.be.null();
  });
});

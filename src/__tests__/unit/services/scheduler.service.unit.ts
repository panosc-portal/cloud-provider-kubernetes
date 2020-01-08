import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { InstanceService, InstanceActionService, InstanceStateJob } from '../../../services';
import { JOB_PROVIDER } from '../../../services/jobs/job-provider';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { InstanceStatus } from '../../../models';

describe('SchedulerService', () => {
  let instanceService: InstanceService;
  let instanceActionService: InstanceActionService;

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  before('getInstanceService', async () => {
    const testApplicationContext = createTestApplicationContext();
    instanceService = testApplicationContext.instanceService;
    instanceActionService = testApplicationContext.instanceActionService;
  });
 
  it('instantiates a class from a className', async () => {
    const className = 'InstanceStateJob';
   
    const instanceStateJob = new (JOB_PROVIDER.get(className).class)();
    expect(instanceStateJob).to.not.be.null();
  });

  it('Refreshes the state of all instances', async () => {
    const className = 'InstanceStateJob';
   
    const instanceStateJob = new (JOB_PROVIDER.get(className).class)() as InstanceStateJob;
    instanceStateJob['_instanceService'] = instanceService;
    instanceStateJob['_instanceActionService'] = instanceActionService;
    expect(instanceStateJob).to.not.be.null();

    const updatedInstances = await instanceStateJob.run();
    expect(updatedInstances).to.equal(4);
  });

  it('Refreshes the state of all building instances', async () => {
    const className = 'InstanceStateJob';
   
    const instanceStateJob = new (JOB_PROVIDER.get(className).class)() as InstanceStateJob;
    instanceStateJob['_instanceService'] = instanceService;
    instanceStateJob['_instanceActionService'] = instanceActionService;
    expect(instanceStateJob).to.not.be.null();

    const updatedInstances = await instanceStateJob.run({states: [InstanceStatus.BUILDING]});
    expect(updatedInstances).to.equal(3);
  });

  it('Removes a deleted instance', async () => {
    const numberOfInstances1 = (await instanceService.getAll()).length;
    const instance = await instanceService.getById(1);
    instance.id = null;
    instance.user.id = null;
    instance.status = InstanceStatus.DELETED;
    await instanceService.save(instance);
    const numberOfInstances2 = (await instanceService.getAll()).length;
    expect(numberOfInstances2).to.equal(numberOfInstances1 + 1);

    const className = 'InstanceStateJob';
    const instanceStateJob = new (JOB_PROVIDER.get(className).class)() as InstanceStateJob;
    instanceStateJob['_instanceService'] = instanceService;
    instanceStateJob['_instanceActionService'] = instanceActionService;
    expect(instanceStateJob).to.not.be.null();

    const updatedInstances = await instanceStateJob.run();
    expect(updatedInstances).to.equal(4);
    const numberOfInstances3 = (await instanceService.getAll()).length;
    expect(numberOfInstances3).to.equal(numberOfInstances1);
  });

  it('Will not run parallel identical jobs', async () => {
    const className = 'InstanceStateJob';
   
    const instanceStateJob = new (JOB_PROVIDER.get(className).class)() as InstanceStateJob;
    instanceStateJob['_instanceService'] = instanceService;
    instanceStateJob['_instanceActionService'] = instanceActionService;
    expect(instanceStateJob).to.not.be.null();

    const promise1 = instanceStateJob.run();
    const promise2 = instanceStateJob.run();

    const updatedInstances1 = await promise1;
    const updatedInstances2 = await promise2;

    expect(updatedInstances1).to.equal(4);
    expect(updatedInstances2).to.be.null();
  });
});

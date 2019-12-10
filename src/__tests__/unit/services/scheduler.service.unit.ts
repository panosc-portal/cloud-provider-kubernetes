import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { InstanceService, InstanceActionService } from '../../../services';
import { JOB_PROVIDER } from '../../../services/jobs/job-provider';

describe('SchedulerService', () => {
  let instanceService: InstanceService;
  let instanceActionService: InstanceActionService;

  before('getInstanceService', async () => {
    const testApplicationContext = createTestApplicationContext();
    instanceService = testApplicationContext.instanceService;
    instanceActionService = testApplicationContext.instanceActionService;
  });
 
  it('instantiates a class from a className', async () => {
    const className = 'InstanceStateJob';
   
    const instanceStateJob = new (JOB_PROVIDER.get(className).class)(instanceService, instanceActionService);
    expect(instanceStateJob).to.not.be.null();
  });

});

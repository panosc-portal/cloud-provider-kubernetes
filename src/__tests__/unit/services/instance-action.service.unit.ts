import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { getTestApplicationContext } from '../../helpers/context.helper';
import { InstanceActionService, InstanceService } from '../../../services';
import { InstanceCommand, InstanceCommandType } from '../../../models';

describe('InstanceActionService', () => {
  let instanceService: InstanceService;
  let instanceActionService: InstanceActionService;

  before('getInstanceService', async () => {
    instanceService = getTestApplicationContext().instanceService;
    instanceActionService = getTestApplicationContext().instanceActionService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('Run command', async () => {
    const instance = await instanceService.getById(1);
    expect(instance).to.not.be.null();

    const command = new InstanceCommand(instance, InstanceCommandType.CREATE);
    const action = instanceActionService.queueCommand(command);

    action.onTerminated(() => {
      console.log('terminated');
      expect(2).to.equal(2);
    });
  });
});

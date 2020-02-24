import { Job } from './job';
import { InstanceActionService } from '../concurrent';
import { job, jobInject } from './job-provider';
import { InstanceService } from '../instance.service';
import { logger } from '../../utils';
import { Instance, InstanceStatus, InstanceCommand, InstanceCommandType } from '../../models';
import filterAsync from 'node-filter-async';

@job()
export class InstanceStateJob extends Job {
  @jobInject('services.InstanceActionService')
  private _instanceActionService: InstanceActionService;

  @jobInject('services.InstanceService')
  private _instanceService: InstanceService;

  protected async _execute(params?: any): Promise<any> {
    let instances: Instance[];
    if (params && params.states && params.states.length > 0) {
      instances = await this._instanceService.getAllWithStates(params.states);
      if (instances.length > 0) {
        logger.info(`Running job to update all instance which have states ${params.states} (${instances.length})`);
      }
    } else {
      instances = await this._instanceService.getAll();
      if (instances.length > 0) {
        logger.info(`Running job to update all instances (${instances.length})`);
      }
    }

    // Cleanup all instances that have been deleted - set soft deleted flag
    if (instances.length > 0) {
      const runningInstances = await filterAsync(instances, async instance => {
        if (instance.status == InstanceStatus.DELETED) {
          instance.deleted = true;
          await this._instanceService.save(instance);
          logger.info(`Instance ${instance.id} has DELETED state: deleting it`);
          return false;
        } else {
          return true;
        }
      });

      // Create a state action for all running instances and wait for them to run
      if (runningInstances.length > 0) {
        try {
          await Promise.all(
            runningInstances.map(instance => {
              const command = new InstanceCommand(instance, InstanceCommandType.STATE);
              return this._instanceActionService.execute(command);
            })
          );
        } catch (error) {
          // Ignore errors such as action already queued
        }

        logger.info(`Finished updating states of ${runningInstances.length} instances`);
      }

      return runningInstances.length;
    } else {
      return 0;
    }
  }
}

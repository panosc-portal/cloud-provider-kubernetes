import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes';
import { InstanceCommand, InstanceStatus, Protocol, InstanceState } from '../../../models';
import { logger } from '../../../utils';

export class CreateInstanceAction extends InstanceAction {
  constructor(
    instanceCommand: InstanceCommand,
    instanceService: InstanceService,
    k8sInstanceService: K8sInstanceService,
    listener: InstanceActionListener
  ) {
    super(instanceCommand, instanceService, k8sInstanceService, listener);
  }

  protected async _run(): Promise<void> {
    const instance = await this.getInstance();

    try {
      logger.info(`Creating kubernetes instance ${instance.id}`);

      // Update instance state
      await this._updateInstanceState(
        new InstanceState({ status: InstanceStatus.BUILDING, message: '', cpu: 0, memory: 0 })
      );

      await this._createK8sInstance();
    } catch (error) {
      logger.error(`Error creating kubernetes instance with Id ${instance.id}: ${error.message}`);
      throw error;
    }
  }
}

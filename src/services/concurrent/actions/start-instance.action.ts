import { InstanceCommand, InstanceState, InstanceStatus } from '../../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes/k8s-instance.service';
import { logger } from '../../../utils';

export class StartInstanceAction extends InstanceAction {
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
      const computeId = instance.computeId;

      // Check that compute Id is null (not running)
      if (computeId == null) {
        logger.info(`Starting instance ${instance.id}: creating new k8s instance`);
        await this._createK8sInstance(
          new InstanceState({ status: InstanceStatus.STARTING, message: 'Instance starting' })
        );
      } else {
        logger.info(`Instance with id ${instance.id} is already running. Ignoring start action`);
      }
    } catch (error) {
      logger.error(`Error starting instance with Id ${instance.id}: ${error.message}`);
      throw error;
    }
  }
}

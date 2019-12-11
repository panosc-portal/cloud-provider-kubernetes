import { InstanceCommand, InstanceStatus } from '../../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes/k8s-instance.service';
import { logger } from '../../../utils';

export class RebootInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand, instanceService: InstanceService, k8sInstanceService: K8sInstanceService, listener: InstanceActionListener) {
    super(instanceCommand, instanceService, k8sInstanceService, listener);
  }

  protected async _run(): Promise<void> {
    const instance = this.instance;

    try {
      const computeId = instance.computeId;
      if (computeId != null) {
        const k8sInstance = await this.k8sInstanceService.getWithComputeId(computeId);
        if (k8sInstance != null) {
          logger.info(`Rebooting instance ${instance.id}: deleting current k8s instance`);
          await this._deleteK8sInstance(computeId);

          logger.info(`Rebooting instance ${instance.id}: creating new k8s instance`);
          await this._createK8sInstance();

        } else {
          logger.info(`Could not find k8s instance with ${computeId}`);
        }
      
      } else {
        logger.info(`Instance with id ${instance.id} does not have an associated compute Id. Ignoring reboot action`);
      }

    } catch (error) {
      logger.error(`Error rebooting instance with Id ${instance.id}: ${error.message}`);
      throw error;
    }
  }
}

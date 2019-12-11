import { InstanceCommand, InstanceStatus, InstanceState } from '../../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes/k8s-instance.service';
import { logger } from '../../../utils';

export class DeleteInstanceAction extends InstanceAction {
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
          logger.info(`Deleting instance ${instance.id}`)
          await this._deleteK8sInstance(computeId);

          await this._updateInstanceState(new InstanceState({status: InstanceStatus.DELETED, message: '', cpu: 0, memory: 0}));

        } else {
          logger.info(`Could not find k8s instance ${computeId}`);
        }
      
      } else {
        logger.info(`Instance with id ${instance.id} does not have an associated compute Id. Ignoring delete action`);
      }

    } catch (error) {
      logger.error(`Error deleting instance with Id ${instance.id}: ${error.message}`);
      throw error;
    }
  }
}

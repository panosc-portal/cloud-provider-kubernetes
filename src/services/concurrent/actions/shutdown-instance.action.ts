import { InstanceCommand } from '../../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes/k8s-instance.service';
import { logger } from '../../../utils';

export class ShutdownInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand, instanceService: InstanceService, k8sInstanceService: K8sInstanceService, listener: InstanceActionListener) {
    super(instanceCommand, instanceService, k8sInstanceService, listener);
  }

  protected async _run(): Promise<void> {
    const instance = this.instance;

    try {
      const computeId = instance.computeId;
      const namespace = instance.namespace;
      if (computeId != null && namespace != null) {
        const k8sInstance = await this.k8sInstanceService.get(computeId, namespace);
        if (k8sInstance != null) {
          logger.info(`Shutting down instance ${instance.id}: deleting current k8s instance`);
          await this._deleteK8sInstance(computeId, namespace);

          instance.computeId = null;
          instance.namespace = null;

          await this.instanceService.save(instance);

        } else {
          logger.info(`Could not find k8s instance with ${computeId}`);
        }
      
      } else {
        logger.info(`Instance with id ${instance.id} does not have an associated compute Id. Ignoring shutdown action`);
      }

    } catch (error) {
      logger.error(`Error shutting down instance with Id ${instance.id}: ${error.message}`);
      throw error;
    }
  }
}

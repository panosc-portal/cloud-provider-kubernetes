import { InstanceCommand, InstanceState, InstanceStatus } from '../../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes/k8s-instance.service';
import { logger } from '../../../utils';

export class StateInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand, instanceService: InstanceService, k8sInstanceService: K8sInstanceService, listener: InstanceActionListener) {
    super(instanceCommand, instanceService, k8sInstanceService, listener);
  }

  protected async _run(): Promise<void> {
    const instance = this.instance;
    const currentInstanceStatus = instance.status;

    try {
      const computeId = instance.computeId;

      if (computeId == null) {
        return;
      }

      // const k8sInstance = await this.k8sInstanceService.getByComputeId(computeId);
      const k8sInstance = null;
      let nextInstanceState: InstanceState;
      if (k8sInstance == null) {
        if (currentInstanceStatus !== InstanceStatus.REBOOTING && currentInstanceStatus !== InstanceStatus.STOPPING) {
          logger.warn(`K8S Instance with Id ${computeId} has been deleted on the server`);
        }

        nextInstanceState = new InstanceState({status: InstanceStatus.DELETED, message: ''});
      
      } else {
        nextInstanceState = new InstanceState({
          status: InstanceStatus[k8sInstance.state.status], 
          message: k8sInstance.state.message,
          // cpu: k8sInstance.currentCpu,
          // memory: k8sInstance.currentMemory
        });
      }

      if (currentInstanceStatus === InstanceStatus.REBOOTING && 
          (nextInstanceState.status === InstanceStatus.BUILDING || nextInstanceState.status === InstanceStatus.DELETED)) {
        nextInstanceState.status = InstanceStatus.REBOOTING;

      } else if (currentInstanceStatus === InstanceStatus.STARTING && nextInstanceState.status === InstanceStatus.BUILDING) {
        nextInstanceState.status = InstanceStatus.STARTING;

      } else if (currentInstanceStatus === InstanceStatus.STOPPING && nextInstanceState.status === InstanceStatus.DELETED) {
        nextInstanceState.status = InstanceStatus.STOPPED;

      } else if (currentInstanceStatus === InstanceStatus.DELETING && nextInstanceState.status === InstanceStatus.ACTIVE) {
        nextInstanceState.status = InstanceStatus.DELETING;
      
      } else if (currentInstanceStatus === InstanceStatus.BUILDING && nextInstanceState.status === InstanceStatus.ACTIVE) {
        // TODO Check ports are open
      }

      this._updateInstanceState(nextInstanceState);

    } catch (error) {
      throw error;
    }
  }
}

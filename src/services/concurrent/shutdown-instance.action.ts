import { InstanceCommand, K8sInstance, InstanceStatus } from '../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../instance.service';
import { K8sInstanceService } from '../kubernetes/k8s-instance.service';

export class ShutdownInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand, instanceService: InstanceService, k8sInstanceService: K8sInstanceService, listener: InstanceActionListener) {
    super(instanceCommand, instanceService, k8sInstanceService, listener);
  }

  protected async _run(): Promise<void> {
    const instance = this.instance;

    try {
      const computeId = instance.computeId;
      // const k8sInstance = await this.k8sInstanceService.getByComputeId(computeId);


      await this.instanceService.save(instance);
    } catch (error) {
      throw error;
    }
  }
}

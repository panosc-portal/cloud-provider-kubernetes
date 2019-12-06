import { InstanceCommand, K8sInstance, InstanceStatus } from '../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../instance.service';
import { K8sInstanceService } from '../kubernetes/k8s-instance.service';

export class CreateInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand, instanceService: InstanceService, k8sInstanceService: K8sInstanceService, listener: InstanceActionListener) {
    super(instanceCommand, instanceService, k8sInstanceService, listener);
  }

  protected async _run(): Promise<void> {
    const instance = this.instance;

    try {
      // Update instance state
      instance.status = InstanceStatus.BUILDING;
      await this.instanceService.save(instance);

      const k8sInstance = await this.k8sInstanceService.createK8sInstance(instance);
      instance.computeId = k8sInstance.computeId;

      // TODO Get status of k8sInstance and set in instance

      await this.instanceService.save(instance);
    } catch (error) {
      throw error;
    }
  }
}

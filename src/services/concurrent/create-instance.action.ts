import { InstanceCommand, K8sInstance, InstanceStatus } from '../../models';
import { InstanceAction } from './instance.action';
import { InstanceService } from '../instance.service';
import { K8sInstanceService } from '../k8sInstance.service';

export class CreateInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand, instanceService: InstanceService, k8sInstanceService: K8sInstanceService) {
    super(instanceCommand, instanceService, k8sInstanceService);
  }

  protected _run(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const instance = this.instance;

      // Update instance state
      instance.status = InstanceStatus.BUILDING;
      await this.instanceService.save(instance);

      this.k8sInstanceService
        .createK8sInstance(instance)
        .then(async k8sInstance => {
          instance.computeId = k8sInstance.computeId;

          // TODO Get status of k8sInstance and set in instance

          await this.instanceService.save(instance);

          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

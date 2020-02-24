import { Job } from './job';
import { job, jobInject } from './job-provider';
import { InstanceService } from '../instance.service';
import { logger } from '../../utils';
import { K8sInstanceService } from '../kubernetes';

@job()
export class K8sCleanupJob extends Job {
  @jobInject('services.K8sInstanceService')
  private _k8sInstanceService: K8sInstanceService;

  @jobInject('services.InstanceService')
  private _instanceService: InstanceService;

  protected async _execute(params?: any): Promise<any> {
    const validInstances = await this._instanceService.getAllNamespaceComputeIds();

    const result = await this._k8sInstanceService.cleanup(validInstances);

    if (result.deploymentCount > 0 || result.serviceCount > 0) {
      logger.info(`K8S Cleanup: deleted ${result.deploymentCount} deployments and ${result.serviceCount} services`);
    }
  }
}

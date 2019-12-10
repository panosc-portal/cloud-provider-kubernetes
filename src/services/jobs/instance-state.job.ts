import { Job } from "./job";
import { InstanceActionService } from "../concurrent";
import { job, jobInject } from "./job-provider";
import { InstanceService } from "../instance.service";
import { logger } from "../../utils";

@job()
export class InstanceStateJob extends Job {

  @jobInject('services.InstanceActionService')
  private _instanceActionService: InstanceActionService;

  @jobInject('services.InstanceService')
  private _instanceService: InstanceService;

  protected _execute(params?: any) {
    if (params && params.states) {
      logger.info(`Running job with parameters = ${params.states}`);

    } else {
      logger.info(`Running job without parameters`);
    }
  }
}
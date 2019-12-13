import { bind, BindingScope, Application, inject, CoreBindings, lifeCycleObserver } from "@loopback/core";
import * as fs from 'fs';
import { logger } from "../utils";
import { JOB_PROVIDER } from "./jobs/job-provider";
import { CronJob } from "cron";
import { Job } from "./jobs/job";

interface JobConfigInjection {
  key: string,
  className: string
}

interface JobConfig {
  name: string,
  jobClass: string,
  cronExpression: string,
  injections: JobConfigInjection[],
  params: any
}

@bind({ scope: BindingScope.SINGLETON })
@lifeCycleObserver('server')
export class SchedulerService {

  private _jobs: Map<string, CronJob> = new Map();

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private _application?: Application) {
  }

  async start(): Promise<void> {
    return this.init();
  }

  async stop(): Promise<void> {
    this._jobs.forEach((cronJob, jobName) => {
      cronJob.stop();
    });
    this._jobs.clear();
  }

  async init(): Promise<void> {
    try {
      const jobConfigs = await this.readConfig();

      if (jobConfigs) {
        jobConfigs.forEach(async (jobConfig) => {

          // Instantiate job runner
          const jobClass = JOB_PROVIDER.get(jobConfig.jobClass);
          if (jobClass != null) {
            const jobRunner = new jobClass.class() as Job;
            let jobIsOk = true;
  
            // Inject dependencies
            for (const dependency in jobClass.dependencies) {
              const injectionIdentifier = jobClass.dependencies[dependency];
              const injection = await this._application.get(injectionIdentifier);
              if (injection != null) {
                jobRunner[dependency] = injection;

              } else {
                jobIsOk = false;
                console.error(`Dependency '${injectionIdentifier}' in Job class '${jobConfig.jobClass}' could not be found`);
              }
            }
    
            if (jobIsOk) {
              const cronJob = new CronJob(jobConfig.cronExpression, () => jobRunner.run(jobConfig.params));
              this._jobs.set(jobConfig.name, cronJob);
              cronJob.start();
            }
          
          } else {
            console.error(`Job class '${jobConfig.jobClass}' specified in scheduler config does not exist`);
          }
        });
      }

    } catch (error) {
      throw error;
    }
  }

  readConfig(): Promise<JobConfig[]> {
    return new Promise((resolve, reject) => {
      const configFile = process.env.CLOUD_PROVIDER_K8S_SCHEDULER_CONFIG || 'resources/scheduler.config.json';
      if (fs.existsSync(configFile)) {
        fs.readFile(configFile, (err, data) => {
          if (err) {
            logger.error(`Unable to read scheduler config file '${configFile}': ${err.message}`);
            reject(err);
    
          } else {
            const config = JSON.parse(data.toString());
            const jobConfigs = config.jobs as JobConfig[];
    
            resolve(jobConfigs);
          }
        });
      
      } else {
        logger.warn(`No scheduler config file has been provided`);
        resolve(null);
      }
    });
  }
}
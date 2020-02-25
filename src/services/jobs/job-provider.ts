
export class JobClassDescriptor {
  class: any;
  dependencies: any = {};
}

class JobProvider {
  private _jobClassDescriptors: Map<string, JobClassDescriptor> = new Map();;

  public create(className: string) {
    const jobClassDescriptor = new JobClassDescriptor();
    this._jobClassDescriptors.set(className, jobClassDescriptor);
    return jobClassDescriptor;
  }

  public get(className: string): JobClassDescriptor {
    return this._jobClassDescriptors.get(className);
  }
}

export const JOB_PROVIDER = new JobProvider();

export function job() {
  return function(target: Function) {
    let jobClassDescriptor = JOB_PROVIDER.get(target.name);
    jobClassDescriptor = jobClassDescriptor || JOB_PROVIDER.create(target.name);

    jobClassDescriptor.class = target;
  };
}

export function jobInject(injectionIdentifier: string) {
  return function(target: Object, propertyName: string) {
    const className = target.constructor.name;
    let jobClassDescriptor = JOB_PROVIDER.get(className);
    jobClassDescriptor = jobClassDescriptor ||JOB_PROVIDER.create(className);

    jobClassDescriptor.dependencies[propertyName] = injectionIdentifier;
  };
}

export class K8sDeployment {
  get name(): string {
    return this.isValid() ? this._k8sResponse.metadata.name : null;
  }

  get statuses(): any {
    return this.isValid() ? this._k8sResponse.status.conditions : null;
  }

  get currentStatus(): any {
    if (this.isValid()) {
      if (this._k8sResponse.status.conditions) {
        const statuses = this._k8sResponse.status.conditions;

        const mostRecentObjects = statuses.filter(e => {
          const d = new Date(e.lastTransitionTime);
          return d.getTime() == mostRecentDate.getTime();
        });

        const mostRecentDate = new Date(Math.max.apply(null, statuses.map(e => {
          return new Date(e.lastTransitionTime);
        })));

        if (mostRecentObjects.length >= 1) {
          for (const object of mostRecentObjects) {
            if (mostRecentObjects.hasOwnProperty(object)) {
              if (object.status === 'True') {
                return { value: object.type, message: object.message };
              }
            }
          }
        }
      }
    }
    return null;
  }

  constructor(private _k8sResponse: any) {
  }

  isValid() {
    return (
      this._k8sResponse != null &&
      this._k8sResponse.kind != null &&
      this._k8sResponse.kind === 'Deployment' &&
      this._k8sResponse.metadata != null &&
      this._k8sResponse.metadata.name != null
    );
  }
}

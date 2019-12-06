export class K8sDeployment {
  get name(): string {
    return this.isValid() ? this._k8sResponse.metadata.name : null;
  }

  get statuses(): any {
    return this.isValid() ? this._k8sResponse.status.conditions : null;
  }

  get containers(): any {
    return this.isValid() ? this._k8sResponse.spec.template.spec.containers : null;
  }


  get ports() {
    if (this.isValid()) {
      const deploymentPorts = [];
      const containers = this._k8sResponse.spec.template.spec.containers;
      for (const container of containers) {
        const ports = container.ports;
        for (const port of ports) {
          deploymentPorts.push(port);
        }
      }
      return deploymentPorts;
    } else {
      return null;
    }
  }


  constructor(private _k8sResponse: any) {
  }

  isValid() {
    return (
      this._k8sResponse != null &&
      this._k8sResponse.kind != null &&
      this._k8sResponse.kind === 'Deployment' &&
      this._k8sResponse.metadata != null &&
      this._k8sResponse.metadata.name != null &&
      this._k8sResponse.spec != null &&
      this._k8sResponse.spec.template != null &&
      this._k8sResponse.spec.template.spec != null &&
      this._k8sResponse.spec.template.spec.container != null
    );
  }
}

export class K8sDeployment {
  get name(): string {
    return this.isValid() ? this._name : null;
  }

  get containers(): any {
    return this.isValid() ? this._k8sDeploymentResponse.spec.template.spec.containers : null;
  }


  get ports() {
    if (this.isValid()) {
      const deploymentPorts = [];
      const containers = this._k8sDeploymentResponse.spec.template.spec.containers;
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

  get labels() {
    return this.isValid() ? this._k8sDeploymentResponse.spec.template.metadata.labels : null;
  }

  get status() {
    return this.isValid() ? this._k8sDeploymentResponse.status : null;
  }

  get podStatus() {
    return this.hasPods() ? this._k8sPodListResponse.items[0].status : null;
  }

  get podCreationTime() {
    return this.hasPods() ? this._k8sPodListResponse.items[0].metadata.creationTimestamp : null;
  }

  get podNodeName(){
    return this.hasPods() ? this._k8sPodListResponse.items[0].spec.nodeName : null;
  }

  get podHostIP(){
    return this.hasPods() ? this._k8sPodListResponse.items[0].status.hostIP : null;
  }


  constructor(private _name: string, private _k8sDeploymentResponse: any, private _k8sPodListResponse: any) {
  }

  isValid() {
    return (
      this.isValidDeployment() &&
      this.isValidPods()
    );

  }

  isValidDeployment() {
    return (
      this._k8sDeploymentResponse != null &&
      this._k8sDeploymentResponse.kind != null &&
      this._k8sDeploymentResponse.kind === 'Deployment' &&
      this._k8sDeploymentResponse.metadata != null &&
      this._k8sDeploymentResponse.metadata.name != null &&
      this._k8sDeploymentResponse.metadata.name === this._name &&
      this._k8sDeploymentResponse.spec != null &&
      this._k8sDeploymentResponse.spec.template != null &&
      this._k8sDeploymentResponse.spec.template.spec != null &&
      this._k8sDeploymentResponse.spec.template.spec.containers != null &&
      this._k8sDeploymentResponse.spec.template.metadata != null &&
      this._k8sDeploymentResponse.spec.template.metadata.labels != null &&
      this._k8sDeploymentResponse.status != null

    );
  }

  isValidPods() {
    return (
      this._k8sPodListResponse != null &&
      this._k8sPodListResponse.kind != null &&
      this._k8sPodListResponse.kind === 'PodList' &&
      this._k8sPodListResponse.items != null
    );
  }

  hasPods(): boolean {
    return this._k8sPodListResponse.items.length > 0;
  }

}

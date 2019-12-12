export class K8sNode {

  constructor(private _k8sResponse: any) {
  }

  isValid() {
    return (
      this._k8sResponse != null &&
      this._k8sResponse.metadata != null &&
      this._k8sResponse.metadata.name != null &&
      this._k8sResponse.status != null &&
      this._k8sResponse.status.addresses != null &&
      this._k8sResponse.status.addresses[0] != null &&
      this._k8sResponse.status.addresses[0].address != null
    );
  }

  isMaster() {
    return (
      this._k8sResponse.spec.traits != null &&
      this._k8sResponse.spec.traits[0] != null &&
      this._k8sResponse.spec.traits[0].key === 'node-role.kubernetes.io/master'
    );
  }

  get name() {
    return this.isValid() ? this._k8sResponse.metadata.name : null;
  }


  get hostname() {
    return this.isValid() ? this._k8sResponse.status.addresses[0].address : null;
  }

  get cpuCapacity() {
    return this.isValid() ? this._k8sResponse.status.capacity.cpu : null;
  }

  get cpuAllocatable() {
    return this.isValid() ? this._k8sResponse.status.allocatable.cpu : null;
  }

  get memoryCapacity() {
    return this.isValid() ? this._k8sResponse.status.capacity.memory : null;
  }

  get memoryAllocatable() {
    return this.isValid() ? this._k8sResponse.status.allocatable.memory : null;
  }
}
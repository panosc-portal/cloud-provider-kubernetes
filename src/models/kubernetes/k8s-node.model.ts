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
      this._k8sResponse.status.addresses[0].address != null &&
      this._k8sResponse.status.capacity.memory &&
      this._k8sResponse.status.allocatable.memory &&
      this._k8sResponse.status.capacity.cpu &&
      this._k8sResponse.status.allocatable.cpu


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
    return this.isValid() ? this._k8sResponse.status.addresses[1].address : null;
  }

  get cpuCapacity() {
    return this.isValid() ? Number(this._k8sResponse.status.capacity.cpu) : null;
  }

  get cpuAllocatable() {
    return this.isValid() ? Number(this._k8sResponse.status.allocatable.cpu) : null;
  }

  get memoryCapacityMB() {
    return this.isValid() ? this.verifyMemory(this._k8sResponse.status.capacity.memory) : null;
  }

  get memoryAllocatableMB() {
    return this.isValid() ? this.verifyMemory(this._k8sResponse.status.allocatable.memory) : null;
  }

  verifyMemory(memoryString) {
    if (memoryString.endsWith('Ki')) {
      return parseInt(String(memoryString.slice(0, -2) / 1024), 10);
    } else if (memoryString.endsWith('Mi')) {
      return parseInt(memoryString.slice(0, -2), 10);
    } else {
      return null;
    }
  }
}

export class K8sNode {

  constructor(private _k8sResponse: any) {
  }

  isValid() {
    return (
      this._k8sResponse != null &&
      this._k8sResponse.metadata != null &&
      this._k8sResponse.metadata.name != null &&
      this._k8sResponse.status != null &&
      this._k8sResponse.status.addresses[0] != null &&
      this._k8sResponse.status.addresses[0].address != null


    );
  }

  get name() {
    return this.isValid() ? this._k8sResponse.metadata.name : null;
  }

  get address() {
    return this.isValid() ? this._k8sResponse.status.addresses[1].address : null;
  }
}
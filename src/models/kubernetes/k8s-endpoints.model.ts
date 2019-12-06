export class K8sEndpoints {

  constructor(private _k8sResponse: any) {
  }

  isValid() {
    return (
      this._k8sResponse != null &&
      this._k8sResponse.kind != null &&
      this._k8sResponse.kind === 'Endpoints' &&
      this._k8sResponse.metadata != null &&
      this._k8sResponse.metadata.name != null &&
      this._k8sResponse.subsets != null &&
      this._k8sResponse.subsets[0] != null &&
      this._k8sResponse.subsets[0].ports != null &&
      this._k8sResponse.subsets[0].addresses != null
    );
  }

  get name(): string {
    return this.isValid() ? this._k8sResponse.metadata.name : null;
  }

  get subsets(): any {
    return this.isValid() ? this._k8sResponse.subsets : null;
  }
}
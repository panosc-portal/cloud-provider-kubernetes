export class K8sService {
  get name(): string {
    return this.isValid() ? this._k8sServiceResponse.metadata.name : null;
  }

  get ports(): any[] {
    return this.isValid() ? this._k8sServiceResponse.spec.ports : null;
  }

  get selectorLabel() {
    return this.isValid() ? this._k8sServiceResponse.spec.selector : null;
  }

  constructor(private _k8sServiceResponse: any, private _k8sEndpointResponse: any) {
  }

  isValid() {
    return (
      this._k8sServiceResponse != null &&
      this._k8sServiceResponse.kind != null &&
      this._k8sServiceResponse.kind === 'Service' &&
      this._k8sServiceResponse.metadata != null &&
      this._k8sServiceResponse.metadata.name != null &&
      this._k8sServiceResponse.spec != null &&
      this._k8sServiceResponse.spec.ports != null &&
      this._k8sServiceResponse.spec.ports[0].name != null &&
      this._k8sServiceResponse.spec.ports[0].port != null &&
      this._k8sServiceResponse.spec.ports[0].nodePort != null &&
      this._k8sEndpointResponse != null &&
      this._k8sEndpointResponse.kind != null &&
      this._k8sEndpointResponse.kind === 'Endpoints' &&
      this._k8sEndpointResponse.metadata != null &&
      this._k8sEndpointResponse.metadata.name != null &&
      this._k8sEndpointResponse.subsets != null &&
      this._k8sEndpointResponse.subsets[0] != null &&
      this._k8sEndpointResponse.subsets[0].ports != null &&
      this._k8sEndpointResponse.subsets[0].addresses != null

    );
  }

  getPort(name: string): any {
    if (this.isValid()) {
      const portSpec = this._k8sServiceResponse.spec.ports.find((port: any) => port.name === name);
      return portSpec;
    } else {
      return null;
    }
  }

  get endpoints(): any {
    return this.isValid() ? this._k8sEndpointResponse.subsets : null;
  }


}

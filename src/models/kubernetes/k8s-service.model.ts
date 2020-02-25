export class K8sService {
  get name(): string {
    return this.isValid() ? this._name : null;
  }

  get ports(): any[] {
    return this.isServiceValid() ? this._k8sServiceResponse.spec.ports : null;
  }

  get selectorLabel() {
    return this.isServiceValid() ? this._k8sServiceResponse.spec.selector : null;
  }

  constructor(private _name: string, private _k8sServiceResponse: any, private _k8sEndpointResponse: any) {
  }

  isValid() {
    return (
      this.isEndpointValid() &&
      this._k8sEndpointResponse == null ? true : this.isServiceValid()
    );
  }

  isServiceValid() {
    return (
      this._k8sServiceResponse != null &&
      this._k8sServiceResponse.kind != null &&
      this._k8sServiceResponse.kind === 'Service' &&
      this._k8sServiceResponse.metadata != null &&
      this._k8sServiceResponse.metadata.name != null &&
      this._k8sServiceResponse.metadata.name === this._name &&
      this._k8sServiceResponse.spec != null &&
      this._k8sServiceResponse.spec.ports != null &&
      this._k8sServiceResponse.spec.ports[0].name != null &&
      this._k8sServiceResponse.spec.ports[0].port != null &&
      this._k8sServiceResponse.spec.ports[0].nodePort != null
    );
  }

  isEndpointValid() {
    return (
      this._k8sEndpointResponse != null &&
      this._k8sEndpointResponse.kind != null &&
      this._k8sEndpointResponse.kind === 'Endpoints' &&
      this._k8sEndpointResponse.metadata != null &&
      this._k8sEndpointResponse.metadata.name != null &&
      this._k8sEndpointResponse.metadata.name === this._name
    );
  }

  getPort(name: string): any {
    if (this.isServiceValid()) {
      const portSpec = this._k8sServiceResponse.spec.ports.find((port: any) => port.name === name);
      return portSpec;
    } else {
      return null;
    }
  }

  hasEndpointData(): boolean {
    return this._k8sEndpointResponse != null;
  }

  get endpoint(): any {
    return this.isEndpointValid() ? this._k8sEndpointResponse.subsets : null;
  }


}

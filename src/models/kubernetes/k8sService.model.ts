export class K8sService {
  get name(): string {
    return this.isValid() ? this._k8sResponse.metadata.name : null;
  }

  get ports(): any[] {
    return this.isValid() ? this._k8sResponse.spec.ports : null;
  }

  constructor(private _k8sResponse: any) {}

  isValid() {
    return (
      this._k8sResponse != null &&
      this._k8sResponse.kind != null &&
      this._k8sResponse.kind === 'Service' &&
      this._k8sResponse.metadata != null &&
      this._k8sResponse.metadata.name != null &&
      this._k8sResponse.spec != null &&
      this._k8sResponse.spec.ports != null
    );
  }

  getPort(name: string): any {
    if (this.isValid()) {
      const portSpec = this._k8sResponse.spec.ports.find(port => port.name === name);
      return portSpec;
    } else {
      return null;
    }
  }
}

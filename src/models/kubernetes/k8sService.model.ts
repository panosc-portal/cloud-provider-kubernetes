export class K8sService {

  k8sResponse: any;

  name: string;

  port: object;

  isValid() {
    return this.k8sResponse != null && this.name != null && this.port != null;

  }

  constructor(k8sResponse: any) {
    this.k8sResponse = k8sResponse;
    if (k8sResponse.kind != null && k8sResponse.kind === 'Service') {
      if (k8sResponse.metadata) {
        this.name = k8sResponse.metadata.name;
      }
      if (k8sResponse.spec) {
        this.port = k8sResponse.spec.ports[0]
      }
    }
  }
}

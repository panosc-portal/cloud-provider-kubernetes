export class K8sNamespace {

  k8sResponse: any;

  name: string;

  isValid() {
    return this.k8sResponse != null && this.name != null;
  }

  constructor(k8sResponse: any) {
    this.k8sResponse = k8sResponse;
    if (k8sResponse.kind != null && k8sResponse.kind === 'Namespace') {
      if (k8sResponse.metadata) {
        this.name = k8sResponse.metadata.name;
      }
    }
  }
}
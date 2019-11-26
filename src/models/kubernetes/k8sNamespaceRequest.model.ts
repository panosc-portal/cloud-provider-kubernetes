export class K8sNamespaceRequest {

  name: string;

  model: object;

  constructor(name: string) {
    this.name = name;
    this.model = {
      'apiVersion': 'v1',
      'kind': 'Namespace',
      'metadata': {
        'name': this.name,
      },
    };
  }
}


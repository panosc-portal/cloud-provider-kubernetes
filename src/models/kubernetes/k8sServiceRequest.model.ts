export class K8sServiceRequest {

  model: object;

  private _name: string;

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  constructor(name: string) {
    this.name = name;
    this.model = {
      'apiVersion': 'v1',
      'kind': 'Service',
      'metadata': {
        'name': this._name,
        'labels': {
          'app': this._name,
        },
      },
      'spec': {
        'type': 'NodePort',
        'ports': [
          {
            'name': 'xrdp',
            'port': 3389,
          },
        ],
        'selector': {
          'app': this._name,
        },
      },
    };
  }
}


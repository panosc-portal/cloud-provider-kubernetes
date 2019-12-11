export class K8sServiceRequest {
  private _model: object;

  get name(): string {
    return this._name;
  }

  get model(): any {
    return this._model;
  }

  constructor(private _name: string) {
    this._model = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: this._name,
        labels: {
          app: this._name
        }
      },
      spec: {
        type: 'NodePort',
        ports: [
          {
            name: 'rdp',
            port: 3389
          }
        ],
        selector: {
          app: this._name
        }
      }
    };
  }
}

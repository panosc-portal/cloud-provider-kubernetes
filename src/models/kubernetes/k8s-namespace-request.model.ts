export class K8sNamespaceRequest {
  private _model: any;

  get name(): string {
    return this._name;
  }

  get model(): any {
    return this._model;
  }

  constructor(private _name: string) {
    this._model = {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: this._name
      }
    };
  }
}

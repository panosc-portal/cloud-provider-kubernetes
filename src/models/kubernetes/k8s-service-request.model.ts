import { Image } from "../domain";

export interface K8sServiceRequestConfig {
  name: string,
  image: Image,
}

export class K8sServiceRequest {
  private _model: object;

  get name(): string {
    return this._config.name;
  }

  get model(): any {
    return this._model;
  }

  constructor(private _config: K8sServiceRequestConfig) {
    this._model = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: this._config.name,
        labels: {
          app: this._config.name
        }
      },
      spec: {
        type: 'NodePort',
        ports: _config.image.protocols.map(protocol => { return {name: protocol.name, port: protocol.port}}),
        selector: {
          app: this._config.name
        }
      }
    };
  }
}

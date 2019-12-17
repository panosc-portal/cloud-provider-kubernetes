import { Image } from "../domain";
import { logger } from "../../utils";
import { APPLICATION_CONFIG } from "../../application-config";

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
    if (_config.image.protocols.length === 0) {
      logger.warn(`Image ${this._config.name} does not have any protocols`);
    }
    this._model = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: this._config.name,
        labels: {
          app: this._config.name,
          owner: APPLICATION_CONFIG.kubernetes.ownerLabel
        }
      },
      spec: {
        type: 'NodePort',
        ports: _config.image.protocols.map(protocol => { return {name: protocol.name.toLowerCase(), port: protocol.port}}),
        selector: {
          app: this._config.name
        }
      }
    };
  }
}

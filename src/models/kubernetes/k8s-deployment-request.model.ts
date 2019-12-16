import { Image, Flavour } from '../domain';

export interface K8sDeploymentRequestConfig {
  name: string,
  image: Image,
  flavour: Flavour
}

export class K8sDeploymentRequest {
  private _model: any;

  get name(): string {
    return this._config.name;
  }

  get model(): any {
    return this._model;
  }

  constructor(private _config: K8sDeploymentRequestConfig) {
    this._model = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: this._config.name,
        labels: {
          app: this._config.name,
          owner: 'cloud-provider'
        }
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: this._config.name
          }
        },
        template: {
          metadata: {
            labels: {
              app: this._config.name
            }
          },
          spec: {
            containers: [
              {
                name: this._config.name,
                image: this._config.image.path,
                ports: this._config.image.protocols.map(protocol => {
                  return { name: protocol.name.toLowerCase(), containerPort: protocol.port };
                }),
                resources: {
                  limits: {
                    cpu: `${this._config.flavour.cpu}`,
                    memory: `${this._config.flavour.memory}Mi`
                  },
                  requests: {
                    cpu: `${this._config.flavour.cpu}`,
                    memory: `${this._config.flavour.memory}Mi`
                  }
                }
              }
            ]
          }
        }
      }
    };
  }
}

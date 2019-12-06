export interface K8sDeploymentRequestConfig {
  name: string,
  image: string,
  memory: number,
  cpu: number
}

export class K8sDeploymentRequest {
  private _model: any;

  get name(): string {
    return this._config.name;
  }

  get image(): string {
    return this._config.image;
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
          app: this._config.name
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
                image: this._config.image,
                ports: [
                  {
                    containerPort: 3389
                  }
                ],
                resources: {
                  limits: {
                    cpu: `${this._config.cpu}m`,
                    memory: `${this._config.memory}Mi`
                  },
                  requests: {
                    cpu: `${this._config.cpu}m`,
                    memory: `${this._config.memory}Mi`
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

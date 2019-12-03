export class K8sDeploymentRequest {
  private _model: any;

  get name(): string {
    return this._name;
  }

  get image(): string {
    return this._image;
  }

  get model(): any {
    return this._model;
  }

  constructor(
    private _name: string,
    private _image: string,
    private _cpuLimit: number,
    private _cpuRequest: number,
    private _memoryLimit: number,
    private _memoryRequest: number
  ) {
    this._model = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: this._name,
        labels: {
          app: this._name
        }
      },
      spec: {
        selector: {
          app: this._name
        },
        replicas: 1,
        template: {
          metadata: {
            labels: {
              app: this._name
            }
          },
          spec: {
            containers: [
              {
                name: 'test',
                image: this._image,
                ports: [
                  {
                    containerPort: 3389
                  }
                ],
                resources: {
                  limits: {
                    cpu: `${this._cpuLimit}m`,
                    memory: `${this._memoryLimit}Mi`
                  },
                  requests: {
                    cpu: `${this._cpuRequest}m`,
                    memory: `${this._memoryRequest}Mi`
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

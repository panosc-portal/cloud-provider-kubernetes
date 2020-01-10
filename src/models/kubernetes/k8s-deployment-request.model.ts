import { Image, Flavour, InstanceUser } from '../domain';
import { APPLICATION_CONFIG } from '../../application-config';
import { IK8SRequestHelper, K8SRequestHelperLoader } from '../../utils';

export interface K8sDeploymentRequestConfig {
  name: string,
  image: Image,
  flavour: Flavour,
  user: InstanceUser,
  imagePullSecret?: string,
  helper?: IK8SRequestHelper
}

export class K8sDeploymentRequest {
  private _model: any;

  get name(): string {
    return this._config.name;
  }

  get model(): any {
    return this._model;
  }

  getEnvVars(helper: IK8SRequestHelper, image: Image, user: InstanceUser): any {
    const envVars = {};
    if (image.envVars) {
      // Get env vars from image
      image.envVars.forEach(envVar => envVars[envVar.name] = envVar.value);
    }

    if (helper) {
      // Get env vars from helper
      const helperEnvVars = helper.getEnvVars(image, user);
      if (helperEnvVars) {
        // Add or override env var
        helperEnvVars.forEach(envVar => envVars[envVar.name] = envVar.value);
      }
    }

    const envVarArray = Object.keys(envVars).map(key => ({name: key, value: envVars[key]}));
    return envVarArray;
  }

  constructor(private _config: K8sDeploymentRequestConfig) {
    this._model = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: this._config.name,
        labels: {
          app: this._config.name,
          owner: APPLICATION_CONFIG().kubernetes.ownerLabel
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
                image: this._config.image.repository ? `${this._config.image.repository}/${this._config.image.path}` : this._config.image.path,
                ports: this._config.image.protocols.map(imageProtocol => {
                  return { name: imageProtocol.protocol.name.toLowerCase(), containerPort: imageProtocol.port };
                }),
                command: this._config.image.command ? [this._config.image.command] : undefined,
                args: this._config.image.args ? this._config.image.args.split(',') : undefined,
                env: this.getEnvVars(this._config.helper, this._config.image, this._config.user),
                volumeMounts: this._config.image.volumes ? this._config.image.volumes.map(volume => ({
                  mountPath: volume.path,
                  name: volume.name,
                  readOnly: volume.readonly
                })) : undefined,
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
            ],
            imagePullSecrets: this._config.imagePullSecret != null ? [{ name: this._config.imagePullSecret }] : [],
            volumes: this._config.helper ? this._config.helper.getVolumes(this._config.image, this._config.user) : undefined
          }
        }
      }
    };
  }
}

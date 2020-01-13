import { Image, Flavour, InstanceUser } from '../domain';
import { APPLICATION_CONFIG } from '../../application-config';
import { IK8SRequestHelper } from '../../utils';

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

  getEnvVars(): any {
    const envVars = {};
    if (this._config.image.envVars) {
      // Get env vars from image
      this._config.image.envVars.forEach(envVar => envVars[envVar.name] = envVar.value);
    }

    if (this._config.helper && this._config.helper.getEnvVars) {
      // Get env vars from helper
      const helperEnvVars = this._config.helper.getEnvVars(this._config.image, this._config.user);
      if (helperEnvVars) {
        // Add or override env var
        helperEnvVars.forEach(envVar => envVars[envVar.name] = envVar.value);
      }
    }

    const envVarArray = Object.keys(envVars).map(key => ({ name: key, value: envVars[key] }));
    return envVarArray;
  }

  isValid(): boolean {
    const volumeMounts = this._model.spec.template.spec.containers[0].volumeMounts.length !> 0 ? this._model.spec.template.spec.containers[0].volumeMounts : null;
    const volumes = this._model.spec.template.spec.volumes != undefined ? this._model.spec.template.spec.volumes : null;

    if (volumeMounts) {
      if (volumes) {
        let validVolumes = true;
        let validName = true;

        // verify that each volume as a name, path and type attributes and verify if volumes name are valid
        for (const volume of volumes) {
          const namePattern = RegExp(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/);
          if (('name' in volume && 'hostPath' in volume && 'path' in volume.hostPath && 'type' in volume.hostPath)) {
            validName = namePattern.test(volume.name);
            if (!validName) {
              break;
            }
          } else {
            validVolumes = false;
            break;
          }
        }
        if (!validVolumes || !validName) {
          return false;
        }

        // verify that all volumeMounts have a volume
        volumeMounts.forEach((volumeMount) => {
          const match = volumes.find((volume) => volume.name == volumeMount.name);
          if (!match) {
            return false;
          }
        });
      } else {
        return false;
      }
    }
    return true;
  }

  getSecurityContext(): any {
    const helperRunAsUID = (this._config.helper && this._config.helper.getRunAsUID) ? this._config.helper.getRunAsUID(this._config.image, this._config.user) : null;
    const imageRunAsUID = this._config.image.runAsUID;

    const runAsUID = helperRunAsUID ? helperRunAsUID : imageRunAsUID;
    return (runAsUID != null) ? {
      runAsUser: runAsUID
    } : undefined;
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
                env: this.getEnvVars(),
                volumeMounts: this._config.image.volumes ? this._config.image.volumes.map(volume => ({
                  mountPath: volume.path,
                  name: volume.name,
                  readOnly: volume.readonly
                })) : undefined,
                securityContext: this.getSecurityContext(),
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
            volumes: (this._config.helper && this._config.helper.getVolumes) ? this._config.helper.getVolumes(this._config.image, this._config.user) : undefined
          }
        }
      }
    };
  }
}

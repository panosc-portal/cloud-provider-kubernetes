export interface K8sSecretRequestConfig {
  repository: string,
  username: string,
  password: string
}

export class K8sSecretRequest {
  private _name: string;
  private _model: any;

  get config(): K8sSecretRequestConfig {
    return this._config;
  }

  get name(): string {
    return this._name;
  }

  get model(): any {
    return this._model;
  }

  constructor(private _config: K8sSecretRequestConfig) {
    this._name = `${this._config.repository.replace(/\./g,'-')}-secret`

    // Fabricate an equivalent .dockerconfig file
    const dockerConfig = {
      auths: {
      }
    };
    dockerConfig.auths[this._config.repository] = {
      username: this._config.username,
      password: this._config.password,
      auth: Buffer.from(`${this._config.username}:${this._config.password}`).toString('base64')
    }
    const dockerConfigBase64 = Buffer.from(JSON.stringify(dockerConfig)).toString('base64');

    this._model = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: this._name,
      },
      type: 'kubernetes.io/dockerconfigjson',
      data: {
        '.dockerconfigjson': dockerConfigBase64
      }
    };
  }
}

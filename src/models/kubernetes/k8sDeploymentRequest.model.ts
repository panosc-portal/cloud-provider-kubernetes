export class K8sDeploymentRequest {


  model: object;

  private _name: string;

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }


  get image(): string {
    return this._image;
  }

  set image(value: string) {
    this._image = value;
  }

  private _image: string;


  constructor(name: string, image: string) {
    this.name = name;
    this.image = image;
    this.model = {
      'apiVersion': 'apps/v1',
      'kind': 'Deployment',
      'metadata': {
        'name': this._name,
        'labels': {
          'app': this._name,
        },
      },
      'spec': {
        'selector': {
          'matchLabels': {
            'app': this._name,
          },
        },
        'replicas': 1,
        'template': {
          'metadata': {
            'labels': {
              'app': this._name,
            },
          },
          'spec': {
            'containers': [
              {
                'name': 'test',
                'image': this._image,
                'ports': [
                  {
                    'containerPort': 3389,
                  },
                ],
              },
            ],
          },
        },
      },
    };
  }
}


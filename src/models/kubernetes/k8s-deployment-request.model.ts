import {Model, model, property} from '@loopback/repository';

@model()
export class K8sDeploymentRequest extends Model {


  @property({
    type: 'object',
    required: true,
  })
  modal: object;

  @property({
    type: 'string',
    required: true,
  }) private _name: string;

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

  @property({
    type: 'string',
    required: true,
  }) private _image: string;


  constructor(data?: Partial<K8sDeploymentRequest>) {
    super(data);
    this.modal = {
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


export interface K8SDeploymentRequestRelations {
  // describe navigational properties here
}

export type K8SDeploymentRequestWithRelations = K8sDeploymentRequest & K8SDeploymentRequestRelations;


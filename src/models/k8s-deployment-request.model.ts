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
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  image: string;


  constructor(data?: Partial<K8sDeploymentRequest>) {
    super(data);
    this.modal = {
      "apiVersion": "apps/v1",
      "kind": "Deployment",
      "metadata": {
        "name": this.name,
        "labels": {
          "app": "visa"
        }
      },
      "spec": {
        "selector": {
          "matchLabels": {
            "app": "visa"
          }
        },
        "replicas": 1,
        "template": {
          "metadata": {
            "labels": {
              "app": "visa"
            }
          },
          "spec": {
            "containers": [
              {
                "name": "visa",
                "image": this.image,
                "ports": [
                  {
                    "containerPort": 3389
                  }
                ],
              }
            ]
          }
        }
      }
    };
  }
}

export interface K8SDeploymentRequestRelations {
  // describe navigational properties here
}

export type K8SDeploymentRequestWithRelations = K8sDeploymentRequest & K8SDeploymentRequestRelations;


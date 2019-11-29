import { K8sDeployment } from './k8sDeployment.model';
import { K8sService } from './k8sService.model';

export class K8sInstance {
  get deployment(): K8sDeployment {
    return this._deployment;
  }

  get service(): K8sService {
    return this._service;
  }

  get computeId(): string{
    return this._computeId
  }

  constructor(private _deployment: K8sDeployment, private _service: K8sService, private _computeId: string) {}
}

import { K8sInstanceStatus } from '../enumerations/k8s-instance-status.enum';

export class K8sInstanceState {

  constructor(private _status: K8sInstanceStatus, private _message?: string) {
  }

  get status(): K8sInstanceStatus {
    return this._status;
  }

  get message(): string {
    return this._message;
  }
}
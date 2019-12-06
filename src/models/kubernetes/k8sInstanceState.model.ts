import { K8sInstanceStatus } from '../enumerations/k8sInstance-status.enum';

export class K8sInstanceState {

  constructor(private _status: K8sInstanceStatus, private _message?: string) {
  }

  get status(): K8sInstanceStatus {
    return this._status;
  }

  set status(value: K8sInstanceStatus) {
    this._status = value;
  }

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }
}
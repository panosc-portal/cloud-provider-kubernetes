import { K8sInstanceStatus } from '../enumerations';

export class K8sInstanceState {
  constructor(private _status: K8sInstanceStatus, private _message?: string) {}

  get status(): K8sInstanceStatus {
    return this._status;
  }

  get message(): string {
    return this._message;
  }
}

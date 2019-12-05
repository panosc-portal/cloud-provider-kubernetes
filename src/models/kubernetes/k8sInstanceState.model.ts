import { K8sServiceStatus } from '../enumerations/k8sService-status.enum';

export class K8sInstanceState {

  constructor(status, message?) {
    this._status = status;
    this._message = message;
  }

  private _status: K8sServiceStatus;

  private _message: string;

  get status(): K8sServiceStatus {
    return this._status;
  }

  get message(): string {
    return this._message;
  }

  set status(value: K8sServiceStatus) {
    this._status = value;
  }

  set message(value: string) {
    this._message = value;
  }
}
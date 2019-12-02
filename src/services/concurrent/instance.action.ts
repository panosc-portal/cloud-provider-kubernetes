import { InstanceCommand, Instance, InstanceCommandType } from '../../models';
import { InstanceService } from '../instance.service';
import { K8sInstanceService } from '../k8sInstance.service';

export abstract class InstanceAction {
  private _onTerminatedCallback: () => void;
  private _onErrorCallback: (message: any) => void;

  get instance(): Instance {
    return this._instanceCommand.instance;
  }

  get type(): InstanceCommandType {
    return this._instanceCommand.type;
  }

  get instanceService(): InstanceService {
    return this._instanceService;
  }

  get k8sInstanceService(): K8sInstanceService {
    return this._k8sInstanceService;
  }

  constructor(private _instanceCommand: InstanceCommand, private _instanceService: InstanceService, private _k8sInstanceService: K8sInstanceService) {}

  execute(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._run()
        .then(() => {
          this._onTerminated();
          resolve();
        })
        .catch(error => {
          this._onError(error);
          reject(error);
        });
    });
  }

  onTerminated(callback: () => void) {
    this._onTerminatedCallback = callback;
  }

  onError(callback: (message: any) => void) {
    this._onErrorCallback = callback;
  }

  private _onTerminated() {
    if (this._onTerminatedCallback != null) {
      this._onTerminatedCallback();
    }
  }

  private _onError(error: any) {
    if (this._onErrorCallback != null) {
      this._onErrorCallback(error);
    }
  }

  protected abstract _run(): Promise<void>;
}

import { InstanceCommand, Instance, InstanceCommandType } from '../../models';
import { InstanceService } from '../instance.service';
import { K8sInstanceService } from '../kubernetes/k8s-instance.service';

const noop = function() {};

export interface InstanceActionListener {
  onTerminated: (instanceAction: InstanceAction) => void;
  onError: (instanceAction: InstanceAction, error: any) => void;
}

export abstract class InstanceAction {

  private _listener: InstanceActionListener;

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

  constructor(private _instanceCommand: InstanceCommand, private _instanceService: InstanceService, private _k8sInstanceService: K8sInstanceService, listener: InstanceActionListener) {
    this._listener = listener != null ? listener : {onTerminated: noop, onError: noop};
  }

  execute(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._run()
        .then(() => {
          this._listener.onTerminated(this);
          resolve();
        })
        .catch(error => {
          this._listener.onError(this, error);
          reject(error);
        });
    });
  }

  protected abstract _run(): Promise<void>;
}

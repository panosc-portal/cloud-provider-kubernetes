import { InstanceCommand, Instance, InstanceCommandType, InstanceState, InstanceStatus, K8sInstance, ProtocolName, InstanceProtocol } from '../../../models';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes/k8s-instance.service';

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

  protected async _updateInstanceState(nextState: InstanceState) {
    const currentState = this.instance.state;
    
    const state = new InstanceState({
      status: nextState.status ? nextState.status : currentState.status,
      message: nextState.message ? nextState.message : currentState.message,
      cpu: nextState.cpu ? nextState.cpu : currentState.cpu,
      memory: nextState.memory ? nextState.memory : currentState.memory
    });

    this.instance.state = state;

    await this.instanceService.save(this.instance);
  }

  protected async _createK8sInstance(): Promise<K8sInstance> {
    const instance = this.instance;
    const k8sInstance = await this.k8sInstanceService.create(instance);

    // Get compute Id
    instance.computeId = k8sInstance.computeId;

    // Get status of k8sInstance and set in instance
    instance.state = new InstanceState({status: InstanceStatus[k8sInstance.state.status], message: k8sInstance.state.message});

    // Get IP Address
    instance.hostname = k8sInstance.hostname;

    // Get protocols
    instance.protocols = k8sInstance.protocols.map(k8sProtocol => 
      new InstanceProtocol({name: ProtocolName[k8sProtocol.name.toUpperCase()], port: k8sProtocol.externalPort}));

    await this.instanceService.save(instance);

    return k8sInstance;
  }

  protected async _deleteK8sInstance(computeId: string) {
    await this.k8sInstanceService.deleteWithComputeId(computeId);
  }

  protected abstract _run(): Promise<void>;
}

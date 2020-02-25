import { bind, BindingScope, inject } from '@loopback/core';
import { InstanceAction, InstanceActionListener, CreateInstanceAction, StateInstanceAction, StartInstanceAction, ShutdownInstanceAction, RebootInstanceAction, DeleteInstanceAction } from './actions';
import { InstanceService } from '../instance.service';
import { K8sInstanceService } from '../kubernetes';
import { InstanceActionPromiseQueue } from './instance-action-promise-queue';
import { InstanceCommand, InstanceCommandType } from '../../models';
import { logger } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceActionService implements InstanceActionListener {
  private _actions = new Map<number, InstanceActionPromiseQueue>();

  constructor(
    @inject('services.InstanceService') private _instanceService: InstanceService,
    @inject('services.K8sInstanceService') private _k8sInstanceService: K8sInstanceService) {}

  execute(instanceCommand: InstanceCommand): Promise<void> {
    let action: InstanceAction = null;
    if (instanceCommand.type === InstanceCommandType.CREATE) {
      action = new CreateInstanceAction(instanceCommand, this._instanceService, this._k8sInstanceService, this);

    } else if (instanceCommand.type === InstanceCommandType.STATE) {
      action = new StateInstanceAction(instanceCommand, this._instanceService, this._k8sInstanceService, this);

    } else if (instanceCommand.type === InstanceCommandType.START) {
      action = new StartInstanceAction(instanceCommand, this._instanceService, this._k8sInstanceService, this);

    } else if (instanceCommand.type === InstanceCommandType.SHUTDOWN) {
      action = new ShutdownInstanceAction(instanceCommand, this._instanceService, this._k8sInstanceService, this);

    } else if (instanceCommand.type === InstanceCommandType.REBOOT) {
      action = new RebootInstanceAction(instanceCommand, this._instanceService, this._k8sInstanceService, this);

    } else if (instanceCommand.type === InstanceCommandType.DELETE) {
      action = new DeleteInstanceAction(instanceCommand, this._instanceService, this._k8sInstanceService, this);
    }

    return this._queueAction(action);
  }

  private _queueAction(instanceAction: InstanceAction): Promise<void> {
    const instanceId = instanceAction.instanceId;

    let actionQueue = this._actions.get(instanceId);
    if (actionQueue == null) {
      actionQueue = new InstanceActionPromiseQueue(() => {
        logger.debug(`Deleting action queue for instance ${instanceId}`);
        this._actions.delete(instanceId);
      });
      this._actions.set(instanceId, actionQueue);
    }

    return actionQueue.add(instanceAction);
  }

  onTerminated(instanceAction: InstanceAction) {
    logger.debug(`Action ${instanceAction.type} successfully ran on instance ${instanceAction.instanceId}`);
  }

  onError(instanceAction: InstanceAction, error: any) {
    logger.error(`Action ${instanceAction.type} failed to run on instance ${instanceAction.instanceId}: ${error}`);
  };

}
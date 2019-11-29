import { bind, BindingScope } from '@loopback/core';
import { InstanceCommand, InstanceCommandType } from '../../models';
import { InstanceAction } from './instance.action';
import { CreateInstanceAction } from './create-instance.action';
import { logger } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceActionService {
  private _actions = new Map<number, Array<InstanceAction>>();

  constructor() {}

  queueCommand(instanceCommand: InstanceCommand): InstanceAction {
    let action: InstanceAction = null;
    if (instanceCommand.type === InstanceCommandType.CREATE) {
      action = new CreateInstanceAction(instanceCommand);
    }

    this.queueAction(action);

    return action;
  }

  queueAction(instanceAction: InstanceAction) {
    const instance = instanceAction.instance;

    let actionQueue = this._actions.get(instance.id);
    const doExecute = actionQueue == null;
    if (actionQueue == null) {
      actionQueue = [];
      this._actions.set(instance.id, actionQueue);
    }

    // Check action type doesn't already exist and add to queue if unique
    if (actionQueue.find(action => action.type === instanceAction.type) == null) {
      actionQueue.push(instanceAction);

      if (doExecute) {
        this.execute(instanceAction);
      }
    }
  }

  execute(instanceAction: InstanceAction) {
    instanceAction
      .execute()
      .then(() => {
        logger.info(`Action ${instanceAction.type} successfully ran on instance ${instanceAction.instance.id}`);
        // Remove action from queue and run next one if there is one
        this.removeActionAndRunNext(instanceAction);
      })
      .catch(error => {
        logger.error(`Action ${instanceAction.type} failed to run on instance ${instanceAction.instance.id}: ${error}`);
        // Remove action from queue and run next one if there is one
        this.removeActionAndRunNext(instanceAction);
      });
  }

  removeActionAndRunNext(instanceAction: InstanceAction) {
    // Remove from the queue
    const instance = instanceAction.instance;
    const actionQueue = this._actions.get(instance.id).filter(action => action !== instanceAction);

    if (actionQueue.length > 0) {
      this._actions.set(instance.id, actionQueue);

      // Run the first action in the queue
      this.execute(actionQueue[0]);
    } else {
      this._actions.delete(instance.id);
    }
  }
}

import { logger } from '../../utils';
import { InstanceAction } from './actions';

interface InstanceActionPromiseQueueItem {
  instanceAction: InstanceAction;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

const noop = function() {};

export class InstanceActionPromiseQueue {
  private _activeItem: InstanceActionPromiseQueueItem;
  private _queue: Array<InstanceActionPromiseQueueItem> = [];
  private _onEmpty: () => void;

  get isActive(): boolean {
    return this._activeItem != null;
  }

  get queueLength(): number {
    return this._queue.length;
  }

  constructor(onEmpty?: () => void) {
    this._onEmpty = onEmpty !== undefined ? onEmpty : noop;
  }

  add(instanceAction: InstanceAction): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // Check action type doesn't already exist and add to queue if unique
      if (
        !(this._activeItem != null && this._activeItem.instanceAction.type === instanceAction.type) &&
        this._queue.find(item => item.instanceAction.type === instanceAction.type) == null
      ) {
        this._queue.push({
          instanceAction: instanceAction,
          resolve: resolve,
          reject: reject
        });

        this._dequeue();
      } else {
        logger.debug(`Action ${instanceAction.type} is already queued for instance ${instanceAction.instanceId}`);
        reject(`Action ${instanceAction.type} is already queued for instance ${instanceAction.instanceId}`);
      }
    });
  }

  private _dequeue(): boolean {
    if (this._activeItem) {
      return false;
    }

    const item = this._queue.shift();
    if (!item) {
      this._onEmpty();
      return false;
    }

    this._activeItem = item;

    logger.debug(`Starting action ${item.instanceAction.type} on instance ${item.instanceAction.instanceId}`);
    item.instanceAction
      .execute()
      .then(value => {
        logger.debug(`Terminated action ${item.instanceAction.type} on instance ${item.instanceAction.instanceId}`);
        this._activeItem = null;
        item.resolve(value);
        this._dequeue();
      })
      .catch(error => {
        logger.debug(`Failed action ${item.instanceAction.type} on instance ${item.instanceAction.instanceId}`);
        this._activeItem = null;
        item.reject(error);
        this._dequeue();
      });

    return true;
  }
}

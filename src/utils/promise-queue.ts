type PromiseThunk = () => Promise<any>;

export interface PromiseQueueOptions {
  maxPendingPromises?: number;
  maxQueuedPromises?: number;
  onEmpty?: () => void;
}

interface PromiseQueueItem {
  promiseThunk: PromiseThunk;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

const noop = function() {};

export class PromiseQueue {
  private _pendingPromises = 0;
  private _queue: Array<PromiseQueueItem> = [];
  private _maxPendingPromises: number;
  private _maxQueuedPromises: number;
  private _onEmpty: () => void;

  get pendingLength(): number {
    return this._pendingPromises;
  }

  get queueLength(): number {
    return this._queue.length;
  }

  get maxPendingPromises(): number {
    return this._maxPendingPromises;
  }

  get maxQueuedPromises(): number {
    return this._maxQueuedPromises;
  }

  constructor(options?: PromiseQueueOptions) {
    options = options || {};
    this._maxPendingPromises = options.maxPendingPromises !== undefined ? options.maxPendingPromises : 1;
    this._maxQueuedPromises = options.maxQueuedPromises !== undefined ? options.maxQueuedPromises : Infinity;
    this._onEmpty = options.onEmpty !== undefined ? options.onEmpty : noop;
  }

  add(promiseThunk: PromiseThunk): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this._queue.length >= this._maxQueuedPromises) {
        reject(new Error('Queue limit reached'));
      }

      this._queue.push({
        promiseThunk: promiseThunk,
        resolve: resolve,
        reject: reject
      });

      this._dequeue();
    });
  }

  private _dequeue(): boolean {
    if (this._pendingPromises >= this._maxPendingPromises) {
      return false;
    }

    const item = this._queue.shift();
    if (!item) {
      this._onEmpty();
      return false;
    }

    try {
      this._pendingPromises++;

      item
        .promiseThunk()
        .then(value => {
          this._pendingPromises--;
          item.resolve(value);
          this._dequeue();
        })
        .catch(error => {
          this._pendingPromises--;
          item.reject(error);
          this._dequeue();
        });
    } catch (error) {
      this._pendingPromises--;
      item.reject(error);
      this._dequeue();
    }

    return true;
  }
}

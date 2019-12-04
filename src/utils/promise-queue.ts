type PromiseThunk = () => Promise<any>;


export interface PromiseQueueOptions {
  maxPendingPromises?: number,
  maxQueuedPromises?: number
}

interface PromiseQueueItem {
    promiseThunk: PromiseThunk;
    resolve: (value: any) => void;
    reject: (error: any) => void;
}

export class PromiseQueue {

  private _pendingPromises = 0;
  private _queue: Array<PromiseQueueItem> = [];

  get pendingLength(): number {
    return this._pendingPromises;
  }

  get queueLength(): number {
    return this._queue.length;
  }


  constructor(private _options?: PromiseQueueOptions) {
  }

  add(promiseThunk: PromiseThunk): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this._queue.length >= this._options.maxQueuedPromises) {
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
    if (this._pendingPromises >= this._options.maxPendingPromises) {
      return false;
    }

    const item = this._queue.shift();
    if (!item) {
      return false;
    }

    try {
      item.promiseThunk().then((value) => {
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
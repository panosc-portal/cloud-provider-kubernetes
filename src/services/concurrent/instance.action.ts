import { InstanceCommand, Instance, InstanceCommandType } from '../../models';

export abstract class InstanceAction {
  private _onTerminatedCallback: () => void;
  private _onErrorCallback: (message: any) => void;

  get instance(): Instance {
    return this._instanceCommand.instance;
  }

  get type(): InstanceCommandType {
    return this._instanceCommand.type;
  }

  constructor(protected _instanceCommand: InstanceCommand) {}

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

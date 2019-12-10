export abstract class Job {

  private _running = false;

  constructor() {
  }

  run(params?: any) {
    if (!this._running) {
      this._running = true;
      this._execute(params);
      this._running = false;
    }
  }

  protected abstract _execute(params?: any)
}
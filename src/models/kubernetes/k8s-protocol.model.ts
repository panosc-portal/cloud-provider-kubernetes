export class K8sProtocol {

  get name(): string {
    return this._name;
  }

  get internalPort(): number {
    return this._internalPort;
  }

  get externalPort(): number {
    return this._externalPort;
  }

  constructor(private _name: string, private _internalPort: number, private _externalPort: number) {
  }
}

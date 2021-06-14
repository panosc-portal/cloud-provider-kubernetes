
export class InstanceProtocol {
  id: number;
  name: string;
  port: number;

  constructor(data?: Partial<InstanceProtocol>) {
    Object.assign(this, data);
  }
}

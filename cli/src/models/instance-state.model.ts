
export class InstanceState {
  status: string;
  message: string;
  cpu: number;
  memory: number;

  constructor(data?: Partial<InstanceState>) {
    Object.assign(this, data);
  }
}

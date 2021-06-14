
export class InstanceActionDto {
  type: string;

  constructor(data?: Partial<InstanceActionDto>) {
    Object.assign(this, data);
  }
}

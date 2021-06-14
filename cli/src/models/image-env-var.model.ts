export class ImageEnvVar {
  id: number;
  name: string;
  value: string;

  constructor(data?: Partial<ImageEnvVar>) {
    Object.assign(this, data);
  }
}

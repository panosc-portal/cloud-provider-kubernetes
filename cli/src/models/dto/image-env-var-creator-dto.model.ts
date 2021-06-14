export class ImageEnvVarCreatorDto {
  name: string;
  value: string;

  constructor(data?: Partial<ImageEnvVarCreatorDto>) {
    Object.assign(this, data);
  }
}

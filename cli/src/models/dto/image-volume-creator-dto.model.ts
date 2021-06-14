export class ImageVolumeCreatorDto {
  name: string;
  path: string;
  readOnly: boolean;

  constructor(data?: Partial<ImageVolumeCreatorDto>) {
    Object.assign(this, data);
  }
}

export class ImageVolume {
  id: number;
  name: string;
  path: string;
  readOnly: boolean;

  constructor(data?: Partial<ImageVolume>) {
    Object.assign(this, data);
  }
}

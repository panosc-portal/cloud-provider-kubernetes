import { ImageProtocol } from './image-protocol.model';
import { ImageVolume } from './image-volume.model';
import { ImageEnvVar } from './image-env-var.model';

export class Image {
  id: number;
  name: string;
  environmentType: string;
  repository: string;
  path: string;
  command?: string;
  args?: string;
  runAsUID?: string;
  description?: string;
  protocols: ImageProtocol[];
  volumes: ImageVolume[];
  envVars: ImageEnvVar[];

  constructor(data?: Partial<Image>) {
    Object.assign(this, data);
  }
}

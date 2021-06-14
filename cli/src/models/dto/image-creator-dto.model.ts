import { ImageProtocolCreatorDto } from './image-protocol-creator-dto.model';
import { ImageVolumeCreatorDto } from './image-volume-creator-dto.model';
import { ImageEnvVarCreatorDto } from './image-env-var-creator-dto.model';

export class ImageCreatorDto {
  name: string;
  description?: string;
  repository: string;
  path: string;
  environmentType: string;
  command?: string;
  args?: string;
  runAsUID?: number;
  protocols: ImageProtocolCreatorDto[];
  volumes: ImageVolumeCreatorDto[];
  envVars: ImageEnvVarCreatorDto[];

  constructor(data?: Partial<ImageCreatorDto>) {
    Object.assign(this, data);
  }
}

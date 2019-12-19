import { bind, BindingScope, inject } from '@loopback/core';
import { Metrics } from '../models';
import { InstanceService } from './instance.service';
import { WhereBuilder } from '@loopback/repository';
import { ImageService } from './image.service';

@bind({ scope: BindingScope.SINGLETON })
export class MetricsService {
  constructor(@inject('services.InstanceService') private _instanceService: InstanceService, @inject('services.ImageService') private _imageService: ImageService) {}

  async getMetrics(): Promise<Metrics> {
    const allInstanceCount = await this._instanceService.count();

    const activeWhere = new WhereBuilder().eq('status', 'ACTIVE').build();
    const activeInstanceCount = await this._instanceService.count(activeWhere);

    const nonActiveWhere = new WhereBuilder().neq('status', 'ACTIVE').build();
    const nonActiveInstanceCount = await this._instanceService.count(nonActiveWhere);

    const allImageCount = await this._imageService.count();
    const imageMetrics = await this._imageService.getImageUsageCount();

    return new Metrics({
      instances: {
        count: allInstanceCount,
        active: activeInstanceCount,
        inactive: nonActiveInstanceCount
      },
      images: {
        count: allImageCount,
        usage: imageMetrics
      }
    });
  }
}

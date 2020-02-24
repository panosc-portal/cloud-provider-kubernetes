import { bind, BindingScope, inject } from '@loopback/core';
import { Metrics, Node } from '../models';
import { InstanceService } from './instance.service';
import { WhereBuilder } from '@loopback/repository';
import { ImageService } from './image.service';
import { FlavourService } from './flavour.service';
import { NodeService } from './node.service';

@bind({ scope: BindingScope.SINGLETON })
export class MetricsService {
  constructor(
    @inject('services.InstanceService') private _instanceService: InstanceService,
    @inject('services.ImageService') private _imageService: ImageService,
    @inject('services.FlavourService') private _flavourService: FlavourService,
    @inject('services.NodeService') private _nodeService: NodeService
  ) {}

  async getMetrics(): Promise<Metrics> {
    const allInstanceCount = await this._instanceService.count();

    const activeWhere = new WhereBuilder().eq('status', 'ACTIVE').build();
    const activeInstanceCount = await this._instanceService.count(activeWhere);

    const nonActiveWhere = new WhereBuilder().neq('status', 'ACTIVE').build();
    const nonActiveInstanceCount = await this._instanceService.count(nonActiveWhere);

    const allImageCount = await this._imageService.count();
    const imageMetrics = await this._imageService.getUsageCount();

    const allFlavourCount = await this._flavourService.count();
    const flavourMetrics = await this._flavourService.getUsageCount();

    const allNodes = await this._nodeService.getAll();
    const totalMemory = allNodes.reduce((previous: number, node: Node) => previous + node.memory.total, 0);
    const availableMemory = allNodes.reduce((previous: number, node: Node) => previous + node.memory.available, 0);
    const totalCPU = allNodes.reduce((previous: number, node: Node) => previous + node.cpus.total, 0);
    const availableCPU = allNodes.reduce((previous: number, node: Node) => previous + node.cpus.available, 0);

    return new Metrics({
      instances: {
        count: allInstanceCount,
        active: activeInstanceCount,
        inactive: nonActiveInstanceCount
      },
      images: {
        count: allImageCount,
        usage: imageMetrics
      },
      flavours: {
        count: allFlavourCount,
        usage: flavourMetrics
      },
      system: {
        cpu: {
          total: totalCPU,
          available: availableCPU
        },
        memory: {
          total: totalMemory,
          available: availableMemory
        }
      }
    });
  }
}

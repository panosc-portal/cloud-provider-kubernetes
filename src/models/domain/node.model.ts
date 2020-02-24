import { model, property } from '@loopback/repository';
import { ResourceMonitor } from './resource-monitor.model';

@model()
export class Node {
  @property({
    type: 'string'
  })
  hostname: string;

  @property()
  cpus: ResourceMonitor;

  @property()
  memory: ResourceMonitor;

  constructor(data?: Partial<Node>) {
    Object.assign(this, data);
  }
}

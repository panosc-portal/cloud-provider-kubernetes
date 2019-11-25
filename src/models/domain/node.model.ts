import {Entity, model, property} from '@loopback/repository';
import {ResourceMonitor} from './resource-monitor.model';

@model()
export class Node extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false,
  })
  hostname: string;

  @property()
  cpus: ResourceMonitor;

  @property()
  memory: ResourceMonitor;

  constructor(data?: Partial<Node>) {
    super(data);
  }
}


export interface NodeRelations {
  // describe navigational properties here
}

export type NodeWithRelations = Node & NodeRelations;

import {Entity, model, property} from '@loopback/repository';
import {Node} from './node.model';
import {InstanceState} from './instance-state.model';
import {InstanceService} from './instance-service.model';
import {Flavour} from './flavour.model';
import {Image} from './image.model';

@model()
export class Instance extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property()
  flavour?: Flavour;

  @property()
  image?: Image;

  @property({
    type: 'date',
    required: true,
  })
  createdAt: string;

  @property({
    type: 'string',
    required: true,
  })
  hostname: string;

  @property.array(InstanceService)
  services?: InstanceService[];


  @property()
  node?: Node;

  @property()
  state?: InstanceState;

  constructor(data?: Partial<Instance>) {
    super(data);
  }
}

export interface InstanceRelations {
}

export type InstanceWithRelations = Instance & InstanceRelations;

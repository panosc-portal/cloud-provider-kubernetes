import { Flavour } from './flavour.model';
import { Image} from './image.model';
import { InstanceProtocol } from './instance-protocol.model';
import { InstanceState } from './instance-state.model';

export class Instance {
  id: number;
  name: string;
  description?: string;
  hostname: string;
  computeId: string;
  state: InstanceState;
  createdAt: Date;
  protocols: InstanceProtocol[];
  flavour: Flavour;
  image: Image;

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }
}

import { ResourceMonitor } from './resource-monitor.model';

export class Node {
  hostname: string;

  cpus: ResourceMonitor;

  memory: ResourceMonitor;

  constructor(data?: Partial<Node>) {
    Object.assign(this, data);
  }
}

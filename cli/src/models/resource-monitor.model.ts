export class ResourceMonitor {

  total: number;

  available: number;

  used: number;

  constructor(data?: Partial<ResourceMonitor>) {
    Object.assign(this, data);
  }
}

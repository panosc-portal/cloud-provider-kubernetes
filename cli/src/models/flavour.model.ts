
export class Flavour {
  id: number;
  name: string;
  description?: string;
  cpu: number;
  memory: number;

  constructor(data?: Partial<Flavour>) {
    Object.assign(this, data);
  }
}

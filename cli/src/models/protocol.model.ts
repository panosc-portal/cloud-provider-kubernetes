
export class Protocol {
  id: number;
  name: string;
  defaultPort: number;

  constructor(data?: Partial<Protocol>) {
    Object.assign(this, data);
  }
}

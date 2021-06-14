
export class FlavourCreatorDto {
  name: string;
  description?: string;
  cpu: number;
  memory: number;

  constructor(data?: Partial<FlavourCreatorDto>) {
    Object.assign(this, data);
  }
}

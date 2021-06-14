import { AccountCreatorDto } from './account-creator-dto.model';

export class InstanceCreatorDto {
  name: string;
  description?: string;
  flavourId: number;
  imageId: number;
  account: AccountCreatorDto;

  constructor(data?: Partial<InstanceCreatorDto>) {
    Object.assign(this, data);
  }
}

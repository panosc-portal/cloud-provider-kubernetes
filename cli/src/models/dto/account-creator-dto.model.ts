
export class AccountCreatorDto {
  userId: number;
  username: string;
  uid: number;
  gid: number;
  homePath: string;
  email: string;

  constructor(data?: Partial<AccountCreatorDto>) {
    Object.assign(this, data);
  }
}

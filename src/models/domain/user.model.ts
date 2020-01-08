import { model, property } from '@loopback/repository';
import { Column, Entity, PrimaryGeneratedColumn, Index, Table } from 'typeorm';

@Entity({name: 'users'})
@model()
export class User {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'number',
    required: true
  })
  @Index('user_account_id_index')
  @Column({ name: 'account_id', type: 'integer' })
  accountId: number;

  @property({
    type: 'string',
    required: true
  })
  @Index('user_username_index')
  @Column({ length: 100 })
  username: string;

  @property({
    type: 'string',
  })
  @Column({ name: 'first_name',  length: 100 })
  firstName: string;

  @property({
    type: 'string',
  })
  @Column({ name: 'last_name',  length: 100 })
  lastName: string;

  @property({
    type: 'number',
    required: true
  })
  @Column({ type: 'integer' })
  gid: number;

  @property({
    type: 'number',
    required: true
  })
  @Column({ type: 'integer' })
  uid: number;

  @property({
    type: 'string',
    required: true
  })
  @Column({ name: 'home_path', length: 250 })
  homePath: string;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }

}

import { model, property } from '@loopback/repository';
import { Column, Entity, PrimaryGeneratedColumn, Index, Table, OneToOne, JoinColumn } from 'typeorm';
import { Instance } from './instance.model';

@Entity()
@model()
export class InstanceUser {
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
  @Index('instance_user_account_id_index')
  @Column({ name: 'account_id', type: 'integer' })
  accountId: number;

  @property({
    type: 'string',
    required: true
  })
  @Index('instance_user_username_index')
  @Column({ length: 100 })
  username: string;

  @property({
    type: 'string',
  })
  @Column({ name: 'first_name',  length: 100, nullable: true })
  firstName: string;

  @property({
    type: 'string',
  })
  @Column({ name: 'last_name',  length: 100, nullable: true })
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

  @OneToOne(type => Instance, instance => instance.user, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'instance_id' })
  instance: Instance;
  
  constructor(data?: Partial<InstanceUser>) {
    Object.assign(this, data);
  }

}

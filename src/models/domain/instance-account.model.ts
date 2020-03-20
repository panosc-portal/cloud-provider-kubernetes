import { model, property } from '@loopback/repository';
import { Column, Entity, PrimaryGeneratedColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { Instance } from './instance.model';

@Entity()
@model()
export class InstanceAccount {
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
  @Index('instance_account_user_id_index')
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @property({
    type: 'string',
    required: true
  })
  @Index('instance_account_username_index')
  @Column({ length: 100 })
  username: string;

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

  @property({
    type: 'string',
    required: false
  })
  @Column({ length: 250, nullable: true })
  email: string;

  @OneToOne(type => Instance, instance => instance.account, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'instance_id' })
  instance: Instance;
  
  constructor(data?: Partial<InstanceAccount>) {
    Object.assign(this, data);
  }

}

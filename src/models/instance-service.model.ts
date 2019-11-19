import {  model, property} from '@loopback/repository';
import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Instance} from './instance.model';


@Entity()
@model()
export class InstanceService  {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: false,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'string',
  })
  @Column()
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  @Column()
  port: number;

  @property({
    type: 'number',
  })
  @ManyToOne(type=>Instance,instance=>instance.instanceServices)
  @JoinColumn({name:"instance_id"})
  instance?: Instance;

  constructor(data?: Partial<InstanceService>) {
    Object.assign(this, data);
  }
}
export interface InstanceServiceRelations {
  // describe navigational properties here
}

export type InstanceServiceWithRelations = InstanceService & InstanceServiceRelations;

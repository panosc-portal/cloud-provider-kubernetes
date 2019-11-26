import {bind, BindingScope, inject} from '@loopback/core';
import {Flavour, Image, Instance, InstanceState, K8sInstance} from '../models';
import {K8sInstanceService} from './k8sInstance.service';
import {InstanceRepository, QueryOptions} from '../repositories';
import {repository} from '@loopback/repository';
import {BaseService} from './base.service';
import {InstanceCreatorDto} from '../controllers/dto/instanceCreatorDto';

@bind({scope: BindingScope.SINGLETON})
export class InstanceService extends BaseService<Instance> {

  constructor(@repository(InstanceRepository) repo: InstanceRepository, @inject('services.K8sInstanceService') private k8sInstanceService: K8sInstanceService) {
    super(repo);
  }

  updateById(id: number): Promise<Instance> {
    return new Promise<Instance>(function(resolve, reject) {
      resolve();
    });
  }

  async create(instanceBody: InstanceCreatorDto, image: Image, flavour: Flavour): Promise<Instance> {
    const kubeInstance: K8sInstance = await this.k8sInstanceService.createK8sInstance(instanceBody, image, flavour);
    return new Instance({name: kubeInstance.deployment.name});
    //TODO save instance to DB
  }

  getStateById(): Promise<InstanceState> {
    return new Promise<InstanceState>(function(resolve, reject) {
      resolve();
    });
  }

  actionById(): void {
  }

  getAll(): Promise<Instance[]> {
    return this._repository.find(null, {leftJoins: ['image', 'flavour', 'protocols']} as QueryOptions);
  }
}

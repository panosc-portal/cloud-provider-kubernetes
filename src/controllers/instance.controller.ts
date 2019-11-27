import {del, get, getModelSchemaRef, param, post, requestBody, put} from '@loopback/openapi-v3';
import {Image, Instance, InstanceState} from '../models';
import {inject} from '@loopback/context';
import {FlavourService, ImageService, InstanceService} from '../services';
import {InstanceCreatorDto} from './dto/instanceCreatorDto';
import { InstanceStatus } from '../models/enumerations/InstanceStatus';
import { InstanceActionDto } from './dto/instanceActionDto';
import { BaseController } from './BaseController';

export class InstanceController extends BaseController {
  constructor(@inject('services.InstanceService') private _instanceService: InstanceService, @inject('services.ImageService') private _imageservice: ImageService, @inject('services.FlavourService') private _flavourservice: FlavourService) {
    super();
  }

  @get('/instances', {
    summary: 'Get a list of all instances',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Instance)},
          },
        },
      },
    },
  })
  getAll(): Promise<Instance[]> {
    return this._instanceService.getAll();
  }

  @get('/instances/{id}', {
    summary: 'Get an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance),
          },
        },
      },
    },
  })
  async getById(@param.path.string('id') id: number): Promise<Instance> {
    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return instance;
  }

  @post('/instances', {
    summary: 'Create a new instance',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance),
          },
        },
      },
    },
  })
  async create(@requestBody() instanceCreator: InstanceCreatorDto): Promise<Instance> {
    const image = await this._imageservice.getById(instanceCreator.imageId);
    const flavour = await this._flavourservice.getById(instanceCreator.flavourId);

    this.throwBadRequestIfNull(image, 'Invalid image');
    this.throwBadRequestIfNull(flavour, 'Invalid flavour');

    const instance: Instance = new Instance({
      name: instanceCreator.name,
      description: instanceCreator.description,
      status: InstanceStatus.BUILDING,
      image: image,
      flavour: flavour
    });

    // TODO actions to create instance here

    return this._instanceService.create(instance);
  }

  @put('/instances/{id}', {
    summary: 'Update an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance),
          },
        },
      },
    },
  })
  updateById(@param.path.number('id') id: number, @requestBody() instance: Instance): Promise<Image> {
    this.throwBadRequestIfNull(instance, 'Invalid instance');
    this.throwBadRequestIfNotEqual(id, instance.id, 'Id in path is not the same as body id');

    return this._instanceService.update(instance);
  }

  @get('/instances/{id}/state', {
    summary: 'Get the state of an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InstanceState),

          },
        },
      },
    },
  })
  async getStateById(@param.path.string('id') id: number): Promise<InstanceState> {
    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return instance.state;
  }

  @del('/instances/{id}', {
    summary: 'Delete an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
      },
    },
  })
  async deleteById(@param.path.string('id') id: number): Promise<boolean> {
    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return this._instanceService.delete(instance);
  }

  @post('/instances/{id}/actions', {
    summary: 'Invoke an action by a given identifier i.e. REBOOT, TERMINATE',
    responses: {
      '201': {
        description: 'Created',
      },
    },
  })
  async actionById(@param.path.string('id') id: number, @requestBody() action: InstanceActionDto): Promise<void> {
    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // TODO create action

    return this._instanceService.executeAction(instance);
  }

}

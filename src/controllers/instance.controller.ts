// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {del, get, getModelSchemaRef, param, post, requestBody} from '@loopback/openapi-v3';
import {Image, Instance, InstanceState} from '../models';
import {inject} from '@loopback/context';
import {FlavourService, ImageService, InstanceService} from '../services';
import {HttpErrors} from '@loopback/rest';
import {InstanceCreatorDto} from './dto/instanceCreatorDto';
import { InstanceStatus } from '../models/enumerations/InstanceStatus';

export class InstanceController {
  constructor(@inject('services.InstanceService') private _instanceService: InstanceService, @inject('services.ImageService') private _imageservice: ImageService, @inject('services.FlavourService') private _flavourservice: FlavourService) {
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

    if (image == null) {
      throw new HttpErrors.BadRequest('Invalid image');
    }

    if (flavour == null) {
      throw new HttpErrors.BadRequest('Invalid flavour');
    }

    const instance: Instance = new Instance({
      name: instanceCreator.name,
      description: instanceCreator.description,
      status: InstanceStatus.BUILDING,
      image: image,
      flavour: flavour
    })

    return this._instanceService.create(instance);
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
  getById(@param.path.string('id') id: number): Promise<Instance> {
    return this._instanceService.getById(id);
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
  getStateById(): Promise<InstanceState> {
    return this._instanceService.getStateById();
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
    if (instance == null) {
      throw new HttpErrors.NotFound('Instance with given id does not exist');
    }

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
  actionById(): void {
    return this._instanceService.actionById();
  }

}

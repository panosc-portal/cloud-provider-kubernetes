import { del, get, getModelSchemaRef, param, post, requestBody, put } from '@loopback/openapi-v3';
import { Image, Instance, InstanceState, InstanceCommand, InstanceCommandType } from '../models';
import { inject } from '@loopback/context';
import { FlavourService, ImageService, InstanceService, InstanceActionService } from '../services';
import { InstanceCreatorDto } from './dto/instance-creator-dto';
import { InstanceStatus } from '../models';
import { InstanceCommandDto } from './dto/instance-command-dto';
import { BaseController } from './BaseController';
import { InstanceUpdatorDto } from './dto/instance-updator-dto';

export class InstanceController extends BaseController {
  constructor(
    @inject('services.InstanceService') private _instanceService: InstanceService,
    @inject('services.InstanceActionService') private _instanceActionService: InstanceActionService,
    @inject('services.ImageService') private _imageservice: ImageService,
    @inject('services.FlavourService') private _flavourservice: FlavourService
  ) {
    super();
  }

  @get('/instances', {
    summary: 'Get a list of all instances',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Instance) }
          }
        }
      }
    }
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
            schema: getModelSchemaRef(Instance)
          }
        }
      }
    }
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
            schema: getModelSchemaRef(Instance)
          }
        }
      }
    }
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

    await this._instanceService.save(instance);

    const command: InstanceCommand = new InstanceCommand(instance, InstanceCommandType.CREATE);
    this._instanceActionService.execute(command);

    return instance;
  }

  @put('/instances/{id}', {
    summary: 'Update an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance)
          }
        }
      }
    }
  })
  async update(@param.path.number('id') id: number, @requestBody() instanceUpdatorDto: InstanceUpdatorDto): Promise<Instance> {
    this.throwBadRequestIfNull(InstanceUpdatorDto, 'Invalid instance in request');

    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    instance.name = instanceUpdatorDto.name;
    instance.description = instanceUpdatorDto.description

    return this._instanceService.update(instance);
  }

  @get('/instances/{id}/state', {
    summary: 'Get the state of an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InstanceState)
          }
        }
      }
    }
  })
  async getState(@param.path.string('id') id: number): Promise<InstanceState> {
    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return instance.state;
  }

  @del('/instances/{id}', {
    summary: 'Delete an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.string('id') id: number): Promise<Instance> {
    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return this._performAction(instance, InstanceCommandType.DELETE);
  }

  @post('/instances/{id}/actions', {
    summary: 'Invoke an action by a given identifier i.e. REBOOT, TERMINATE',
    responses: {
      '201': {
        description: 'Created'
      }
    }
  })
  async executeAction(@param.path.string('id') id: number, @requestBody() command: InstanceCommandDto): Promise<Instance> {
    const instance = await this._instanceService.getById(id);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return this._performAction(instance, command.type);
  }

  private async _performAction(instance: Instance, instanceCommandType: InstanceCommandType): Promise<Instance> {
    if (instanceCommandType == InstanceCommandType.START) {
      instance.status = InstanceStatus.STARTING;

    } else if (instanceCommandType == InstanceCommandType.REBOOT) {
      instance.status = InstanceStatus.REBOOTING;

    } else if (instanceCommandType == InstanceCommandType.SHUTDOWN) {
      instance.status = InstanceStatus.STOPPING;

    } else if (instanceCommandType == InstanceCommandType.DELETE) {
      instance.status = InstanceStatus.DELETING;
    }

    // Save state of the instance
    await this._instanceService.save(instance);

    // create and queue action
    const instanceCommand = new InstanceCommand(instance, instanceCommandType);
    this._instanceActionService.execute(instanceCommand);

    return instance;
  }
}

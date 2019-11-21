// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {del, get, getModelSchemaRef, param, post, requestBody} from '@loopback/openapi-v3';
import {Instance, InstanceState} from '../models';
import {inject} from '@loopback/context';
import {InstanceService} from '../services';
import { HttpErrors } from '@loopback/rest';

export class InstanceController {
  constructor(@inject('services.InstanceService') private _instanceservice: InstanceService) {
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
    return this._instanceservice.getAll();
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
  create(@requestBody() instance: Instance): Promise<Instance> {
    return this._instanceservice.create();
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
    return this._instanceservice.getById(id);
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
    return this._instanceservice.getStateById();
  }

  @del('/instances/{id}', {
    summary: 'Delete an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
      },
    },
  })
  deleteById(@param.path.string('id') id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._instanceservice.getById(id).then(instance => {
        if (instance == null) {
          reject(new HttpErrors.NotFound('Instance with given id does not exist'));

        } else {
          resolve(this._instanceservice.delete(instance));
        }
   
      })
    });
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
    return this._instanceservice.actionById();
  }

}

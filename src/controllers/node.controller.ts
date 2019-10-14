// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, getModelSchemaRef, param} from '@loopback/openapi-v3';
import {Instance, Node} from '../models';
import {inject} from '@loopback/context';
import {NodeService} from '../services';

export class NodeController {
  constructor(@inject('node-service') private _nodeservice: NodeService) {
  }

  @get('/nodes', {
    summary: 'Get all nodes',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Node)},
          },
        },
      },
    },
  })
  getAll(): Promise<Node[]> {
    return this._nodeservice.getAll();
  }

  @get('/nodes/{id}', {
    summary: 'Get information about a given node',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Node),
          },
        },
      },
    },
  })
  getById(@param.path.string('id') id: number): Promise<Node> {
    return this._nodeservice.getById(id);
  }

  @get('/nodes/{id}/instances', {
    summary: 'Get all instances for a given node',
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
  getInstancesByNodeId(@param.path.string('id') id: number): Promise<Instance[]> {
    return this._nodeservice.getInstancesByNodeId(id);
  }

}

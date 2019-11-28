import { get, getModelSchemaRef, param } from '@loopback/openapi-v3';
import { Instance, Node } from '../models';
import { inject } from '@loopback/context';
import { NodeService } from '../services';
import { BaseController } from './BaseController';

export class NodeController extends BaseController {
  constructor(@inject('services.NodeService') private _nodeService: NodeService) {
    super();
  }

  @get('/nodes', {
    summary: 'Get all nodes',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Node) }
          }
        }
      }
    }
  })
  getAll(): Promise<Node[]> {
    return this._nodeService.getAll();
  }

  @get('/nodes/{id}', {
    summary: 'Get information about a given node',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Node)
          }
        }
      }
    }
  })
  async getById(@param.path.string('id') id: number): Promise<Node> {
    const node = await this._nodeService.getById(id);
    this.throwNotFoundIfNull(node, 'Node with given id does not exist');

    return node;
  }

  @get('/nodes/{id}/instances', {
    summary: 'Get all instances for a given node',
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
  async getInstancesByNodeId(@param.path.string('id') id: number): Promise<Instance[]> {
    const node = await this._nodeService.getById(id);
    this.throwNotFoundIfNull(node, 'Node with given id does not exist');

    return this._nodeService.getInstancesByNode(node);
  }
}

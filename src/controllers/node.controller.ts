import { get, getModelSchemaRef, param } from '@loopback/openapi-v3';
import { Instance, Node } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, NodeService } from '../services';
import { BaseController } from './base.controller';

export class NodeController extends BaseController {
  constructor(@inject('services.NodeService') private _nodeService: NodeService,
              @inject('services.InstanceService') private _instanceService: InstanceService) {
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

  @get('/nodes/{name}', {
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
  async getByName(@param.path.string('name') name: string): Promise<Node> {
    const node = await this._nodeService.getByHostname(name);
    this.throwNotFoundIfNull(node, 'Node with given name does not exist');
    return node;
  }

  @get('/nodes/{name}/instances', {
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
  async getInstancesByNodeId(@param.path.string('name') name: string): Promise<Instance[]> {

    const instances = await this._instanceService.getInstancesByNodeHostname(name);
    this.throwNotFoundIfNull(instances, 'Node with given name does not exist');

    return instances;
  }
}

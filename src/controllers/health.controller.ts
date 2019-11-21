// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {inject} from '@loopback/context';
import {HealthService} from '../services';
import {get} from '@loopback/openapi-v3';
import {Health} from '../models/Health';


export class HealthController {
  constructor(@inject('services.HealthService') private _healthservice: HealthService) {}

  @get('/health', {
    responses: {
      '200': {
        summary: 'Check if the provider is healthy',
        content: {
          'application/json': {
            schema: {
            type: 'string' }
          },
        },
      },
    },
  })
  getHealth(): Promise<Health> {
    return this._healthservice.getHealth();
  }
}

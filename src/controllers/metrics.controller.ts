import { inject } from '@loopback/context';
import { MetricsService } from '../services';
import { get, getModelSchemaRef } from '@loopback/openapi-v3';
import { Metrics } from '../models';

export class MetricsController {
  constructor(@inject('services.MetricsService') private _metricservice: MetricsService) {}

  @get('/metrics', {
    summary: 'Get metrics about the provider ',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Metrics) }
          }
        }
      }
    }
  })
  getMetrics(): Promise<Metrics> {
    return this._metricservice.getMetrics();
  }
}

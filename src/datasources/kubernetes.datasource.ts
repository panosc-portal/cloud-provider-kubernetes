import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './kubernetes.datasource.json';
import * as Api from 'kubernetes-client';
import {ApiRoot} from 'kubernetes-client';


@lifeCycleObserver('datasource')
export class KubernetesDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'kubernetes';
  Client = Api.Client1_13;
  config = Api.config;
  K8sClient: ApiRoot;


  constructor(
    @inject('datasources.config.kubernetes', {optional: true})
      dsConfig: object = config,
  ) {
    super(dsConfig);
    this.K8sClient = new this.Client({
      config: this.config.fromKubeconfig('src/datasources/kubeconfig.json'),
      version: '1.9',
    });
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}

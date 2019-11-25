import {
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {K8SConfigCreator} from './kubeconfig';
import { ApiRoot} from 'kubernetes-client';
import {KubeConfig} from '@kubernetes/client-node';
const Request = require('kubernetes-client/backends/request');
const Client = require('kubernetes-client').Client;


@lifeCycleObserver('datasource')
export class KubernetesDataSource implements LifeCycleObserver {
  
  static dataSourceName = 'kubernetes';
  
  defaultNamespace = 'panosc';
  K8sClient: ApiRoot;

  constructor() {
    const kubeconfig = new KubeConfig();

    const k8Sconfig = new K8SConfigCreator().getConfig();
    
    kubeconfig.loadFromString(JSON.stringify(k8Sconfig));
    const backend = new Request({kubeconfig});
    this.K8sClient = new Client({backend, version: '1.13'});
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
  }
}

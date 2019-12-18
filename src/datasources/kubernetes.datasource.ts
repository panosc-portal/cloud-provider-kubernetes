import { lifeCycleObserver, LifeCycleObserver, ValueOrPromise } from '@loopback/core';
import { K8SConfigCreator } from './kubeconfig';
import { ApiRoot } from 'kubernetes-client';
import { KubeConfig } from '@kubernetes/client-node';
import { logger } from '../utils';
import { K8sDeploymentRequest } from '../models';
const Request = require('kubernetes-client/backends/request');
const Client = require('kubernetes-client').Client;

@lifeCycleObserver('datasource')
export class KubernetesDataSource implements LifeCycleObserver {
  static dataSourceName = 'kubernetes';

  private _k8sClient: ApiRoot;

  get k8sClient(): ApiRoot {
    return this._k8sClient;
  }

  constructor() {
    try {
      const kubeconfig = new KubeConfig();

      const k8Sconfig = new K8SConfigCreator().getConfig();
  
      kubeconfig.loadFromString(JSON.stringify(k8Sconfig));
      const backend = new Request({ kubeconfig });
      this._k8sClient = new Client({ backend, version: '1.13' });

    } catch (error) {
      logger.error(`Failed to create Kubernetes Client: ${error.message}`);
      this._k8sClient = null;
    }  
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {}

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {}

  getDeployment(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      return this._k8sClient.apis.apps.v1.namespaces(namespace).deployments.post({ body: deploymentRequest.model });
    
    } else {
      throw new Error('Kubernetes client has not been created');
    }
  }

  getPodsForDeployment(name: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      return this._k8sClient.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: `app=${name}` } });    
    
    } else {
      throw new Error('Kubernetes client has not been created');
    }
  }
}

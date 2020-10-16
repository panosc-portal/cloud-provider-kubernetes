import { lifeCycleObserver, LifeCycleObserver, ValueOrPromise } from '@loopback/core';
import { K8SConfigCreator } from './kubeconfig';
import { ApiRoot } from 'kubernetes-client';
import { KubeConfig } from '@kubernetes/client-node';
import { LoggedError, logger } from '../utils';
import { K8sDeploymentRequest, K8sNamespaceRequest, K8sSecretRequest, K8sServiceRequest } from '../models';
import { APPLICATION_CONFIG } from '../application-config';

const Request = require('kubernetes-client/backends/request');
const Client = require('kubernetes-client').Client;

@lifeCycleObserver('datasource')
export class KubernetesDataSource implements LifeCycleObserver {
  static dataSourceName = 'kubernetes';

  private _k8sClient: ApiRoot;

  constructor() {
    try {

      if (APPLICATION_CONFIG().kubernetes.host) {
        logger.info('Using defined variables for kubernetes configuration');
        const kubeconfig = new KubeConfig();
        const k8Sconfig = new K8SConfigCreator().getConfig();

        kubeconfig.loadFromString(JSON.stringify(k8Sconfig));
        const backend = new Request({ kubeconfig });
        this._k8sClient = new Client({ backend, version: '1.13' });

      } else if (process.env.KUBERNETES_SERVICE_HOST) {
        logger.info('Using kubernetes cluster configuration');
        this._k8sClient = new Client({ version: '1.13' });

      } else {
        throw new LoggedError('Did not manage to define kubernetes configuration');
      }
    } catch (error) {
      logger.error(`Failed to create Kubernetes Client: ${error.message}`);
      this._k8sClient = null;
    }
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

  isConnected(): boolean {
    return this._k8sClient != null;
  }

  async getNamespace(namespaceName: string): Promise<any> {
    if (this._k8sClient != null) {
      const namespace = await this._k8sClient.api.v1.namespaces(namespaceName).get();

      if (namespace.body != null) {
        return namespace.body;

      } else {
        throw new Error(`k8s namespace response with name '${namespaceName}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async createNamespace(namespaceRequest: K8sNamespaceRequest): Promise<any> {
    if (this._k8sClient != null) {
      const namespace = await this._k8sClient.api.v1.namespaces.post({ body: namespaceRequest.model });

      if (namespace.body != null) {
        return namespace.body;

      } else {
        throw new Error(`k8s namespace response with name '${namespaceRequest.name}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async deleteNamespace(namespaceName: string): Promise<any> {
    if (this._k8sClient != null) {
      await this._k8sClient.api.v1.namespaces(namespaceName).delete();

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getDeployment(computeId: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const deployment = await this._k8sClient.apis.apps.v1.namespace(namespace).deployments(computeId).get();

      if (deployment.body != null) {
        return deployment.body;

      } else {
        throw new Error(`k8s deployment response for instance with compute Id '${computeId}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getAllDeploymentsWithLabelSelector(labelSelector: string): Promise<any> {
    if (this._k8sClient != null) {
      const deployments = await this._k8sClient.apis.apps.v1.deployments.get({ qs: { labelSelector: labelSelector } });

      if (deployments.body != null) {
        return deployments.body.items;

      } else {
        throw new Error(`k8s deployments response for label selector '${labelSelector}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async createDeployment(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const deployment = await this._k8sClient.apis.apps.v1.namespaces(namespace).deployments.post({ body: deploymentRequest.model });
      if (deployment.body != null) {
        return deployment.body;

      } else {
        throw new Error(`k8s deployment response for instance with compute Id '${deploymentRequest.name}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async deleteDeployment(computeId: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      await this._k8sClient.apis.apps.v1.namespaces(namespace).deployments(computeId).delete();

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getPodsForDeployment(computeId: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const podList = await this._k8sClient.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: `app=${computeId}` } });
      if (podList.body != null) {
        return podList.body;

      } else {
        throw new Error(`k8s pods response for instance with compute Id '${computeId}' does not have a body`);
      }

    } else {
      throw new Error('Kubernetes client has not been created');
    }
  }


  async getService(computeId: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const service = await this._k8sClient.api.v1.namespaces(namespace).services(computeId).get();

      if (service.body != null) {
        return service.body;

      } else {
        throw new Error(`k8s service response for instance with compute Id '${computeId}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getAllServicesWithLabelSelector(labelSelector: string): Promise<any> {
    if (this._k8sClient != null) {
      const services = await this._k8sClient.api.v1.services.get({ qs: { labelSelector: labelSelector } });

      if (services.body != null) {
        return services.body.items;

      } else {
        throw new Error(`k8s services response for label selector '${labelSelector}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async createService(serviceRequest: K8sServiceRequest, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const service = await this._k8sClient.api.v1.namespace(namespace).services.post({ body: serviceRequest.model });

      if (service.body != null) {
        return service.body;

      } else {
        throw new Error(`k8s service response for instance with compute Id '${serviceRequest.name}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async deleteService(computeId: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      await this._k8sClient.api.v1.namespaces(namespace).services(computeId).delete();

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getEndpoints(computeId: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const serviceEndpoints = await this._k8sClient.api.v1.namespaces(namespace).endpoint(computeId).get();

      if (serviceEndpoints.body != null) {
        return serviceEndpoints.body;

      } else {
        throw new Error(`k8s service endpoints response for instance with compute Id '${computeId}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getNode(nodeName: string): Promise<any> {
    if (this._k8sClient != null) {
      const node = await this._k8sClient.api.v1.nodes(nodeName).get();

      if (node.body != null) {
        return node.body;

      } else {
        throw new Error(`k8s node response for node with name '${nodeName}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getAllNodes(): Promise<any> {
    if (this._k8sClient != null) {
      const response = await this._k8sClient.api.v1.nodes.get();

      if (response.body != null) {
        return response.body.items;

      } else {
        throw new Error(`k8s response for geting all nodes does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async getSecret(secretName: string, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const secret = await this._k8sClient.api.v1.namespace(namespace).secrets(secretName).get();

      if (secret.body != null) {
        return secret.body;

      } else {
        throw new Error(`k8s secret response for secret with name '${secretName}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

  async createSecret(secretRequest: K8sSecretRequest, namespace: string): Promise<any> {
    if (this._k8sClient != null) {
      const secret = await this._k8sClient.api.v1.namespaces(namespace).secrets.post({ body: secretRequest.model });

      if (secret.body != null) {
        return secret.body;

      } else {
        throw new Error(`k8s secret response for secret with name '${secretRequest.name}' does not have a body`);
      }

    } else {
      throw new Error('k8s client has not been created');
    }
  }

}

import { bind, BindingScope, inject, lifeCycleObserver } from '@loopback/core';
import { K8sServiceManager } from './k8s-service.manager';
import { Instance, K8sInstance, K8sDeployment, K8sService } from '../../models';
import { K8sRequestFactoryService } from './k8s-request-factory.service';
import { K8sDeploymentManager } from './k8s-deployment.manager';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';
import { K8sNamespaceManager } from './k8s-namespace.manager';
import * as uuidv4 from 'uuid/v4';
import { APPLICATION_CONFIG } from '../../application-config';

@lifeCycleObserver('server')
@bind({ scope: BindingScope.SINGLETON })
export class K8sInstanceService {
  private _requestFactoryService = new K8sRequestFactoryService();
  private _deploymentManager: K8sDeploymentManager;
  private _serviceManager: K8sServiceManager;
  private _namespaceManager: K8sNamespaceManager;

  private _defaultNamespace = APPLICATION_CONFIG().kubernetes.defaultNamespace;

  get defaultNamespace(): string {
    return this._defaultNamespace;
  }

  get deploymentManager(): K8sDeploymentManager {
    return this._deploymentManager;
  }

  get serviceManager(): K8sServiceManager {
    return this._serviceManager;
  }

  get namespaceManager(): K8sNamespaceManager {
    return this._namespaceManager;
  }

  get requestFactoryService(): K8sRequestFactoryService {
    return this._requestFactoryService;
  }

  constructor(@inject('datasources.kubernetes') dataSource: KubernetesDataSource) {
    this._deploymentManager = new K8sDeploymentManager(dataSource);
    this._serviceManager = new K8sServiceManager(dataSource);
    this._namespaceManager = new K8sNamespaceManager(dataSource);
  }

  async get(computeId: string, namespace: string): Promise<K8sInstance> {
    let k8sInstance: K8sInstance = null;
    try {
      const deployment = await this._deploymentManager.getWithComputeId(computeId, namespace);
      const service = await this._serviceManager.getWithComputeId(computeId, namespace);

      if (deployment != null && service != null) {
        k8sInstance = new K8sInstance(deployment, service, computeId, namespace, APPLICATION_CONFIG().kubernetes.host);

      } else if (deployment == null && service != null) {
        logger.error(`Deployment missing from kubernetes instance with compute Id '${computeId}': deleting kubernetes instance`);
        await this.delete(computeId, namespace);

      } else if (deployment != null && service == null) {
        logger.error(`Service missing from kubernetes instance with compute Id '${computeId}': deleting kubernetes instance`);
        await this.delete(computeId, namespace);
      }

    } catch (error) {
      logger.error(`Failed to get kubernetes instance with compute Id '${computeId}': ${error.message}`);
    }

    return k8sInstance;
  }

  async create(instance: Instance): Promise<K8sInstance> {
    const image = instance.image;
    const flavour = instance.flavour;
    const defaultNamespaceRequest = this.requestFactoryService.createK8sNamespaceRequest(this._defaultNamespace);
    await this.namespaceManager.createIfNotExist(defaultNamespaceRequest);
    let deployment: K8sDeployment = null;
    let service: K8sService = null;
    let k8sInstance: K8sInstance = null;

    // Get compute Id
    const instanceComputeId = await this.UUIDGenerator(instance.name, this._defaultNamespace);
    if (instanceComputeId != null) {
      logger.debug(`Creating kubernetes instance with compute Id '${instanceComputeId}' for instance '${instance.id}'`);

      try {
        // Create deployment
        logger.debug(`Creating kubernetes deployment for instance '${instance.id}' (${instance.name})`);
        const deploymentRequest = this._requestFactoryService.createK8sDeploymentRequest({name: instanceComputeId, image: image, flavour: flavour});
        deployment = await this._deploymentManager.create(deploymentRequest, this._defaultNamespace);
        logger.debug(`Kubernetes deployment for instance '${instance.id}' ('${instance.name}') created successfully`);

        // Create service
        logger.debug(`Creating kubernetes service for instance '${instance.id}' ('${instance.name}')`);
        const serviceRequest = this._requestFactoryService.createK8sServiceRequest({name: instanceComputeId, image: image});
        service = await this._serviceManager.create(serviceRequest, this._defaultNamespace);
        logger.debug(`Kubernetes service for instance '${instance.id}' ('${instance.name}') created successfully`);

        // Get master node IP from environment variable
        k8sInstance = new K8sInstance(deployment, service, instanceComputeId, this._defaultNamespace, APPLICATION_CONFIG().kubernetes.host);

      } catch (error) {
        logger.error(`Couldn't create k8s instance for instance '${instance.id}' ('${instance.name}'): ${error.message}`);

        // Cleanup
        await this.delete(instanceComputeId, this._defaultNamespace);

        throw new Error(`Failed to create kubernetes instance for instance '${instance.id}': ${error.message}`);
      }
    }

    return k8sInstance;
  }

  async delete(instanceComputeId: string, namespace: string): Promise<boolean> {
    logger.debug(`Deleting deployment and service with computeId '${instanceComputeId}'`);
    const serviceDeleted = await this._serviceManager.deleteWithComputeId(instanceComputeId, namespace);
    const deploymentDeleted = await this._deploymentManager.deleteWithComputeId(instanceComputeId, namespace);

    return serviceDeleted && deploymentDeleted;
  }

  async cleanup(validInstances: {namespace: string, computeId: string}[]): Promise<{deploymentCount: number, serviceCount: number}> {
    const deploymentCount = await this._deploymentManager.cleanup(validInstances);
    const serviceCount = await this._serviceManager.cleanup(validInstances);

    return {deploymentCount, serviceCount};
  }

  async UUIDGenerator(name: string, namespace: string) {
    let computeId = null;
    try {
      let unique = false;
      while (!unique) {
        const modifiedName = name.replace(/ /g, `-`);
        const instanceComputeId = modifiedName.toLowerCase() + '-' + uuidv4();
        logger.debug(`Determining if computeId '${instanceComputeId}' is unique`);
        const deployment = await this._deploymentManager.getWithComputeId(instanceComputeId, namespace);
        const service = await this._serviceManager.getWithComputeId(instanceComputeId, namespace);
        unique = (deployment == null && service == null);
        if (unique) {
          logger.debug(`Determined unique computeId '${instanceComputeId}'`);
          computeId = instanceComputeId;
        }
      }
    } catch (error) {
      logger.error(`Failed to get a unique kubernetes compute Id: ${error.message}`);
    }
    return computeId;
  }

  async initDefaultNamespace(): Promise<void> {
    this._defaultNamespace = APPLICATION_CONFIG().kubernetes.defaultNamespace || this.defaultNamespace;
  }

  async start(): Promise<void> {
    await this.initDefaultNamespace();
  }
}

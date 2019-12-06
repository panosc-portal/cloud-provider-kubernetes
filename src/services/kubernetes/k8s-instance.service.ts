import { bind, BindingScope, inject, lifeCycleObserver } from '@loopback/core';
import { K8sServiceManager } from './k8s-service.manager';
import { K8sInstance, Instance, K8sServiceRequest, K8sDeploymentRequest } from '../../models';
import { K8sRequestFactoryService } from './k8s-request-factory.service';
import { K8sDeploymentManager } from './k8s-deployment.manager';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';
import { K8sNamespaceManager } from './k8s-namespace.manager';
import * as uuidv4 from 'uuid/v4';

@lifeCycleObserver('server')
@bind({ scope: BindingScope.SINGLETON })
export class K8sInstanceService {
  private _requestFactoryService = new K8sRequestFactoryService();
  private _deploymentManager: K8sDeploymentManager;
  private _serviceManager: K8sServiceManager;
  private _namespaceManager: K8sNamespaceManager;

  private _defaultNamespace = 'panosc';

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

  async createK8sInstance(instance: Instance): Promise<K8sInstance> {
    const image = instance.image;
    const flavour = instance.flavour;
    const defaultNamespaceRequest = this.requestFactoryService.createK8sNamespaceRequest(this._defaultNamespace);
    await this.namespaceManager.createIfNotExist(defaultNamespaceRequest);
    const instanceComputeId = await this.UUIDGenerator(instance.name);
    // TODO: verify limits and request is applied on pod
    const deploymentRequest = this._requestFactoryService.createK8sDeploymentRequest(instanceComputeId, image.name,
      flavour.cpu, flavour.memory);
    const serviceRequest = this._requestFactoryService.createK8sServiceRequest(instanceComputeId);
    const deploymentServiceConnection = this.verifyDeploymentServiceConnection(deploymentRequest, serviceRequest);
    if (deploymentServiceConnection) {
      logger.debug('Creating Deployment in Kubernetes');
      const deployment = await this._deploymentManager.create(
        deploymentRequest,
        this._defaultNamespace
      );
      logger.debug('Creating Service in Kubernetes');
      const service = await this._serviceManager.create(serviceRequest, this._defaultNamespace);
      if (service === null) {
        await this._deploymentManager.delete(deploymentRequest.name, this._defaultNamespace);
      }
      return new K8sInstance(deployment, service, instanceComputeId);
    } else {
      throw new Error('Service and deployment are not connected');
    }
  }

  async deleteK8sInstance(instanceComputeId: string) {
    try {
      //TODO: verify usage with instanceService
      await this._serviceManager.delete(instanceComputeId, this._defaultNamespace);
      await this._deploymentManager.delete(instanceComputeId, this._defaultNamespace);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async UUIDGenerator(name: string) {
    let unique = false;
    let instanceComputeId = '';
    while (!unique) {
      const modifiedName = name.replace(/ /g, `-`);
      instanceComputeId = modifiedName + '-' + uuidv4();
      const deployment = await this._deploymentManager.getWithComputeId(
        instanceComputeId,
        this._defaultNamespace
      );
      const service = await this._serviceManager.getWithComputeId(instanceComputeId, this._defaultNamespace);
      unique = deployment == null && service == null;
    }
    return instanceComputeId;
  }

  // Verify if deployment and service are connected
  verifyDeploymentServiceConnection(deploymentRequest: K8sDeploymentRequest, serviceRequest: K8sServiceRequest) {
    const deploymentAppLabel = deploymentRequest.model.spec.template.metadata.labels.app;
    const serviceAppLabel = serviceRequest.model.spec.selector.app;
    return deploymentAppLabel === serviceAppLabel;
  }

  async initDefaultNamespace(): Promise<void> {
    this._defaultNamespace = process.env.CLOUD_PROVIDER_K8S_KUBERNETES_DEFAULT_NAMESPACE || this.defaultNamespace;
  }

  async start(): Promise<void> {
    await this.initDefaultNamespace();
  }
}

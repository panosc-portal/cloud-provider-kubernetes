import { bind, BindingScope, inject, lifeCycleObserver } from '@loopback/core';
import { K8sServiceManager } from './k8s-service.manager';
import { Instance, K8sInstance } from '../../models';
import { K8sRequestFactoryService } from './k8s-request-factory.service';
import { K8sDeploymentManager } from './k8s-deployment.manager';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';
import { K8sNamespaceManager } from './k8s-namespace.manager';
import * as uuidv4 from 'uuid/v4';
import { K8sNodeService } from './k8s-node.service';

@lifeCycleObserver('server')
@bind({ scope: BindingScope.SINGLETON })
export class K8sInstanceService {
  private _requestFactoryService = new K8sRequestFactoryService();
  private _deploymentManager: K8sDeploymentManager;
  private _serviceManager: K8sServiceManager;
  private _namespaceManager: K8sNamespaceManager;
  private _nodeService: K8sNodeService;

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

  get nodeService(): K8sNodeService {
    return this._nodeService;
  }

  get requestFactoryService(): K8sRequestFactoryService {
    return this._requestFactoryService;
  }

  constructor(@inject('datasources.kubernetes') dataSource: KubernetesDataSource) {
    this._deploymentManager = new K8sDeploymentManager(dataSource);
    this._serviceManager = new K8sServiceManager(dataSource);
    this._namespaceManager = new K8sNamespaceManager(dataSource);
    this._nodeService = new K8sNodeService(dataSource);
  }


  async get(computeId: string): Promise<K8sInstance> {
    const deployment = await this._deploymentManager.getWithComputeId(computeId, this.defaultNamespace);
    if (deployment == null) {
      await this.delete(computeId);
      return null;
    }
    const service = await this._serviceManager.getWithComputeId(computeId, this.defaultNamespace);
    if (service == null) {
      await this.delete(computeId);
      return null;
    }
    const masterNode = await this._nodeService.getMaster();
    return new K8sInstance(deployment, service, computeId, masterNode.hostname);
  }

  async create(instance: Instance): Promise<K8sInstance> {
    const image = instance.image;
    const flavour = instance.flavour;
    const defaultNamespaceRequest = this.requestFactoryService.createK8sNamespaceRequest(this._defaultNamespace);
    await this.namespaceManager.createIfNotExist(defaultNamespaceRequest);
    const instanceComputeId = await this.UUIDGenerator(instance.name);
    const deploymentRequest = this._requestFactoryService.createK8sDeploymentRequest({
      name: instanceComputeId,
      image: image,
      flavour: flavour
    });
    const serviceRequest = this._requestFactoryService.createK8sServiceRequest({
      name: instanceComputeId,
      image: image
    });
    logger.debug('Creating Deployment in Kubernetes');
    const deployment = await this._deploymentManager.create(
      deploymentRequest,
      this._defaultNamespace
    );
    if (deployment == null) {
      await this.delete(instanceComputeId);
      return null;
    }
    logger.debug('Creating Service in Kubernetes');
    const service = await this._serviceManager.create(serviceRequest, this._defaultNamespace);
    if (service === null) {
      await this.delete(instanceComputeId);
      return null;
    }
    if (service.name === deployment.name) {
      const masterNode = await this._nodeService.getMaster();
      return new K8sInstance(deployment, service, instanceComputeId, masterNode.hostname);
    } else {
      logger.error('Instance has not same service and deployment name');
      return null;
    }


  }

  async delete(instanceComputeId: string) {
    try {
      await this._serviceManager.deleteWithComputeId(instanceComputeId, this._defaultNamespace);
      await this._deploymentManager.deleteWithComputeId(instanceComputeId, this._defaultNamespace);
      return true;

    } catch (error) {
      logger.error(error);
      return false;
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

  async initDefaultNamespace(): Promise<void> {
    this._defaultNamespace = process.env.CLOUD_PROVIDER_K8S_KUBERNETES_DEFAULT_NAMESPACE || this.defaultNamespace;
  }

  async start(): Promise<void> {
    await this.initDefaultNamespace();
  }
}

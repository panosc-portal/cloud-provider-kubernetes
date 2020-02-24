import * as express from 'express';
import * as bodyParser from 'body-parser';
import KubernetesResponseCreator from './kubernetes-response-creator';
import { lifeCycleObserver } from '@loopback/core';
import { buildLogger } from '../../utils';

const logger = buildLogger('[K8S Mock Server]', 240);

@lifeCycleObserver('server')
export class KubernetesMockServer {
  private _server = null;
  private _port = 3001;
  private _defaultInstance = 'default-instance';
  private _error = { state: false, type: null };
  private _createdDeployments = new Map();
  private _createdServices = new Map();
  private _createdNamespaces = new Map();
  private _nodes = [
    {
      name: 'k8s-test-master-1',
      master: true,
      cpu: 2,
      memory: '4039460Ki',
      address: '10.0.0.1'
    },
    {
      name: 'k8s-test-worker-1',
      master: false,
      cpu: 2,
      memory: '4039460Ki',
      address: '10.0.0.2'
    }
  ];

  start() {
    if (this._server != null) {
      return;
    }

    const app = express();
    const jsonParser = bodyParser.json();
    const k8sResponseCreator = new KubernetesResponseCreator();

    app.get('/apis/apps/v1/namespaces/:namespace/deployments/:deployment', (req, res) => {
      const deploymentName = req.params.deployment;
      const namespace = req.params.namespace;
      logger.info(`Getting deploymnet ${deploymentName} from namespace ${namespace}`);
      const response = this._createdDeployments.get(`${namespace}.${deploymentName}`);
      if (response != null) {
        res.status(200).send(response);
      } else {
        res.sendStatus(404);
      }
    });

    app.get('/api/v1/namespaces/:namespace/pods', (req, res) => {
      const labelSelector = req.query.labelSelector;
      const namespace = req.params.namespace;
      const label = labelSelector.split('=')[1];
      logger.info(`Getting pods with label ${labelSelector} from namespace ${namespace}`);
      const deployment = this._createdDeployments.get(`${namespace}.${label}`);

      const response = k8sResponseCreator.getPodList(deployment, this._error.type);
      if (response != null) {
        res.status(200).send(response);
      } else {
        res.sendStatus(404);
      }
    });

    app.get('/api/v1/namespaces/:namespace/services/:service', (req, res) => {
      const serviceName = req.params.service;
      const namespace = req.params.namespace;
      logger.info(`Getting service ${serviceName} from namespace ${namespace}`);

      const response = this._createdServices.get(`${namespace}.${serviceName}`);
      if (response != null) {
        res.status(200).send(response);
      } else {
        res.sendStatus(404);
      }
    });

    app.get('/api/v1/namespaces/:namespace', (req, res) => {
      const namespace = req.params.namespace;
      logger.info(`Getting namespace ${namespace}`);
      const response = this._createdNamespaces.get(namespace);
      if (response != null) {
        res.status(200).send(response);
      } else {
        res.sendStatus(404);
      }
    });

    app.get('/api/v1/namespaces/:namespace/endpoints/:service', (req, res) => {
      const namespace = req.params.namespace;
      let response;

      const serviceName = req.params.service;

      logger.info(`Getting endpoint for service ${serviceName} from namespace ${namespace}`);
      const service = this._createdServices.get(`${namespace}.${serviceName}`);
      if (service != null) {
        response = k8sResponseCreator.getEndpoint(service, this._error.type);

        if (response != null) {
          res.status(200).send(response);
        } else {
          res.sendStatus(500);
        }
      } else {
        res.sendStatus(404);
      }
    });

    app.get('/api/v1/nodes', (req, res) => {
      logger.info(`Getting nodes`);
      const response = k8sResponseCreator.getNodeListResponse(this._nodes);
      if (response != null) {
        res.status(200).send(response);
      } else {
        res.sendStatus(404);
      }
    });

    app.get('/api/v1/nodes/:node', (req, res) => {
      const nodeName = req.params.node;
      logger.info(`Getting node ${nodeName}`);
      const node = this._nodes.find(node => node.name === nodeName);
      if (node) {
        const response = k8sResponseCreator.getNode(node);
        if (response != null) {
          res.status(200).send(response);
        } else {
          res.sendStatus(500);
        }
      } else {
        res.sendStatus(404);
      }
    });

    app.get('*', (req, res) => {
      res.sendStatus(404);
      logger.info(`GET ${req.originalUrl}: unmapped path`);
    });

    app.post('/apis/apps/v1/namespaces/:namespace/deployments', jsonParser, (req, res) => {
      const namespace = req.params.namespace;
      const deploymentName = req.body.metadata.name;

      this.errorManager(deploymentName);

      try {
        this.deploymentServiceValid(req.body);
      } catch (error) {
        logger.error(error.message);
        res.sendStatus(500);
      }

      logger.info(`Posting deployment ${deploymentName} in namespace ${namespace}`);
      if (this._createdNamespaces.get(namespace) != null) {
        const deploymentExist = this._createdDeployments.get(`${namespace}.${deploymentName}`);
        if (deploymentExist == null) {
          const response = k8sResponseCreator.getDeployment(req.body, this._error.type);
          this._createdDeployments.set(`${namespace}.${deploymentName}`, response);
          res.status(200).send(response);
        } else {
          res.status(409).send(`deployment ${deploymentName} already exists`);
        }
      } else {
        logger.error(`Cannot create deployment ${deploymentName}: namespace ${namespace} does not exist`);
        res.sendStatus(500);
      }
    });

    app.post('/api/v1/namespaces', jsonParser, (req, res) => {
      const namespace = req.body.metadata.name;
      const namespaceExist = this._createdNamespaces.get(namespace);
      try {
        this.deploymentServiceValid(req.body);
      } catch (error) {
        logger.error(error.message);
        res.sendStatus(500);
      }
      logger.info(`Posting namespace ${namespace}`);
      if (namespaceExist == null) {
        const response = k8sResponseCreator.getNamespace(namespace);
        this._createdNamespaces.set(namespace, response);
        res.status(200).send(response);
      } else {
        res.status(409).send(`namespace ${namespace} already exists`);
      }
    });

    app.post('/api/v1/namespaces/:namespace/services', jsonParser, (req, res) => {
      const namespace = req.params.namespace;

      this.errorManager(req.body.metadata.name);
      const serviceName = req.body.metadata.name;

      try {
        this.deploymentServiceValid(req.body);
      } catch (error) {
        logger.error(error.message);
        res.sendStatus(500);
      }
      logger.info(`Posting service ${serviceName} in namespace ${namespace}`);
      if (this._createdNamespaces.get(namespace) != null) {
        const serviceExist = this._createdServices.get(`${namespace}.${serviceName}`);
        if (serviceExist == null) {
          const response = k8sResponseCreator.getService(
            serviceName,
            namespace,
            req.body.spec.ports,
            req.body.spec.selector
          );
          this._createdServices.set(`${namespace}.${serviceName}`, response);
          res.status(200).send(response);
        } else {
          res.status(409).send(`service ${serviceName} already exists`);
        }
      } else {
        logger.error(`Cannot create service ${serviceName}: namespace ${namespace} does not exist`);
        res.sendStatus(500);
      }
    });

    app.post('*', (req, res) => {
      res.sendStatus(404);
      logger.info(`POST ${req.originalUrl}: unmapped path`);
    });

    app.delete('/apis/apps/v1/namespaces/:namespace/deployments/:name', jsonParser, (req, res) => {
      const namespace = req.params.namespace;
      const deploymentName = req.params.name;
      logger.info(`Deleting deployment ${deploymentName} in namespace ${namespace}`);
      const deploymentExist = this._createdDeployments.get(`${namespace}.${deploymentName}`);
      if (deploymentExist != null) {
        const response = k8sResponseCreator.getSuccessStatus(deploymentName, 'deployments');
        res.status(200).send(response);
      } else {
        res.status(404).send(`deployments.apps ${deploymentName} not found`);
      }
    });

    app.delete('/api/v1/namespaces/:name', jsonParser, (req, res) => {
      const namespace = req.params.name;
      logger.info(`Deleting namespace ${namespace}`);
      const namespaceExist = this._createdNamespaces.get(namespace);
      if (namespaceExist != null) {
        const response = k8sResponseCreator.getDeletedNamespace(namespace);
        res.status(200).send(response);
      } else {
        res.status(404).send(`namespace ${namespace} not found`);
      }
    });

    app.delete('/api/v1/namespaces/:namespace/services/:name', jsonParser, (req, res) => {
      const namespace = req.params.namespace;
      const serviceName = req.params.name;
      logger.info(`Deleting service ${serviceName} in namespace ${namespace}`);
      const namespaceExist = this._createdServices.get(`${namespace}.${serviceName}`);
      if (namespaceExist != null) {
        const response = k8sResponseCreator.getSuccessStatus(serviceName, 'service');
        res.status(200).send(response);
      } else {
        res.status(404).send(`services ${serviceName} not found`);
      }
    });

    this._server = app.listen(this._port, () => logger.info(`Kubernetes Mock Server listening on port ${this._port}!`));
  }

  stop() {
    if (this._server != null) {
      this._server.close();
      this._server = null;

      this._createdDeployments.clear();
      this._createdServices.clear();
      this._createdNamespaces.clear();

      logger.info(`Kubernetes Mock Server stopped`);
    }
  }

  errorManager(objectName: string) {
    if (objectName.startsWith('pod-crash-loop')) {
      logger.info(`Running error pod crashLoop mode`);
      this._error = { state: true, type: 'pod-crash-loop' };
    } else if (objectName.startsWith('pod-container-creating-timeout')) {
      logger.info(`Running error pod ContainerCreatingTimeout state mode`);
      this._error = { state: true, type: 'pod-container-creating-timeout' };
    } else if (objectName.startsWith('pod-err-image-pull')) {
      logger.info(`Running error pod ErrImagePull state mode`);
      this._error = { state: true, type: 'pod-err-image-pull' };
    } else if (objectName.startsWith('endpoint-error')) {
      logger.info(`Running error endpoint state mode`);
      this._error = { state: true, type: 'endpoint-error' };
    }
  }

  deploymentServiceValid(request) {
    if (request.metadata.labels) {
      const labelPattern = RegExp(/^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/);
      const labels = request.metadata.labels;
      for (const label in labels) {
        if (labels.hasOwnProperty(label)) {
          const validLabel = labelPattern.test(label);
          if (!validLabel) {
            throw new Error(`metadata.labels: Invalid value: ${label}: name part must consist of alphanumeric characters,
           '-', '_' or '.', and must start and end with an alphanumeric character (e.g. 'MyName',  or 'my.name', 
            or '123-abc', regex used for validation is '([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]')`);
          }
          const validLabelValue = labelPattern.test(labels[label]);
          if (!validLabelValue) {
            throw new Error(
              `metadata.labels: Invalid value: ${labels[label]}: name part must consist of alphanumeric characters, '-', 
            '_' or '.', and must start and end with an alphanumeric character (e.g. 'MyName',  or 'my.name',  or 
            '123-abc', regex used for validation is '([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]')`
            );
          }
        }
      }
    }
    if (request.metadata.name) {
      const name = request.metadata.name;
      const namePattern = RegExp(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/);
      const validName = namePattern.test(name);
      if (!validName) {
        throw new Error(`metadata.name: Invalid value: ${name}: a DNS-1123 subdomain 
        must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric 
        character `);
      }
    }
  }
}

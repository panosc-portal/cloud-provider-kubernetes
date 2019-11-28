import * as express from 'express';
import * as bodyParser from 'body-parser';
import KubernetesResponseCreator from './KubernetesResponseCreator';
import { lifeCycleObserver } from '@loopback/core';
import { buildLogger } from '../../utils';

const logger = buildLogger('[K8S Mock Server]');

@lifeCycleObserver('server')
export class KubernetesMockServer {
  private _server = null;
  private _port = 3001;
  private _createdDeployments = new Map();
  private _createdServices = new Map();
  private _createdNamespaces = new Map();

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
      const response = this._createdDeployments.get(`${req.params.namespace}.${req.body.metadata.name}`);
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

      const response = this._createdServices.get(`${serviceName}.${namespace}`);
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

    app.get('*', (req, res) => {
      res.sendStatus(404);
      logger.info(`GET ${req.originalUrl}: unmapped path`);
    });

    app.post('/apis/apps/v1/namespaces/:namespace/deployments', jsonParser, (req, res) => {
      const namespace = req.params.namespace;
      const deploymentName = req.body.metadata.name;
      logger.info(`Posting deployment ${deploymentName} in namespace ${namespace}`);
      if (this._createdNamespaces.get(namespace) != null) {
        const response = k8sResponseCreator.getDeployment(req.body.metadata.name, namespace);
        this._createdDeployments.set(`${namespace}.${deploymentName}`, response);
        res.status(200).send(response);
      } else {
        logger.error(`Cannot create deployment ${deploymentName}: namespace ${namespace} does not exist`);
        res.sendStatus(500);
      }
    });

    app.post('/api/v1/namespaces', jsonParser, (req, res) => {
      const namespace = req.body.metadata.name;
      logger.info(`Posting namespace ${namespace}`);
      const response = k8sResponseCreator.getNamespace(namespace);
      this._createdNamespaces.set(namespace, response);
      res.status(200).send(response);
    });

    app.post('/api/v1/namespaces/:namespace/services', jsonParser, (req, res) => {
      const namespace = req.params.namespace;
      const serviceName = req.body.metadata.name;
      logger.info(`Posting service ${serviceName} in namespace ${namespace}`);
      if (this._createdNamespaces.get(namespace) != null) {
        const response = k8sResponseCreator.getService(serviceName, namespace, req.body.spec.name, req.body.spec.port);
        this._createdServices.set(`${namespace}.${serviceName}`, response);
        res.status(200).send(response);
      } else {
        logger.error(`Cannot create service ${serviceName}: namespace ${namespace} does not exist`);
        res.sendStatus(500);
      }
    });

    app.post('*', (req, res) => {
      res.sendStatus(404);
      logger.info(`POST ${req.originalUrl}: unmapped path`);
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
}

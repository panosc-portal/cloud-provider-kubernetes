import * as express from 'express';
import * as bodyParser from 'body-parser';
import KubernetesResponseCreator from './KubernetesResponseCreator';
import {lifeCycleObserver} from '@loopback/core';
import { logger } from '../../utils';

@lifeCycleObserver('server')
export class KubernetesMockServer {

  private server = null;
  private port = 3001;
  private createdDeployments = new Map();
  private createdServices = new Map();
  private createdNamespaces = new Map();

  start() {
    if (this.server != null) {
      return;
    }

    const app = express();
    const jsonParser = bodyParser.json();
    const k8sResponseCreator = new KubernetesResponseCreator();

    app.get('/apis/apps/v1/namespaces/:namespace/deployments/:deployment', (req, res) => {
      const deploymentName = req.params.deployment;
      const namespace = req.params.namespace;
      logger.info(`Getting deploymnet ${deploymentName} from namespace ${namespace}`);
      const response = this.createdDeployments.get(`${req.params.namespace}.${req.body.metadata.name}`);
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

      const response = this.createdServices.get(`${serviceName}.${namespace}`);
      if (response != null) {
        res.status(200).send(response);

      } else {
        res.sendStatus(404);
      }
    });

    app.get('/api/v1/namespaces/:namespace', (req, res) => {
      const namespace = req.params.namespace;
      logger.info(`Getting namespace ${namespace}`);
      const response = this.createdNamespaces.get(namespace);
      if (response != null) {
        res.status(200).send(response);
      } else {
        res.sendStatus(404);
      }
    });

    app.get('*', (req, res) => {
      res.status(404).send();
      logger.info(`GET ${req.originalUrl}: unmapped path`);
    });

    app.post('/apis/apps/v1/namespaces/:namespace/deployments', jsonParser, (req, res) => {
     const namespace = req.params.namespace;
      const deploymentName = req.body.metadata.name;
      logger.info(`Posting deployment ${deploymentName} in namespace ${namespace}`);
      const response = k8sResponseCreator.getDeployment(req.body.metadata.name, namespace);
      this.createdDeployments.set(`${namespace}.${deploymentName}`, response);
      res.status(200).send(response);
    });

    app.post('/api/v1/namespaces', jsonParser, (req, res) => {
      const namespace = req.body.metadata.name;
      logger.info(`Posting namespace ${namespace}`);
      const response = k8sResponseCreator.getNamespace(namespace);
      this.createdNamespaces.set(namespace,response);
      res.status(200).send(response);
    });

    app.post('/api/v1/namespaces/:namespace/services', jsonParser, (req, res) => {
      const namespace = req.params.namespace;
      const serviceName = req.body.metadata.name;
      logger.info(`Posting service ${serviceName} in namespace ${namespace}`);
      const response = k8sResponseCreator.getService(serviceName, namespace,req.body.spec.name,req.body.spec.port);
      this.createdServices.set(`${namespace}.${serviceName}`, response);
      res.status(200).send(response);
    });


    app.post('*', (req, res) => {
      res.status(404).send();
      logger.info(`POST ${req.originalUrl}: unmapped path`);
    });

    this.server = app.listen(this.port, () => logger.info(`Kubernetes Mock Server listening on port ${this.port}!`));
  }


  stop() {
    if (this.server != null) {
      this.server.close();
      this.server = null;
      logger.info(`Kubernetes Mock Server stopped`);
    }
  }
}
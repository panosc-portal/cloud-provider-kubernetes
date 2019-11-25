import * as express from 'express';
import * as bodyParser from 'body-parser';
import KubernetesResponseCreator from './KubernetesResponseCreator';
import {lifeCycleObserver} from '@loopback/core';

@lifeCycleObserver('server')
export class KubernetesMockServer {

  private server = null;
  private port = 3001;
  private createdDeployments = new Map();
  private createdServices = new Map();

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
      console.log(`Getting deploymnet ${deploymentName} from namespace ${namespace}`);
      if (this.isDeploymentCreated(deploymentName, namespace)) {
        res.status(200).send(k8sResponseCreator.getDeployment(deploymentName, namespace));
      } else {
        res.status(404).send();
      }
    });

    app.get('/api/v1/namespaces/:namespace/services/:service', (req, res) => {
      const serviceName = req.params.service;
      const namespace = req.params.namespace;
      console.log(`Getting service ${serviceName} from namespace ${namespace}`);
      if (this.isServiceCreated(serviceName, namespace)) {
        res.status(200).send(k8sResponseCreator.getService(req.body.metadata.name, req.params.namespace,req.body.spec.name,req.body.spec.port));
      } else {
        res.status(404).send();
      }
    });

    app.get('*', (req, res) => {
      res.send(`Hello World your path is ${req.originalUrl}`);
      console.log(`GET ${req.originalUrl}`);
    });

    app.post('/apis/apps/v1/namespaces/:namespace/deployments', jsonParser, (req, res) => {
      console.log(`Posting deployment ${req.body.metadata.name}  in namespace ${req.params.namespace}`);
      res.status(200).send(k8sResponseCreator.getDeployment(req.body.metadata.name, req.params.namespace));
      this.createdDeployments.set(req.params.deployment, req.params.namespace);
    });

    app.post('/api/v1/namespaces/:namespace/services', jsonParser, (req, res) => {
      console.log(`Posting service ${req.body.metadata.name}  in namespace ${req.params.namespace}`);
      res.status(200).send(k8sResponseCreator.getService(req.body.metadata.name, req.params.namespace,req.body.spec.name,req.body.spec.port));
      this.createdServices.set(req.body.metadata.name, req.params.namespace);
    });

    app.post('*', (req, res) => {
      res.send(`Hello World your path is ${req.originalUrl}`);
      console.log(`POST ${req.originalUrl}`);
    });

    this.server = app.listen(this.port, () => console.log(`Kubernetes Mock Server listening on port ${this.port}!`));
  }

  isDeploymentCreated(name, namespace) {
    for (const [key, value] of this.createdDeployments) {
      return key === name && value === namespace;
    }
  }

  isServiceCreated(name, namespace) {
    for (const [key, value] of this.createdDeployments) {
      return key === name && value === namespace;
    }
  }

  stop() {
    if (this.server != null) {
      this.server.close();
      this.server = null;
    }
  }
}
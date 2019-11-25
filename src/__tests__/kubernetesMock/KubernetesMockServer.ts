import * as express from 'express';
import * as bodyParser from 'body-parser';
import KubernetesResponseCreator from './KubernetesResponseCreator';
import { lifeCycleObserver } from '@loopback/core';

@lifeCycleObserver('server')
export class KubernetesMockServer {
  
  private server = null;
  private port = 3001;

  start() {
    if (this.server != null) {
      return;
    }

    const app = express()
    const jsonParser = bodyParser.json();
    const k8sResponseCreator = new KubernetesResponseCreator();

    app.get('/apis/apps/v1/namespaces/:namespace/deployments/:deployment', (req, res) => {
        console.log(`Getting deploymnet ${req.params.deployment} from namespace ${req.params.namespace}`);
        res.status(200).send(k8sResponseCreator.getDeployment( req.params.deployment,req.params.namespace));
    });
    
    app.get('/api/v1/namespaces/:namespace/services/:service', (req, res) => {
        console.log(`Getting service ${req.params.service} from namespace ${req.params.namespace}`);
        res.status(200).send();
    });
    
    app.get('*', (req, res) => {
        res.send(`Hello World your path is ${req.originalUrl}`);
        console.log(`GET ${req.originalUrl}`);
    });
    
    app.post('/apis/apps/v1/namespaces/:namespace/deployments', jsonParser, (req, res) => {
        console.log(`Posting deployment in namespace ${req.params.namespace}`);
        console.log(req.body);
        res.status(200).send()
    });
    
    app.post('*', (req, res) => {
        res.send(`Hello World your path is ${req.originalUrl}`);
        console.log(`POST ${req.originalUrl}`);
    });
    
    this.server = app.listen(this.port, () => console.log(`Kubernetes Mock Server listening on port ${this.port}!`));
  }

  stop() {
    if (this.server != null) {
      this.server.close();
      this.server = null;
    }
  }
}
const k8sResponce=require("./K8sResponce");

const express = require('express')
var bodyParser = require('body-parser')

const app = express()
const port = 3001

var jsonParser = bodyParser.json()

app.get('/apis/apps/v1/namespaces/:namespace/deployments/:deployment', (req, res) => {
    console.log(`Getting deploymnet ${req.params.deployment} from namespace ${req.params.namespace}`);
    res.status(200).send(k8sResponce.getDeployment( req.params.deployment,req.params.namespace));

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


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

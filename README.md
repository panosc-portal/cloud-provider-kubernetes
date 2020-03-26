# Cloud Provider Kubernetes

[![Actions Status](https://github.com/panosc-portal/cloud-provider-kubernetes/workflows/Node%20CI/badge.svg)](https://github.com/panosc-portal/cloud-provider-kubernetes/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This micro-service implements the Cloud Provider API for the PaNOSC Common Portal using a Kubernetes backend.

Images and flavours are managed using via a local database. 
Remote desktop and Jupyter notebook instances are obtained and managed as containers using the kubernetes API on a configured cluster. 
The kubernetes API is accessed using the go-daddy client library  [kubernetes-client](https://github.com/godaddy/kubernetes-client).

This micro-service is contacted by the Cloud Service to allow users to manage and access their different instances. For example a user can request the creation of a remote desktop and then access it.

Further documentation and the design details can be found at [PaNOSC Portal Cloud Provider Design](https://confluence.panosc.eu/x/1gCm) page.

## Installation
```
 npm install 
 ```

## Run
```
npm start
```


### Environment variables

The following environment variables are used to configure the Cloud Provider Kubernetes and can be placed in a dotenv file:

| Environment variable | Default value | Usage |
| ---- | ---- | ---- |
| CLOUD_PROVIDER_K8S_KUBERNETES_CLUSTER_NAME | | The name of the Kubernetes cluster
| CLOUD_PROVIDER_K8S_KUBERNETES_USERNAME | | The username for the Kubernetes cluster
| CLOUD_PROVIDER_K8S_KUBERNETES_CONTEXT_NAME | | The Kubernetes cluster context name
| CLOUD_PROVIDER_K8S_KUBERNETES_PROTOCOL | | The protocol (http/https) used to communicate with the cluster API
| CLOUD_PROVIDER_K8S_KUBERNETES_HOST | | The host (master) of the Kubernetes cluster API
| CLOUD_PROVIDER_K8S_KUBERNETES_PORT | | The port of the Kubernetes cluster API
| CLOUD_PROVIDER_K8S_KUBERNETES_CERTIFICATES_CONFIG | | The path to the Kubernetes certificate configuraiton file (allowing https access to the Kubernetes API rather than requiring a http kubectl proxy)
| CLOUD_PROVIDER_K8S_KUBERNETES_SECRETS_CONFIG | | The path to the (optional) secrets config file for accessing private docker registries
| CLOUD_PROVIDER_K8S_KUBERNETES_REQUEST_HELPER | | The path to the (optional) javascript helper file to perform runtime configuration of kubernetes deployments 
| CLOUD_PROVIDER_K8S_DATABASE_TYPE | | The type of database (eg postgres) |
| CLOUD_PROVIDER_K8S_DATABASE_HOST | | The host of the database |
| CLOUD_PROVIDER_K8S_DATABASE_PORT | | The port of the database |
| CLOUD_PROVIDER_K8S_DATABASE_NAME | | The database name |
| CLOUD_PROVIDER_K8S_DATABASE_SCHEMA | | The database schema |
| CLOUD_PROVIDER_K8S_DATABASE_USERNAME | | The database username |
| CLOUD_PROVIDER_K8S_DATABASE_PASSWORD | | The database password |
| CLOUD_PROVIDER_K8S_DATABASE_SYNCHRONIZE | false | Automatically generates the database structure |
| CLOUD_PROVIDER_K8S_DATABASE_LOGGING | false | Provides detailed SQL logging |
| CLOUD_PROVIDER_K8S_LOG_LEVEL | 'info' | Application logging |
| CLOUD_PROVIDER_K8S_SCHEDULER_ENABLED | true | Specifies whether the scheduler is enabled (updates instance states and removes instances that no longer exist in the Kubernetes cluster)
| CLOUD_PROVIDER_K8S_SCHEDULER_CONFIG | | Specifies the path to the scheduler config file. If not provided the default one in *resources/scheduler.config.json* is used



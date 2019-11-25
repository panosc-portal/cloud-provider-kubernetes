# Cloud Provider Kubernetes
[![Actions Status](https://github.com/panosc-portal/cloud-provider-kubernetes/workflows/Node CI/badge.svg)](https://github.com/panosc-portal/cloud-provider-kubernetes/actions)


This micro service implements the Cloud Provider API for the PaNOSC Common Portal  using a Kubernetes backend.
Images and flavours are managed using  a PostgreSQL database. 
Remote desktop and Jupyter notebook instances are obtained and managed as containers using the kubernetes API on a configured cluster. 
The kubernetes API is accessed using the go-daddy client library  [kubernetes-client](https://github.com/godaddy/kubernetes-client).

The goal is that this micro service will be contacted by the Cloud Service to  give users access to the differents  instances. 
For example a user can request the creation of a remote desktop and then access it.
Documentation: https://confluence.panosc.eu/display/wp4/Common+Portal+-+Cloud+Provider

## Installation
```
 npm install 
 ```

## Run
```
npm start
```
Access explorer at: http://localhost:3000/api/v1/explorer/

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

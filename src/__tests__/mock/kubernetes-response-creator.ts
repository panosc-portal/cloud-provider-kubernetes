export default class K8SResponseCreator {
  _usedNodePorts = [];

  chooseRandomNodePort() {
    const minNodePort = 30000;
    const maxNodePort = 32767;
    const freeNodePortFound = false;
    while (freeNodePortFound === false) {
      const nodePort = Math.floor(Math.random() * (maxNodePort - minNodePort + 1) + minNodePort);
      if (this._usedNodePorts.includes(nodePort) === false) {
        this._usedNodePorts.push(nodePort);
        return nodePort;
      }
    }
  }


  getService(name, namespace, ports, selector) {
    for (const port of ports) {
      port['nodePort'] = this.chooseRandomNodePort();
    }

    return {
      kind: 'Service',
      metadata: {
        name: name,
        namespace: namespace
      },
      spec: {
        ports: ports,
        selector: selector
      }
    };
  }

  getDeployment(request, status: string) {
    let conditions;

    if (status && status.startsWith('pod')) {
      conditions = [{
        type: 'Available',
        status: 'False', message: 'Deployment does not have minimum availability.'
      }, {
        type: 'Progressing',
        status: 'True', message: 'ReplicaSet in progress'
      }];
    } else {
      conditions = [{
        type: 'Available',
        status: 'True',
        message: 'Test deployment was successful'
      }, {
        type: 'Progressing',
        status: 'True', message: 'ReplicaSet has successfully progressed'
      }];
    }

    return {
      kind: 'Deployment',
      metadata: {
        name: request.metadata.name,
        namespace: request.metadata.namespace
      },
      spec: {
        template: request.spec.template
      },
      status: {
        conditions: conditions
      }
    };
  }

  getNamespace(name: string) {
    return {
      kind: 'Namespace',
      metadata: {
        name: name
      }
    };
  }

  getSuccessStatus(name: string, kind: string) {
    return {
      statusCode: 200,
      body: {
        kind: 'Status',
        apiVersion: 'v1',
        metadata: {},
        status: 'Success',
        details: {
          name: name,
          group: 'apps',
          kind: kind
        }
      }
    };
  }

  getNode(node) {
    let spec;
    if (node.master) {
      spec = {
        traits: [
          {
            key: 'node-role.kubernetes.io/master'
          }
        ]
      };
    } else {
      spec = {};
    }

    return {
      metadata: {
        name: node.name
      },
      spec: spec,
      status: {
        capacity: {
          cpu: node.cpu,
          memory: node.memory
        },
        allocatable: {
          cpu: node.cpu,
          memory: node.memory
        },
        addresses: [
          {
            type: 'InternalIP',
            address: node.address
          },
          {
            type: 'HostName',
            address: node.name
          }
        ]
      }
    };
  }

  getNodeListResponse(nodes) {
    const nodeListItems = [];
    for (const node of nodes) {
      nodeListItems.push(this.getNode(node));
    }
    return {
      kind: 'NodeList',
      apiVersion: 'v1',
      items: nodeListItems
    };
  };

  getEndpoint(service: any, status: string) {
    if (status === 'endpoint-error') {
      return {
        kind: 'Endpoints',
        apiVersion: 'v1',
        metadata: {
          name: service.metadata.name
        }
      };
    } else {
      return {
        kind: 'Endpoints',
        apiVersion: 'v1',
        metadata: {
          name: service.metadata.name
        },
        subsets: [{
          addresses: [
            {
              ip: '192.168.140.1'
            }
          ],
          ports: service.spec.ports.map(port => {
            return { name: port.name, port: port.port };
          })
        }]
      };
    }
  }

  getDeletedNamespace(name: string) {
    return {
      kind: 'Namespace',
      apiVersion: 'v1',
      metadata: {
        name: name
      }
    };
  }

  getPodList(deployment, status) {
    let statusContent;
    if (status === 'pod-crash-loop') {
      statusContent = {
        phase: 'Running', conditions: [
          {},
          {
            type: 'Ready',
            status: 'False'
          }
        ], containerStatuses: [
          {
            state: {
              waiting: {
                reason: 'CrashLoopBackOff',
                message: `Back-off 5m0s restarting failed container=${deployment.metadata.name} pod=${deployment.metadata.name}-5586856f79-88d58_default(053b037e-8c00-47ec-a4b5-bf475ebad666)`
              }
            },
            ready: false
          }]
      };
    } else if (status === 'pod-container-creating-timeout') {
      statusContent = {
        phase: 'Pending', conditions: [
          {},
          {
            type: 'Ready',
            status: 'False'
          }
        ], containerStatuses: [
          {
            state: {
              waiting: {
                reason: 'ContainerCreating'
              }
            },
            ready: false
          }]
      };
    } else if (status === 'pod-err-image-pull') {
      statusContent = {
        phase: 'Pending', conditions: [
          {},
          {
            type: 'Ready',
            status: 'False'
          }
        ], containerStatuses: [
          {
            state: {
              waiting: {
                reason: 'ErrImagePull',
                message: `rpc error: code = Unknown desc = Error response from daemon: pull access denied for danielguerra/ubun, repository does not exist or may require \'docker login\': denied: requested access to the resource is denied`
              }
            },
            ready: false
          }]
      };
    } else {
      statusContent = {
        phase: 'Running', conditions: [
          {},
          {
            type: 'Ready',
            status: 'True'
          }
        ],
        containerStatuses: [
          {
            state: {
              running: {}
            },
            ready: true
          }]
      };
    }
    return {
      kind: 'PodList',
      items: [{
        metadata: { name: `${deployment.metadata.name}-12DD-46FV`, creationTimestamp: '2019-12-13T11:40:52Z' },
        status: statusContent,
        spec: { nodeName: 'k8s-test-worker-1' }
      }]
    };
  }

}

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

  getDeployment(request) {
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
        conditions: [{
          type: 'Available',
          status: 'True',
          lastUpdateTime: '2019-12-03T14:21:39Z',
          lastTransitionTime: '2019-12-03T14:21:39Z',
          message: 'Test deployment was successful'
        }]
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

  getNodeResponse(node) {
    const nodeItem = this.getNode(node);
    return {
      kind: 'Node',
      nodeItem
    };
  }

  getEndpoint(service: any) {


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


  getDeletedNamespace(name: string) {
    return {
      kind: 'Namespace',
      apiVersion: 'v1',
      metadata: {
        name: name
      }
    };
  }

}

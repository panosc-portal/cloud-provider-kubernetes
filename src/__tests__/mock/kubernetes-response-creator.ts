export default class K8SResponseCreator {
  getService(name: string, namespace: string, ports: {name: string, port: number}[]) {

    return {
      kind: 'Service',
      metadata: {
        name: name,
        namespace: namespace
      },
      spec: {
        ports: ports.map(port => { return {name: port.name, port: port.port, nodePort: 32000 + Math.random() * 2767}}),
      }
    };
  }

  getDeployment(name: string, namespace: string, ports: number[]) {
    return {
      kind: 'Deployment',
      metadata: {
        name: name,
        namespace: namespace
      },
      spec: {
        template: {
          spec: {
            containers: [{
              name: name,
              ports: ports.map(port => {return {containerPort: port}})
            }]
          }
        }
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
          kind: kind,
          uid: 'e61d06eb-11ee-11ea-bbcb-025000000001'
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
        addresses: {
          0: {
            type: 'InternalIP',
            address: node.address
          }
        }
      }
    };
  }

  getNodeList(nodes) {
    let nodeListItems = [];
    for (const node of nodes) {
      nodeListItems.push(this.getNode(node));
    }
    return {
      kind: 'NodeList',
      apiVersion: 'v1',
      items: nodeListItems
    };
  };

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
        ports: service.spec.ports.map(port => {return {name: port.name, port: port.port}}),
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

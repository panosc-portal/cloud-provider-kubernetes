export default class K8SResponseCreator {
  getService(name, namespace, portName, portNumber) {
    return {
      kind: 'Service',
      metadata: {
        name: name,
        namespace: namespace
      },
      spec: {
        ports: [
          {
            name: portName,
            port: portNumber,
            nodePort: 32417
          }
        ]
      }
    };
  }

  getDeployment(name, namespace) {
    return {
      kind: 'Deployment',
      metadata: {
        name: name,
        namespace: namespace
      }
    };
  }

  getNamespace(name) {
    return {
      kind: 'Namespace',
      metadata: {
        name: name
      }
    };
  }

  getSuccessStatus(name, kind) {
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

  getDeletedNamespace(name) {
    return {
      statusCode: 200,
      body: {
        kind: 'Namespace',
        apiVersion: 'v1',
        metadata: {
          name: name
        }
      }
    };
  }
}

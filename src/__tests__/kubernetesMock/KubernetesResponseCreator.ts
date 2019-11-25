
export default class K8SResponseCreator {
  getService(name,namespace,portName,portNumber) {
    return {
      "kind": "Service",
      "metadata": {
        "name": name,
        "namespace": namespace
      },
      "spec":{
        "ports":[
          {
            "name":portName,
            "port":portNumber,
            "nodePort": 32417
          }
        ]
      }
    };
  };
  
  getDeployment(name,namespace) {
    return {
      "kind": "Deployment",
      "metadata": {
        "name": name,
        "namespace": namespace
      }
    };
  };
};



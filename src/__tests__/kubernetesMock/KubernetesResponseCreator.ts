
export default class K8SResponseCreator {
  getService(name,namespace) {
    return {
      "kind": "Service",
      "metadata": {
        "name": name,
        "namespace": namespace
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



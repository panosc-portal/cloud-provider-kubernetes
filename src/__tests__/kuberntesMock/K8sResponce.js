
getService = function(name,namespace) {
    return {
        "kind": "Service",
        "metadata": {
            "name": name,
            "namespace": namespace
        }
    };
};

getDeployment = function(name,namespace) {
    return {
        "kind": "Deployment",
        "metadata": {
            "name": name,
            "namespace": namespace
        }
    };
};

module.exports = {
    getDeployment: getDeployment,
    getService: getService
};



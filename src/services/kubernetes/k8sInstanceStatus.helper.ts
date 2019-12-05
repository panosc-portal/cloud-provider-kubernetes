import { K8sDeployment } from '../../models/kubernetes';
import { K8sEndpoints } from '../../models/kubernetes/k8sEndpoints';
import { K8sDeploymentStatus } from '../../models/enumerations/k8sDeployment-status.enum';
import { K8sServiceStatus } from '../../models/enumerations/k8sService-status.enum';
import { K8sInstanceStatus } from '../../models/enumerations/k8sInstance-status.enum';
import { logger } from '../../utils';
import { K8sInstanceState } from '../../models/kubernetes/k8sInstanceState.model';


export interface K8sServiceState {
  status: K8sServiceStatus
  message?: string
}

export interface K8sDeploymentState {
  status: K8sDeploymentStatus
  message?: string
}

export class K8sInstanceStatusHelper {

  getK8sInstanceStatus(deployment: K8sDeployment, endpoints: K8sEndpoints): K8sInstanceState {
    const sameInstance = this.verifySameInstance(deployment, endpoints);
    if (sameInstance) {
      const deploymentState = this.getK8sDeploymentState(deployment);
      const deploymentStatus = deploymentState.status;
      if (deploymentStatus === 'ERROR') {
        return new K8sInstanceState(K8sInstanceStatus.ERROR, deploymentState.message);
      } else {
        if (deploymentStatus === 'BUILDING') {
          return new K8sInstanceState(K8sInstanceStatus.BUILDING, deploymentState.message);
        } else {
          if (deploymentStatus === 'UNKNOWN') {
            return new K8sInstanceState(K8sInstanceStatus.UNKNOWN);
          } else {
            if (deploymentStatus === 'ACTIVE') {
              const serviceState = this.getK8sServiceState(endpoints, deployment);
              const serviceStatus = serviceState.status;
              if (serviceStatus === 'ERROR') {
                return new K8sInstanceState(K8sInstanceStatus.ERROR, serviceState.message);
              } else {
                if (serviceStatus === 'ACTIVE') {
                  return new K8sInstanceState(K8sInstanceStatus.ACTIVE);
                }
              }
            }
          }
        }
      }
    }
  }

  getK8sServiceState(endpoints: K8sEndpoints, deployment: K8sDeployment): K8sServiceState {
    const endpointSubsets = endpoints.subsets;
    if (endpointSubsets && endpointSubsets.length == 1) {
      const deploymentPorts = deployment.ports;
      const endpointsPorts = endpointSubsets[0].ports;
      for (const deploymentPort of deploymentPorts) {
        if (endpointsPorts.find(p => p.name == deploymentPort.name) == null) {
          return {
            status: K8sServiceStatus.ERROR,
            message: `port ${deploymentPort.name} has not been mapped to the service`
          };
        }
      }
      return { status: K8sServiceStatus.ACTIVE };
    } else {
      return { status: K8sServiceStatus.ERROR, message: 'Service has no or to many endpoints ' };
    }
  }


  getK8sDeploymentState(deployment: K8sDeployment): K8sDeploymentState {
    const statuses = deployment.statuses();

    const mostRecentObjects = statuses.filter(e => {
      const d = new Date(e.lastTransitionTime);
      return d.getTime() == mostRecentDate.getTime();
    });

    const mostRecentDate = new Date(Math.max.apply(null, statuses.map(e => {
      return new Date(e.lastTransitionTime);
    })));

    if (mostRecentObjects.length >= 1) {
      for (const object of mostRecentObjects) {
        if (mostRecentObjects.hasOwnProperty(object)) {
          if (object.status === 'True') {
            const statusType = object.type.toLowerCase();
            switch (statusType) {
              case 'available':
                return { status: K8sDeploymentStatus.ACTIVE, message: object.message };
              case 'progressing':
                return { status: K8sDeploymentStatus.BUILDING, message: object.message };
              case 'replicafailure':
                return { status: K8sDeploymentStatus.ERROR, message: object.message };
              default:
                return { status: K8sDeploymentStatus.UNKNOWN };
            }
          }
        }
      }
    } else {
      return { status: K8sDeploymentStatus.UNKNOWN };
    }
  }

  verifySameInstance(deployment: K8sDeployment, endpoints: K8sEndpoints) {
    const deploymentName = deployment.name;
    const endpointsName = endpoints.name;

    return deploymentName === endpointsName;
  }
}
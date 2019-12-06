import { K8sDeployment } from '../../models/kubernetes';
import { K8sEndpoints } from '../../models/kubernetes/k8s-endpoints.model';
import { K8sInstanceState } from '../../models/kubernetes/k8s-instanceState.model';
import { logger } from '../../utils';
import { K8sInstanceStatus } from '../../models/enumerations/k8s-instance-status.enum';

enum K8sDeploymentStatus {
  UNKNOWN = 'UNKNOWN',
  BUILDING = 'BUILDING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

enum K8sServiceStatus {
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

interface K8sServiceState {
  status: K8sServiceStatus
  message?: string
}

interface K8sDeploymentState {
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
      } else if (deploymentStatus === 'BUILDING') {
        return new K8sInstanceState(K8sInstanceStatus.BUILDING, deploymentState.message);
      } else if (deploymentStatus === 'UNKNOWN') {
        return new K8sInstanceState(K8sInstanceStatus.UNKNOWN);
      } else if (deploymentStatus === 'ACTIVE') {
        const serviceState = this.getK8sServiceState(endpoints, deployment);
        const serviceStatus = serviceState.status;
        if (serviceStatus === 'ERROR') {
          return new K8sInstanceState(K8sInstanceStatus.ERROR, serviceState.message);
        } else if (serviceStatus === 'ACTIVE') {
          return new K8sInstanceState(K8sInstanceStatus.ACTIVE);
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
        if (endpointsPorts.find((p: any) => p.name == deploymentPort.name) == null) {
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

    const mostRecentObjects = statuses.filter((e: any) => {
      const d = new Date(e.lastTransitionTime);
      return d.getTime() == mostRecentDate.getTime();
    });

    const mostRecentDate = new Date(Math.max.apply(null, statuses.map((e: any) => {
      return new Date(e.lastTransitionTime);
    })));

    const currentStatus = mostRecentObjects.find((object: any) => object.status === 'True');
    if (currentStatus != null) {
      const statusType = currentStatus.type.toLowerCase();
      switch (statusType) {
        case 'available':
          return { status: K8sDeploymentStatus.ACTIVE, message: currentStatus.message };
        case 'progressing':
          return { status: K8sDeploymentStatus.BUILDING, message: currentStatus.message };
        case 'replicafailure':
          return { status: K8sDeploymentStatus.ERROR, message: currentStatus.message };
        default:
          return { status: K8sDeploymentStatus.UNKNOWN };
      }
    
    } else {
      logger.warn(`Couldn't find a current status object`);
      return { status: K8sDeploymentStatus.UNKNOWN };
    }
  }
  
  verifySameInstance(deployment: K8sDeployment, endpoints: K8sEndpoints) {
    const deploymentName = deployment.name;
    const endpointsName = endpoints.name;

    return deploymentName === endpointsName;
  }
}
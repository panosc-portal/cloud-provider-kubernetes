import {expect} from '@loopback/testlab';
import { getTestApplicationContext } from '../../helpers/context.helper';
import { K8sDeploymentManager} from '../../../services';
import {K8sDeploymentRequest, } from '../../../models';

describe('K8sDeploymentManager', () => {
  let k8sDeploymentManager : K8sDeploymentManager;

  before('getK8sDeploymentManager', async () => {
    k8sDeploymentManager= getTestApplicationContext().k8sInstanceService.deploymentManager;
  });


  it('create kubernetes deployment', async () => {
    const k8sDeploymentRequest = new K8sDeploymentRequest({name:'test',image:"danielguerra/ubuntu-xrdp"});
    const K8sDeployment = await k8sDeploymentManager.createK8sDeployment(k8sDeploymentRequest);
    console.log(K8sDeployment);
  });
});

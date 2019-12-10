import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import { K8sDeploymentManager, K8sNamespaceManager } from '../../../../services';
import { K8sDeploymentRequest, K8sNamespaceRequest } from '../../../../models';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';
import { K8sNodeService } from '../../../../services/kubernetes/k8s-node.service';

describe('K8sNodeService', () => {
  let k8sNodeService: K8sNodeService;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sNodeService = testApplicationContext.k8sNodeService;
  });

  beforeEach('startMockServer', async () => {
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('get all nodes', async () => {
    const k8sNodes = await k8sNodeService.getAll();
    expect(k8sNodes).to.not.be.null();
  });
});

import { APPLICATION_CONFIG } from "../application-config";

export class K8SConfigCreator {
  getConfig(): any {
    return {
      apiVersion: 'v1',
      clusters: [
        {
          name: APPLICATION_CONFIG.kubernetes.clusterName,
          cluster: {
            server: `${APPLICATION_CONFIG.kubernetes.protocol}://${APPLICATION_CONFIG.kubernetes.host}:${APPLICATION_CONFIG.kubernetes.port}`
          }
        }
      ],
      users: [
        {
          name: APPLICATION_CONFIG.kubernetes.userName
        }
      ],
      contexts: [
        {
          name: APPLICATION_CONFIG.kubernetes.contextName,
          context: {
            cluster: APPLICATION_CONFIG.kubernetes.clusterName,
            user: APPLICATION_CONFIG.kubernetes.userName
          }
        }
      ],
      'current-context': APPLICATION_CONFIG.kubernetes.contextName
    };
  }
}

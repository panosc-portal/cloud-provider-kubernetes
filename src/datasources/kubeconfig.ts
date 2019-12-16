export class K8SConfigCreator {
  getConfig(): any {
    return {
      apiVersion: 'v1',
      clusters: [
        {
          name: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_CLUSTER_NAME,
          cluster: {
            server: `${process.env.CLOUD_PROVIDER_K8S_KUBERNETES_PROTOCOL}://${process.env.CLOUD_PROVIDER_K8S_KUBERNETES_ADDRESS}:${process.env.CLOUD_PROVIDER_K8S_KUBERNETES_PORT}`
          }
        }
      ],
      users: [
        {
          name: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_USERNAME
        }
      ],
      contexts: [
        {
          name: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_CONTEXT_NAME,
          context: {
            cluster: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_CLUSTER_NAME,
            user: process.env.CLOUD_PROVIDER_K8S_KUBERNETES_USERNAME
          }
        }
      ],
      'current-context': process.env.CLOUD_PROVIDER_K8S_KUBERNETES_CONTEXT_NAME
    };
  }
}

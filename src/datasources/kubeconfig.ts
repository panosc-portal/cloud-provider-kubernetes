import * as dotenv from "dotenv";
dotenv.config();

export const K8config = {
  apiVersion: 'v1',
  clusters: [
    {
      name: process.env.KUBERNETES_CLUSTER_NAME,
      cluster: {
        server: process.env.KUBERNETES_HTTP_URL,
      },
    },
  ],
  users: [
    {
      name: process.env.KUBERNETES_USERNAME,

    },
  ],
  contexts: [
    {
      name: process.env.KUBERNETES_CONTEXT_NAME,
      context: {
        cluster: process.env.KUBERNETES_CLUSTER_NAME,
        user: process.env.KUBERNETES_USERNAME,
      },
    },
  ],
  'current-context': process.env.KUBERNETES_CONTEXT_NAME,
};
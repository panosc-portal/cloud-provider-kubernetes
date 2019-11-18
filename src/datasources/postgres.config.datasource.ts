import * as dotenv from "dotenv";
dotenv.config();

export const  dataConf={
  "name": "postgres",
  "connector": "postgresql",
  "url": process.env.CLOUD_PROVIDER_K8S_POSTGRES_URL
};

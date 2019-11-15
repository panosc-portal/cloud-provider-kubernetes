import * as dotenv from "dotenv";
dotenv.config();

export const  dataConf={
  "name": "postgres",
  "connector": "postgresql",
  "url": process.env.POSTGRES_URL,
  "host": process.env.POSTGRES_HOST,
  "port": process.env.POSTGRES_PORT,
  "user": process.env.POSTGRESS_USER,
  "password": process.env.POSTGRES_PASSWORD,
  "database": process.env.POSTGRES_DATABASE,
};

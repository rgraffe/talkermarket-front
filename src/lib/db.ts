import postgres from "postgres";

const sql = postgres({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  db: process.env.DB_NAME,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export default sql;

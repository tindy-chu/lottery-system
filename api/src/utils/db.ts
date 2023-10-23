import { Pool, QueryResult, QueryResultRow } from 'pg';

// Initialize a new connection pool to the PostgreSQL database
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
});

/**
 * Executes a SQL query against the PostgreSQL database
 *
 * This generic function takes a SQL string and an optional array of parameters.
 * It connects to the database using a client from the connection pool,
 * executes the query, and then releases the client back to the pool.
 *
 * @template T - The type that extends QueryResultRow, which will be the type of rows in the query result
 */
export const query = async <T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: (string | number)[]
): Promise<QueryResult<T>> => {
  const client = await pool.connect();
  try {
    return await client.query<T>(sql, params);
  } finally {
    client.release(); // Release the client back to the pool
  }
};

const db = { query };
export default db;

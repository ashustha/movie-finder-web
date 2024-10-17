import mysql from 'mysql2/promise';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

console.log('Connected to MySQL database');

export { connection };

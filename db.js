import mysql from "mysql2/promise";
import dotenv from 'dotenv';

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',     
  password: process.env.DB_PASSWORD || '1234', 
  database: process.env.DB_NAME || 'akshay_patra', 
  port: process.env.DB_PORT || '3306',     
});

export default mysqlPool;        

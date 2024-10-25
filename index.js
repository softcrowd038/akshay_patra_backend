import colors from 'colors';
import morgan from 'morgan';
import express from 'express';
import dotenv from 'dotenv';
import mysqlPool from './db.js'; 
import locationRoutes from './routes/AppRoutes.js';
import path from 'path'; 

dotenv.config(); 
const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/v1", locationRoutes);

const PORT = process.env.PORT || 8080;

mysqlPool
  .getConnection()
  .then((connection) => {
    console.log("MySQL DB connected".bgCyan.white);
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`.bgWhite.black);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MySQL:", error);
  });

import mysqlPool from '../db.js'; 

const User = {
  async findByEmail(email) {
    const [rows] = await mysqlPool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; 
  },
  
  async createUser(username, email, passwordHash) {
    const [result] = await mysqlPool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, passwordHash]);
    return result.insertId; 
  },

  async createUsersTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await mysqlPool.query(createTableQuery); 
  }
};

export default User;

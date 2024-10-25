import mysqlPool from '../db.js'; 

const Informer = {
 
  async createInformer(uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude ) {
    const insertinformer = `
      INSERT INTO informer (uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude];
    await mysqlPool.query(insertinformer, values);
    return uuid;
  },

  async getinformerByUUID(uuid) {
    const query = `SELECT * FROM informer WHERE uuid = ?`;
    const [rows] = await mysqlPool.query(query, [uuid]);
    return rows[0]; 
  },

  async createInformerTable() {
    const createinformerTable = `
      CREATE TABLE IF NOT EXISTS informer (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL, 
        imageurl VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        capture_date VARCHAR(255) NOT NULL,
        capture_time VARCHAR(255) NOT NULL,
        count INT(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await mysqlPool.query(createinformerTable); 
},

  async deleteinformerByUUID(uuid) {
    const deleteQuery = `DELETE FROM informer WHERE uuid = ?`;
    const [result] = await mysqlPool.query(deleteQuery, [uuid]);
    return result.affectedRows > 0; 
  }
};

export default Informer;

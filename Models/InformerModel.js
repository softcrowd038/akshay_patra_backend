import mysqlPool from '../db.js'; 

const Informer = {
 
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
        latitude DECIMAL(18, 15) NOT NULL,
        longitude DECIMAL(18, 15) NOT NULL,
        status VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await mysqlPool.query(createinformerTable); 
},


async createInformer(uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude, status ) {
  const insertinformer = `
    INSERT INTO informer (uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude, status )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude, status];
  await mysqlPool.query(insertinformer, values);
  return uuid;
},

async getinformerByUUID(uuid) {
  const query = `SELECT * FROM informer WHERE uuid = ?`;
  const [rows] = await mysqlPool.query(query, [uuid]);
  return rows[0]; 
},

async getallInformer() {
  const query = `SELECT * FROM informer`;
  const [rows] = await mysqlPool.query(query);
  return rows; 
},

  async deleteinformerByUUID(uuid) {
    const deleteQuery = `DELETE FROM informer WHERE uuid = ?`;
    const [result] = await mysqlPool.query(deleteQuery, [uuid]);
    return result.affectedRows > 0; 
  },

  async createInformerHistoryTable() {
    const createinformerHistoryTable = `
      CREATE TABLE IF NOT EXISTS informerhistory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL, 
        imageurl VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        capture_date VARCHAR(255) NOT NULL,
        capture_time VARCHAR(255) NOT NULL,
        count INT(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(18, 15) NOT NULL,
        longitude DECIMAL(18, 15) NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await mysqlPool.query(createinformerHistoryTable); 
},


async createInformerHistory(uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude ) {
  const insertinformer = `
    INSERT INTO informerhistory (uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude];
  await mysqlPool.query(insertinformer, values);
  return uuid;
},

async getinformerHistoryByUUID(uuid) {
  const query = `SELECT * FROM informerhistory WHERE uuid = ?`;
  const [rows] = await mysqlPool.query(query, [uuid]);
  return rows[0]; 
},

async getallInformerHistory() {
  const query = `SELECT * FROM informerhistory`;
  const [rows] = await mysqlPool.query(query);
  return rows; 
},


async updateInformer(uuid, fields) {
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(fields)) {
    updates.push(`${key} = ?`);
    values.push(value);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  const updateQuery = `UPDATE informer SET ${updates.join(', ')} WHERE uuid = ?`;
  values.push(uuid);

  await mysqlPool.query(updateQuery, values);
  return uuid;
}

};

export default Informer;

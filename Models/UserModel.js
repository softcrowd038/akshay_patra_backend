import mysqlPool from '../db.js';

const User = {
  async findByEmail(email) {
    const [rows] = await mysqlPool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async createUser(uuid, username, email, passwordHash) {
    const [result] = await mysqlPool.query('INSERT INTO users (uuid, username, email, password) VALUES (?, ?, ?, ?)', [uuid, username, email, passwordHash]);
    return result.insertId;
  },


  async createUserProfile(uuid, imageurl, username, firstname, lastname, location, latitude, longitude, birthdate) {
    const insertUserProfile = `
      INSERT INTO usersProfile (uuid, imageurl, username, firstname, lastname, location, latitude, longitude, birthdate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [uuid, imageurl, username, firstname, lastname, location, latitude, longitude, birthdate];
    await mysqlPool.query(insertUserProfile, values);
    return uuid;
  },

  async getUserProfileByUUID(uuid) {
    const query = `SELECT * FROM usersProfile WHERE uuid = ?`;
    const [rows] = await mysqlPool.query(query, [uuid]);
    return rows[0];
  },

  async createUsersTable() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await mysqlPool.query(createUsersTable);
  }
  ,

  async createUserProfileTable() {
    const createUserProfileTable = `
      CREATE TABLE IF NOT EXISTS usersProfile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE, 
        imageurl VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(18, 15) NOT NULL,
        longitude DECIMAL(18, 15) NOT NULL, 
        birthdate DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await mysqlPool.query(createUserProfileTable);
  },

  async updateUserProfile(uuid, fieldsToUpdate) {
    const updateFields = [];
    const updateValues = [];

    for (const [field, value] of Object.entries(fieldsToUpdate)) {
      if (value !== undefined && value !== null) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    const updateQuery = `
    UPDATE usersProfile 
    SET ${updateFields.join(', ')} 
    WHERE uuid = ?
  `;

    updateValues.push(uuid);

    const [result] = await mysqlPool.query(updateQuery, updateValues);

    return result.affectedRows > 0;
  },

  async deleteUserProfileByUUID(uuid) {
    const deleteQuery = `DELETE FROM usersProfile WHERE uuid = ?`;
    const [result] = await mysqlPool.query(deleteQuery, [uuid]);
    return result.affectedRows > 0;
  },

  async deleteUserByUUID(uuid) {
    const deleteQuery = `DELETE FROM users WHERE uuid = ?`;
    const [result] = await mysqlPool.query(deleteQuery, [uuid]);
    return result.affectedRows > 0;
  }
};

export default User;

import mysqlPool from '../db.js'; 

const Donor = {
 
  async createDonorMeal(uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude ) {
    const insertDonorMeal = `
      INSERT INTO donorProfile (uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude];
    await mysqlPool.query(insertDonorMeal, values);
    return uuid;
  },

  async getDonorMealByUUID(uuid) {
    const query = `SELECT * FROM usersProfile WHERE uuid = ?`;
    const [rows] = await mysqlPool.query(query, [uuid]);
    return rows[0]; 
  },

  async createDonorMealTable() {
    const createDonorMealTable = `
      CREATE TABLE IF NOT EXISTS donorProfile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL, 
        imageurl VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        donation_date VARCHAR(255) NOT NULL,
        donation_time VARCHAR(255) NOT NULL,
        quantity INT(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await mysqlPool.query(createDonorMealTable); 
},

  async deleteDonorMealByUUID(uuid) {
    const deleteQuery = `DELETE FROM usersProfile WHERE uuid = ?`;
    const [result] = await mysqlPool.query(deleteQuery, [uuid]);
    return result.affectedRows > 0; 
  }
};

export default Donor;

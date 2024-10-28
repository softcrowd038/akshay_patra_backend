import mysqlPool from '../db.js'; 

const Donor = {
 
  async createDonorMeal(uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude ) {
    const insertDonorMeal = `
      INSERT INTO donorprofile (uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude];
    await mysqlPool.query(insertDonorMeal, values);
    return uuid;
  },

  async getDonorMealByUUID(uuid) {
    const [results] = await mysqlPool.query('SELECT * FROM donorprofile WHERE uuid = ?', [uuid]);
    return results.length ? results[0] : null; 
  },

  async createDonorMealTable() {
    const createDonorMealTable = `
      CREATE TABLE IF NOT EXISTS donorprofile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL, 
        imageurl VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        donation_date VARCHAR(255) NOT NULL,
        donation_time VARCHAR(255) NOT NULL,
        quantity INT(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(18, 15),
        longitude DECIMAL(18, 15), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await mysqlPool.query(createDonorMealTable); 
},

async createDonorMealHistoryTable() {
  const createDonorMealHistoryTable = `
    CREATE TABLE IF NOT EXISTS donormealhistory  (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL, 
      imageurl VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      donation_date VARCHAR(255) NOT NULL,
      donation_time VARCHAR(255) NOT NULL,
      quantity INT(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      latitude DECIMAL(18, 15),
      longitude DECIMAL(18, 15), 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await mysqlPool.query(createDonorMealHistoryTable); 
},


async createDonorMealHistory(uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude ) {
  const insertDonorMeal = `
    INSERT INTO donormealhistory (uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [uuid, imageurl, description, donation_date, donation_time, quantity, location, latitude, longitude];
  await mysqlPool.query(insertDonorMeal, values);
  return uuid;
},

async getDonorMealHistoryByUUID(uuid) {
  const [results] = await mysqlPool.query('SELECT * FROM donormealhistory WHERE uuid = ?', [uuid]);
  return results.length ? results[0] : null; 
},

};

export default Donor;

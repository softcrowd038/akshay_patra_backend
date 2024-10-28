import mysqlPool from '../db.js';

const NearByLocation = {

  async createClosestInformerTable() {
    const query = `
          CREATE TABLE IF NOT EXISTS ClosestInformer (
            id INT AUTO_INCREMENT PRIMARY KEY,
            donor_uuid VARCHAR(255),
            informer_uuid VARCHAR(255),
            distance DECIMAL(10, 6),
            description TEXT,
            capture_date DATE,
            capture_time TIME,
            count INT,
            location VARCHAR(255),
            latitude DECIMAL(18, 15),
            longitude DECIMAL(18, 15),
            status VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;
    await mysqlPool.query(query);
  },

  async storeClosestInformer(donor_uuid, informer_uuid, distance, description, capture_date, capture_time, count, location, latitude, longitude, status) {
    const query = `
          INSERT INTO ClosestInformer (donor_uuid, informer_uuid, distance, description, capture_date, capture_time, count, location, latitude, longitude, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    await mysqlPool.query(query, [donor_uuid, informer_uuid, distance, description, capture_date, capture_time, count, location, latitude, longitude, status]);
  },


  async getClosestInformersByDonorUUID(donorUUID) {
    const query = `
          SELECT informer_uuid, distance, description, capture_date, capture_time, count, location, latitude, longitude, status
          FROM ClosestInformer
          WHERE donor_uuid = ?
          ORDER BY distance ASC;
        `;

    const [results] = await mysqlPool.query(query, [donorUUID]);
    return results;
  },

  async updateClosestInformer(donor_uuid, informer_uuid, fields) {
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }


    const updateQuery = `UPDATE CLOSESTINFORMER SET ${updates.join(', ')} WHERE donor_uuid = ? AND informer_uuid = ?`;


    values.push(donor_uuid, informer_uuid);


    await mysqlPool.query(updateQuery, values);
    return donor_uuid;
  }


}

export default NearByLocation
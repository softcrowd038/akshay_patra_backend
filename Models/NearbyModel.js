import mysqlPool from '../db.js';

const NearByLocation = {
  async createClosestInformerTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ClosestInformer (
        id INT AUTO_INCREMENT PRIMARY KEY,
        closest_uuid VARCHAR(255),
        donor_uuid VARCHAR(255),
        informer_uuid VARCHAR(255),
        distance DECIMAL(10, 6),
        description TEXT,
        imageurl VARCHAR(255) NOT NULL,
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

  async findClosestInformer(donor_uuid, informer_uuid, capture_date, location) {
    const query = `
      SELECT * FROM ClosestInformer
      WHERE donor_uuid = ? AND informer_uuid = ? AND capture_date = ? AND location = ?
    `;
    const [results] = await mysqlPool.query(query, [donor_uuid, informer_uuid, capture_date, location]);
    return results.length > 0 ? results[0] : null;
  },

  async storeClosestInformer(data) {
    const {
      closest_uuid, donor_uuid, informer_uuid, distance, description, imageurl,
      capture_date, capture_time, count, location, latitude, longitude, status,
    } = data;

    // Ensure the table exists before proceeding
    await this.createClosestInformerTable();

    if (donor_uuid === informer_uuid) {
      console.warn(`Donor UUID and Informer UUID are the same: ${donor_uuid}. Data not stored.`);
      return;
    }

    const existingRecord = await this.findClosestInformer(donor_uuid, informer_uuid, capture_date, location);
    if (existingRecord) {
      console.warn(`Duplicate entry found. Data not stored for donor_uuid: ${donor_uuid}, informer_uuid: ${informer_uuid}.`);
      return;
    }

    const query = `
      INSERT INTO ClosestInformer (closest_uuid, donor_uuid, informer_uuid, distance, description, imageurl, capture_date, capture_time, count, location, latitude, longitude, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await mysqlPool.query(query, [
      closest_uuid, donor_uuid, informer_uuid, distance, description, imageurl,
      capture_date, capture_time, count, location, latitude, longitude, status,
    ]);
  },

  async deleteClosestInformerByclosestUUID(closestUUID) {
    const query = `
      DELETE FROM ClosestInformer
      WHERE closest_uuid = ?
    `;
    await mysqlPool.query(query, [closestUUID]);
  },

  async deleteClosestInformerByDonorUUID(donorUUID) {
    const query = `
      DELETE FROM ClosestInformer
      WHERE donor_uuid = ?
    `;
    await mysqlPool.query(query, [donorUUID]);
  },



  async getClosestInformersByDonorUUID(donorUUID) {
    const query = `
      SELECT * FROM ClosestInformer
      WHERE donor_uuid = ?
      ORDER BY distance ASC;
    `;
    const [results] = await mysqlPool.query(query, [donorUUID]);
    return results;
  },


  async getClosestInformersByClosestUUID(closestUUID) {
    const query = `
      SELECT * FROM ClosestInformer
      WHERE closest_uuid = ?
      ORDER BY distance ASC;
    `;
    const [results] = await mysqlPool.query(query, [closestUUID]);
    return results;
  },



  async updateClosestInformer(closest_uuid, fields) {
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const updateQuery = `UPDATE ClosestInformer SET ${updates.join(', ')} WHERE closest_uuid = ?`;
    values.push(closest_uuid);

    await mysqlPool.query(updateQuery, values);
  },
};

export default NearByLocation;

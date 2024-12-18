import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import Informer from '../Models/InformerModel.js';
import moment from 'moment';
import mysqlPool from '../db.js';

const ensureUploadsDirectory = () => {
  const dir = path.resolve('uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureUploadsDirectory();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve('uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage }).single('imageurl');

const validateToken = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ success: false, message: 'Access token is missing.' });
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decodedDonor) => {
      if (err) {
        return reject(res.status(403).send({ success: false, message: 'Invalid token.' }));
      }
      resolve(decodedDonor);
    });
  });
};

const checkRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field.key]).map(field => field.name);
  return missingFields.length > 0 ? missingFields : null;
};

const informerDetails = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).send({ success: false, message: 'Error uploading file.', error: err.message });
    }

    try {
      const decodedInformer = await validateToken(req, res);
      const { uuid, description, capture_date, capture_time, count, location, latitude, longitude, status } = req.body;

      const missingFields = checkRequiredFields(req.body, [
        { key: 'uuid', name: 'UUID' },
        { key: 'description', name: 'Description' },
        { key: 'capture_date', name: 'Capture Date' },
        { key: 'capture_time', name: 'Capture Time' },
        { key: 'location', name: 'Location' },
        { key: 'latitude', name: 'Latitude' },
        { key: 'longitude', name: 'Longitude' },
        { key: 'count', name: 'Count' },
        { key: 'status', name: 'Status' },
      ]);

      if (missingFields) {
        return res.status(400).send({ success: false, message: `Please provide the following required fields: ${missingFields.join(', ')}.` });
      }
      await Informer.createInformerTable();
      const imageurl = req.file ? `uploads/${req.file.filename}` : '';
      console.log('Image URL:', imageurl);
      await Informer.createInformer(uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude, status);
      await Informer.createInformerHistoryTable();
      await Informer.createInformerHistory(uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude);
      return res.status(201).send({ success: true, message: 'Informer created successfully', uuid });

    } catch (error) {
      console.error("Error creating Informer:", error);
      return res.status(500).send({ success: false, message: 'Error occurred while creating Informer', error: error.message });
    }
  });
};

const getInformerDetails = async (req, res) => {
  try {
    const decodedInformer = await validateToken(req, res).catch(() => null);
    if (!decodedInformer) return;

    const informers = await Informer.getallInformer();
    if (!informers || informers.length === 0) {
      return res.status(404).send({ success: false, message: 'No informers found.' });
    }

    const today = moment().format("YYYY-MM-DD");
    const expiredUUIDs = informers
      .filter(informer => moment(informer.capture_date, "DD/MM/YYYY").isBefore(today) || informer.status === "delivered")
      .map(informer => informer.uuid);

    if (expiredUUIDs.length > 0) {
      const deleteQuery = `DELETE FROM informer WHERE uuid IN (${expiredUUIDs.map(() => '?').join(',')})`;
      mysqlPool.query(deleteQuery, expiredUUIDs, (error, results) => {
        if (error) {
          console.error('Error executing delete query:', error);
        } else {
          console.log(`Deleted ${results.affectedRows} expired informer(s).`);
        }
      });
    }

    const validInformers = informers.filter(informer =>
      moment(informer.capture_date, "DD/MM/YYYY").isSameOrAfter(today)
    );

    return res.status(200).send({
      success: true,
      data: validInformers,
      deleted: expiredUUIDs,
    });
  } catch (error) {
    console.error('Error fetching informer details:', error);
    return res.status(500).send({
      success: false,
      message: 'Error occurred while fetching informer details',
      error: error.message,
    });
  }
};


const getInformerHistoryDetails = async (req, res) => {
  const { uuid } = req.params;
  try {
    const decodedInformer = await validateToken(req, res);
    if (!decodedInformer) return;
    const informer = await Informer.getinformerHistoryByUUID(uuid);
    if (!informer) {
      return res.status(404).send({ success: false, message: 'Informer History not found.' });
    }
    return res.status(200).send({ success: true, data: informer });
  } catch (error) {
    console.error("Error fetching Informer History details:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while fetching Informer history details', error: error.message });
  }
};

const updateInformer = async (req, res) => {
  try {
    const { uuid } = req.params;
    const decodedInformer = await validateToken(req, res);
    if (!decodedInformer) return;

    const fieldsToUpdate = {};
    const { imageurl, description, capture_date, capture_time, count, location, latitude, longitude, status } = req.body;

    if (imageurl) fieldsToUpdate.imageurl = imageurl;
    if (description) fieldsToUpdate.description = description;
    if (capture_date) fieldsToUpdate.capture_date = capture_date;
    if (capture_time) fieldsToUpdate.capture_time = capture_time;
    if (count) fieldsToUpdate.count = count;
    if (location) fieldsToUpdate.location = location;
    if (latitude) fieldsToUpdate.latitude = latitude;
    if (longitude) fieldsToUpdate.longitude = longitude;
    if (status) fieldsToUpdate.status = status;

    await Informer.updateInformer(uuid, fieldsToUpdate);

    return res.status(200).send({ success: true, message: 'Informer updated successfully', uuid });
  } catch (error) {
    console.error("Error updating Informer:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while updating Informer', error: error.message });
  }
};



export { informerDetails, getInformerDetails, getInformerHistoryDetails, updateInformer };

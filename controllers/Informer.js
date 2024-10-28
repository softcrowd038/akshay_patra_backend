import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import Informer from '../Models/InformerModel.js';


const ensureUploadsDirectory = () => {
  const dir = path.resolve('G:', 'Rutik', 'project', 'akshay_patra_backend', 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); 
  }
};

ensureUploadsDirectory();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve('G:', 'Rutik', 'project', 'akshay_patra_backend', 'uploads');
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
        const {
          uuid, description, capture_date, capture_time, count, location, latitude, longitude, status
        } = req.body;
  
        const missingFields = checkRequiredFields(req.body, [
          { key: 'uuid', name: 'UUID' },
          { key: 'description', name: 'Description' },
          { key: 'capture_date', name: 'capture Date' },
          { key: 'capture_time', name: 'capture Time' },
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
        await Informer.createInformer(uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude, status);

        await Informer.createInformerHistoryTable();
        await Informer.createInformerHistory(uuid, imageurl, description, capture_date, capture_time, count, location, latitude, longitude);
        return res.status(201).send({ success: true, message: 'Informer created successfully', uuid });
  
      } catch (error) {
        console.error("Error creating Informer :", error);
        return res.status(500).send({ success: false, message: 'Error occurred while creating Informer', error: error.message });
      }
    });
};

const getInformerDetails = async (req, res) => {
 
  try {
    const decodedInformer = await validateToken(req, res);
    if (!decodedInformer) return; 
    const informer = await Informer.getallInformer();
    if (!informer) {
      return res.status(404).send({ success: false, message: 'Informer  not found.' });
    }
    return res.status(200).send({ success: true, data: informer });
  } catch (error) {
    console.error("Error fetching Informer  details:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while fetching Informer  details', error: error.message });
  }
};

const getInformerHistoryDetails = async (req, res) => {
      const {uuid} = req.params;
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
    const { uuid } = req.params; // Get UUID from URL parameters
    const decodedInformer = await validateToken(req, res);
    if (!decodedInformer) return;

    const fieldsToUpdate = {};
    const { imageurl, description, capture_date, capture_time, count, location, latitude, longitude, status } = req.body;

    // Only add fields that are provided in the request
    if (imageurl) fieldsToUpdate.imageurl = imageurl;
    if (description) fieldsToUpdate.description = description;
    if (capture_date) fieldsToUpdate.capture_date = capture_date;
    if (capture_time) fieldsToUpdate.capture_time = capture_time;
    if (count) fieldsToUpdate.count = count;
    if (location) fieldsToUpdate.location = location;
    if (latitude) fieldsToUpdate.latitude = latitude;
    if (longitude) fieldsToUpdate.longitude = longitude;
    if (status) fieldsToUpdate.status = status;


    // Update the informer in the database
    await Informer.updateInformer(uuid, fieldsToUpdate);

    return res.status(200).send({ success: true, message: 'Informer updated successfully', uuid });
  } catch (error) {
    console.error("Error updating Informer:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while updating Informer', error: error.message });
  }
};



export { informerDetails, getInformerDetails, getInformerHistoryDetails, updateInformer};

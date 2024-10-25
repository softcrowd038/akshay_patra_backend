import fs from 'fs';
import path from 'path';
import Donor from '../Models/DonorModel.js'; 
import jwt from 'jsonwebtoken';
import multer from 'multer';

// Ensure uploads directory
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

// Token validation
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

// Check required fields
const checkRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field.key]).map(field => field.name);
  return missingFields.length > 0 ? missingFields : null;
};

// Create Donor Meal Details
const donorMealDetails = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).send({ success: false, message: 'Error uploading file.', error: err.message });
      }
  
      try {
        const decodedDonor = await validateToken(req, res);
        const {
          uuid, description, current_date, current_time, quantity, location, latitude, longitude,
        } = req.body;
  
        // Check for missing required fields
        const missingFields = checkRequiredFields(req.body, [
          { key: 'uuid', name: 'UUID' },
          { key: 'description', name: 'Description' },
          { key: 'current_date', name: 'Current Date' },
          { key: 'current_time', name: 'Current Time' },
          { key: 'location', name: 'Location' },
          { key: 'latitude', name: 'Latitude' },
          { key: 'longitude', name: 'Longitude' },
          { key: 'quantity', name: 'Quantity' },
        ]);
  
        if (missingFields) {
          return res.status(400).send({ success: false, message: `Please provide the following required fields: ${missingFields.join(', ')}.` });
        }

      
        await Donor.createDonorMealTable();

        const imageurl = req.file ? `uploads/${req.file.filename}` : '';
        await Donor.createDonorMeal(uuid, imageurl, description, current_date, current_time, quantity, location, latitude, longitude);
        return res.status(201).send({ success: true, message: 'Donor Meal created successfully', uuid });
  
      } catch (error) {
        console.error("Error creating Donor Meal:", error);
        return res.status(500).send({ success: false, message: 'Error occurred while creating Donor Meal', error: error.message });
      }
    });
};



export { donorMealDetails};

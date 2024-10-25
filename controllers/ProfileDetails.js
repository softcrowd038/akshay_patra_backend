import fs from 'fs';
import path from 'path';
import User from '../Models/UserModel.js'; 
import jwt from 'jsonwebtoken';
import multer from 'multer';


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
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, user) => {
      if (err) {
        return reject(res.status(403).send({ success: false, message: 'Invalid token.' }));
      }
      resolve(user);
    });
  });
};

const checkRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field.key]).map(field => field.name);
  return missingFields.length > 0 ? missingFields : null;
};

const profileDetails = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).send({ success: false, message: 'Error uploading file.', error: err.message });
    }

    try {
      const user = await validateToken(req, res);
      const {
        uuid,
        username,
        firstname,
        lastname,
        location,
        latitude,
        longitude,
        birthdate,
      } = req.body;

     
      const missingFields = checkRequiredFields(req.body, [
        { key: 'uuid', name: 'UUID' },
        { key: 'username', name: 'Username' },
        { key: 'firstname', name: 'First Name' },
        { key: 'lastname', name: 'Last Name' },
        { key: 'location', name: 'Location' },
        { key: 'latitude', name: 'Latitude' },
        { key: 'longitude', name: 'Longitude' },
        { key: 'birthdate', name: 'Birth Date' },
      ]);

      if (missingFields) {
        return res.status(400).send({ success: false, message: `Please provide the following required fields: ${missingFields.join(', ')}.` });
      }

      await User.createUserProfileTable();
      const imageurl = req.file ? `uploads/${req.file.filename}` : '';
      await User.createUserProfile(uuid, imageurl, username, firstname, lastname, location, latitude, longitude, birthdate);
      return res.status(201).send({ success: true, message: 'User profile created successfully', uuid });

    } catch (error) {
      console.error("Error creating user profile:", error);
      return res.status(500).send({ success: false, message: 'Error occurred while creating user profile', error: error.message });
    }
  });
};

const updateUserProfile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ success: false, message: 'Error uploading file.', error: err.message });
    }

    try {
      const user = await validateToken(req, res);
      const { uuid } = req.params;

      if (!uuid) {
        return res.status(400).send({ success: false, message: 'UUID is required.' });
      }

      const {
        username,
        firstname,
        lastname,
        location,
        latitude,
        longitude,
        birthdate,
      } = req.body;

      const imageurl = req.file ? `uploads/${req.file.filename}` : null;

      await User.updateUserProfile(uuid, imageurl, username, firstname, lastname, location, latitude, longitude, birthdate);
      return res.status(200).send({ success: true, message: 'User profile updated successfully', uuid });

    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).send({ success: false, message: 'Error occurred while updating user profile', error: error.message });
    }
  });
};


const fetchUserProfile = async (req, res) => {
  try {
    const user = await validateToken(req, res);
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).send({ success: false, message: 'UUID is required.' });
    }

    const userProfile = await User.getUserProfileByUUID(uuid);
    if (!userProfile) {
      return res.status(404).send({ success: false, message: 'User profile not found.' });
    }

    return res.status(200).send({ success: true, userProfile });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while fetching user profile', error: error.message });
  }
};

// Delete user profile
const deleteUserProfile = async (req, res) => {
  try {
    const user = await validateToken(req, res);
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).send({ success: false, message: 'UUID is required.' });
    }

    const deletedProfile = await User.deleteUserProfileByUUID(uuid);
    if (!deletedProfile) {
      return res.status(404).send({ success: false, message: 'User profile not found or already deleted.' });
    }

    return res.status(200).send({ success: true, message: 'User profile deleted successfully' });

  } catch (error) {
    console.error("Error deleting user profile:", error);
    return res.status(500).send({ success: false, message: 'Error occurred while deleting user profile', error: error.message });
  }
};

export { profileDetails, fetchUserProfile, updateUserProfile, deleteUserProfile };

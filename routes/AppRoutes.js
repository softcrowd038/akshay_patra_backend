import express from 'express';
import { getLatLong, getLatLongByID, createLatLong, deleteLatLongById } from '../controllers/LocationControllers.js';
import registerUser from '../controllers/RegistrationController.js';
import loginUser from '../controllers/LoginControllers.js'; 
import { fetchUserProfile, profileDetails, updateUserProfile} from '../controllers/ProfileDetails.js';
import { donorMealDetails } from '../controllers/DonorMeal.js';
import { informerDetails } from '../controllers/Informer.js';

const routes = express.Router();




routes.get("/getall", (req, res) => {
    getLatLong(req, res); 
});

// Get latlong by id 
routes.get("/get/:id", (req, res) => {
    getLatLongByID(req, res);
});

// Post latlong in database
routes.post("/post", (req, res) => {
    createLatLong(req, res);
});

routes.delete("/delete/:id", (req, res) => {
    deleteLatLongById(req, res);
});

// Register route
routes.post("/register", (req, res) => {
    registerUser(req, res);
});

// Login route
routes.post("/login", (req, res) => {
    loginUser(req, res);
});

// Login route
routes.post("/profiledetails", (req, res) => {
    profileDetails(req, res);
});

routes.get("/profile/:uuid", (req, res) => {
    fetchUserProfile(req, res);
});

routes.put("/updateprofile/:uuid", (req, res) => {
    updateUserProfile(req, res);
});

// routes.delete("/profiledelete/:uuid", (req, res) => {
//     deleteUserProfile(req, res);
// });

routes.post("/donormeal", (req, res) => {
    donorMealDetails(req, res);
});

routes.post("/informer", (req, res) => {
    informerDetails(req, res);
});



export default routes;

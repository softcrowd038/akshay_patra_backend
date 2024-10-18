import express from 'express';
import { getLatLong, getLatLongByID, createLatLong, deleteLatLongById } from '../controllers/LocationControllers.js';
import registerUser from '../controllers/RegistrationController.js';
import loginUser from '../controllers/LoginControllers.js'; 

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

export default routes;

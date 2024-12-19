import express from 'express';
import { getLatLong, getLatLongByID, createLatLong, deleteLatLongById } from '../controllers/LocationControllers.js';
import registerUser from '../controllers/RegistrationController.js';
import loginUser from '../controllers/LoginControllers.js';
import { deleteUser, deleteUserProfile, fetchUserProfile, profileDetails, updateUserProfile } from '../controllers/ProfileDetails.js';
import { donorMealDetails, getDonorMealDetailsByUUID, getDonorMealHistoryDetailsByUUID } from '../controllers/DonorMeal.js';
import { getInformerDetails, getInformerHistoryDetails, informerDetails, updateInformer } from '../controllers/Informer.js';
import { getAllClosestInformerByDonorUUIDAndInformerUUID, getAllClosestInformers, getClosestInformersByClosestUUID, storeAllClosestInformers, updateClosestInformer } from '../controllers/NearbyLocationController.js';
import {
    createPost, deletePostByPostUUID, deletePostByUUID, getAllPosts, getPostByPostUUID, getPostByUUID,
    updateLikesCount

} from '../controllers/PostsController.js';
import { createComment, getAllComments, getCommentByUUID, getCommentsByPostUUID, getCommentsByCommentUUID, deleteCommentByCommentUUID, deleteCommentByUserUUID } from '../controllers/CommentController.js';
import { deleteLikeStatus, getLikeStatus, getSumOfLikes, postLikeStatus, updateLikeStatus } from '../controllers/LikeController.js';
import { createFollowStatus, deleteFollowController, getFollowStatsbyAccountUUID, getFollowStatsbyFollwedByUUID, getFollowStatusByAcoountUUID, getFollowStatusByAcoountUUIDAndFollowUUID, updateFollowStatus } from '../controllers/FollowController.js';

const routes = express.Router();

routes.get("/getall", (req, res) => {
    getLatLong(req, res);
});


routes.get("/get/:id", (req, res) => {
    getLatLongByID(req, res);
});


routes.post("/post", (req, res) => {
    createLatLong(req, res);
});

routes.delete("/delete/:id", (req, res) => {
    deleteLatLongById(req, res);
});


routes.post("/register", (req, res) => {
    registerUser(req, res);
});


routes.post("/login", (req, res) => {
    loginUser(req, res);
});

routes.delete("/deleteuser/:uuid", (req, res) => {
    deleteUser(req, res);
});

routes.post("/profiledetails", (req, res) => {
    profileDetails(req, res);
});

routes.get("/profile/:uuid", (req, res) => {
    fetchUserProfile(req, res);
});

routes.put("/updateprofile/:uuid", (req, res) => {
    updateUserProfile(req, res);
});

routes.delete("/deleteprofile/:uuid", (req, res) => {
    deleteUserProfile(req, res);
});


routes.post("/donormeal", (req, res) => {
    donorMealDetails(req, res);
});

routes.post("/informer", (req, res) => {
    informerDetails(req, res);
});

routes.get("/donor/meals/:uuid", (req, res) => {
    getDonorMealDetailsByUUID(req, res);
});

routes.get("/donor/meals/history/:uuid", (req, res) => {
    getDonorMealHistoryDetailsByUUID(req, res);
});

routes.get("/getinformer", (req, res) => {
    getInformerDetails(req, res);
});

routes.get("/getinformer/history/:uuid", (req, res) => {
    getInformerHistoryDetails(req, res);
});

routes.post("/storeClosestInformers/:uuid", (req, res) => {
    storeAllClosestInformers(req, res);
});

routes.get('/closest-informers/:donorUUID', async (req, res) => {
    getAllClosestInformers(req, res);
});

routes.get('/closest-info/:closestUUID', async (req, res) => {
    getClosestInformersByClosestUUID(req, res);
});

routes.get('/closest-informers/:donorUUID/:informerUUID', async (req, res) => {
    getAllClosestInformerByDonorUUIDAndInformerUUID(req, res);
});

routes.patch('/informerupdate/:uuid', async (req, res) => {
    updateInformer(req, res);
});

routes.patch('/informerClosestUpdate/:closest_uuid', async (req, res) => {
    updateClosestInformer(req, res);
});

routes.post('/create', createPost);

routes.get('/getposts', getAllPosts);

routes.get('/getpostsbyid/:uuid', getPostByUUID);

routes.get('/getpostsbypostid/:post_uuid', getPostByPostUUID);

routes.patch('/updatepostslike/:post_uuid', updateLikesCount);

routes.delete('/postbyuuid/:uuid', deletePostByUUID);

routes.delete('/postbypost_uuid/:post_uuid', deletePostByPostUUID);

routes.post('/createcomment', createComment);

routes.get('/getallcomments', getAllComments);

routes.get('/getcommentsbyuuid/:uuid', getCommentByUUID);

routes.get('/getcommentsbypostuuid/:post_uuid', getCommentsByPostUUID);

routes.get('/getcommentsbycommentsuuid/:comment_uuid', getCommentsByCommentUUID);

routes.delete('/deletecommentsbycommentuuid/:comment_uuid', deleteCommentByCommentUUID);

routes.post('/postlikestatus', postLikeStatus);

routes.get('/getLikesbyuuidandpostuuid/:uuid/:post_uuid', getLikeStatus);
routes.patch('/updateLikestatusbyuuidandpostuuid/:uuid/:post_uuid', updateLikeStatus);
routes.get('/sum-likes/:post_uuid', getSumOfLikes);

routes.post("/addfollower", createFollowStatus);

routes.get("/follower/:account_uuid/:followed_by_uuid", getFollowStatusByAcoountUUIDAndFollowUUID);

routes.get("/accountfollower/:account_uuid", getFollowStatusByAcoountUUID);

routes.patch("/updateFollowStatus/:account_uuid/:followed_by_uuid", updateFollowStatus);

routes.get("/follow-stats/:account_uuid", getFollowStatsbyAccountUUID);

routes.get("/following-stats/:followed_by_uuid", getFollowStatsbyFollwedByUUID);

routes.delete("/deletefollower/:account_uuid", deleteFollowController);

routes.delete('/deletelikestatus/:uuid', deleteLikeStatus);

routes.delete('/deletecomment/:user_uuid', deleteCommentByUserUUID);

export default routes;

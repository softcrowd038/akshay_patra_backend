import Likes from '../Models/LikesModel.js';
import { validateToken } from "./DonorMeal.js";

const postLikeStatus = async (req, res) => {
    console.log("Request Body:", req.body);

    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;

    const { uuid, post_uuid, status, likes } = req.body;

    if (!uuid || !post_uuid || !status) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: uuid, post_uuid, status, or likes",
        });
    }

    const now = new Date();
    const like_date = now.toISOString().split("T")[0];
    const like_time = now.toTimeString().split(" ")[0];

    try {
        await Likes.createPostLikeStatusTable();
        console.log("Executing Likes.postLikeStatus()...");

        await Likes.postLikeStatus(uuid, post_uuid, status, likes, like_date, like_time);

        return res.status(201).json({
            success: true,
            message: "Like status posted successfully.",
        });
    } catch (error) {
        console.error("Error creating like status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


const getLikeStatus = async (req, res) => {
    const { uuid, post_uuid } = req.params;

    if (!uuid || !post_uuid) {
        return res.status(400).json({ success: false, message: "uuid and post_uuid are required." });
    }

    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;

        const likeStatus = await Likes.getLikeStatusByUUIDAndPostUUID(uuid, post_uuid);

        if (likeStatus.length > 0) {
            return res.status(200).json({ success: true, data: likeStatus });
        } else {
            return res.status(404).json({ success: false, message: 'Like status not found.' });
        }
    } catch (error) {
        console.error('Error fetching like status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const updateLikeStatus = async (req, res) => {
    const { uuid, post_uuid } = req.params;
    const { status, likes } = req.body;

    if (!uuid || !post_uuid || !status || likes === undefined) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: uuid, post_uuid, status, or likes."
        });
    }

    try {
        const isUpdated = await Likes.updateStatusByUUIDAndPostUUID(uuid, post_uuid, status, likes);

        if (isUpdated) {
            return res.status(200).json({ success: true, message: "Status updated successfully." });
        } else {
            return res.status(404).json({ success: false, message: "No record found to update." });
        }
    } catch (error) {
        console.error("Error updating like status:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};


const getSumOfLikes = async (req, res) => {
    const { post_uuid } = req.params;

    if (!post_uuid) {
        return res.status(400).json({
            success: false,
            message: "Missing required field: post_uuid",
        });
    }

    try {
        const totalLikes = await Likes.getSumOfLikesByPostUuid(post_uuid);

        return res.status(200).json({
            success: true,
            post_uuid,
            totalLikes,
        });
    } catch (error) {
        console.error("Error fetching sum of likes:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


const deleteLikeStatus = async (req, res) => {
    const { uuid } = req.params;  

    try {
        const result = await Likes.deleteLikeStatus(uuid); 
        if (result.success) {
            return res.status(200).json({ message: result.message });
        } else {
            return res.status(404).json({ message: result.message });
        }
    } catch (error) {
        console.error("Error in deleteLikeStatus controller:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};



export { postLikeStatus, getLikeStatus, updateLikeStatus, getSumOfLikes, deleteLikeStatus };

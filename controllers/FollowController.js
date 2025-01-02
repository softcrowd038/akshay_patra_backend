import FollowAccount from "../Models/FollowModel.js";
import { validateToken } from "./DonorMeal.js";

const createFollowStatus = async (req, res) => {
    console.log("Request Body:", req.body);

    const decodedUser = await validateToken(req, res);
    if (!decodedUser) return;

    const { account_uuid, followed_by_uuid, status, follower, following } = req.body;

    if (!account_uuid || !followed_by_uuid || !status) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: account_uuid, followed_by_uuid, or status."
        });
    }

    const now = new Date();
    const follow_date = now.toISOString().split("T")[0];
    const follow_time = now.toTimeString().split(" ")[0];

    try {
        await FollowAccount.createAccountFollowTable();
        console.log("Executing FollowAccount.addFollow()...");

        await FollowAccount.addFollow(account_uuid, followed_by_uuid, status, follower, following, follow_date, follow_time);

        return res.status(201).json({
            success: true,
            message: "Follow status created successfully."
        });
    } catch (error) {
        console.error("Error creating follow status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

const getFollowStatusByAcoountUUIDAndFollowUUID = async (req, res) => {
    const { account_uuid, followed_by_uuid } = req.params;

    if (!account_uuid || !followed_by_uuid) {
        return res.status(400).json({
            success: false,
            message: "account_uuid and followed_by_uuid are required."
        });
    }

    try {
        const decodedUser = await validateToken(req, res);
        if (!decodedUser) return;

        const followStatus = await FollowAccount.getFollowStatusByAcoountUUIDAndFollowUUID(account_uuid, followed_by_uuid);

        if (followStatus.length > 0) {
            return res.status(200).json({ success: true, data: followStatus });
        } else {
            return res.status(404).json({ success: false, message: 'Follow status not found.' });
        }
    } catch (error) {
        console.error('Error fetching follow status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getFollowStatusByAcoountUUID = async (req, res) => {
    const { account_uuid } = req.params;

    if (!account_uuid) {
        return res.status(400).json({
            success: false,
            message: "account_uuid are required."
        });
    }

    try {
        const decodedUser = await validateToken(req, res);
        if (!decodedUser) return;

        const followStatus = await FollowAccount.getFollowersByAccountUUID(account_uuid);

        if (followStatus.length > 0) {
            return res.status(200).json({ success: true, data: followStatus });
        } else {
            return res.status(404).json({ success: false, message: 'Follow status not found.' });
        }
    } catch (error) {
        console.error('Error fetching follow status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const updateFollowStatus = async (req, res) => {
    const { account_uuid, followed_by_uuid } = req.params;
    const updates = req.body;

    if (!account_uuid || !followed_by_uuid || Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: account_uuid, followed_by_uuid, or update data."
        });
    }

    try {
        const isUpdated = await FollowAccount.updateFollowStatus(account_uuid, followed_by_uuid, updates);

        if (isUpdated) {
            return res.status(200).json({ success: true, message: "Follow status updated successfully." });
        } else {
            return res.status(404).json({ success: false, message: "No matching record found to update." });
        }
    } catch (error) {
        console.error("Error updating follow status:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const getFollowStatsbyAccountUUID = async (req, res) => {
    const { account_uuid } = req.params;

    if (!account_uuid) {
        return res.status(400).json({
            success: false,
            message: "Missing required field: account_uuid."
        });
    }

    try {
        const stats = await FollowAccount.getFollowStats(account_uuid);

        return res.status(200).json({
            success: true,
            account_uuid,
            stats
        });
    } catch (error) {
        console.error("Error fetching follow stats:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

const getFollowStatsbyFollwedByUUID = async (req, res) => {
    const { followed_by_uuid } = req.params;

    if (!followed_by_uuid) {
        return res.status(400).json({
            success: false,
            message: "Missing required field: account_uuid."
        });
    }

    try {
        const stats = await FollowAccount.getFollowingStats(followed_by_uuid);

        return res.status(200).json({
            success: true,
            followed_by_uuid,
            stats
        });
    } catch (error) {
        console.error("Error fetching follow stats:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


const deleteFollowController = async (req, res) => {
    const { account_uuid } = req.params;

    try {
        const result = await FollowAccount.deleteFollowByAccountUUID(account_uuid);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json(result);
        }
    } catch (error) {
        console.error("Error in deleteFollowController:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting follow relationships.",
            error: error.message,
        });
    }
};

export { createFollowStatus, getFollowStatusByAcoountUUIDAndFollowUUID, getFollowStatusByAcoountUUID, updateFollowStatus, getFollowStatsbyAccountUUID, getFollowStatsbyFollwedByUUID, deleteFollowController };

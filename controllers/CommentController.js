import comments from '../Models/CommentModel.js';
import { v4 as uuidv4 } from 'uuid';
import { validateToken } from "./DonorMeal.js";


const createComment = async (req, res) => {
    console.log('Request Body:', req.body);

    const decodedDonor = await validateToken(req, res);
    if (!decodedDonor) return;

    const { uuid, post_uuid, user_uuid, comment} = req.body;

    const requiredFields = ['post_uuid', 'user_uuid', 'comment'];
    const missingFields = [];

    requiredFields.forEach(field => {
        if (!req.body[field]) {
            missingFields.push(field);
        }
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    const comment_uuid = uuidv4();
    const now = new Date();
    const comment_date = now.toISOString().split("T")[0];
    const comment_time = now.toTimeString().split(" ")[0];

    try {
        await comments.createCommentTable();
        await comments.postComment(post_uuid, comment_uuid, user_uuid, comment, comment_date, comment_time);
        return res.status(201).json({ success: true, message: 'Comment posted successfully.' });
    } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

const getAllComments = async (req, res) => {
    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;
        const allComments = await comments.getAllComments();
        return res.status(200).json({ success: true, data: allComments });
    } catch (error) {
        console.error('Error fetching all comments:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

const getCommentByUUID = async (req, res) => {
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({ success: false, message: 'UUID is required.' });
    }

    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;
        const comment = await comments.getCommentByUUID(uuid);
        if (comment) {
            return res.status(200).json({ success: true, data: comment });
        } else {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }
    } catch (error) {
        console.error('Error fetching comment by UUID:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}


const getCommentsByPostUUID = async (req, res) => {
    const { post_uuid } = req.params;

    if (!post_uuid) {
        return res.status(400).json({ success: false, message: 'Post UUID is required.' });
    }

    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;
        const commentsByPost = await comments.getCommentsByPostUUID(post_uuid);
        if (commentsByPost.length > 0) {
            return res.status(200).json({ success: true, data: commentsByPost });
        } else {
            return res.status(404).json({ success: false, message: 'No comments found for this post.' });
        }
    } catch (error) {
        console.error('Error fetching comments by post_uuid:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}

// Controller to get comments by comment_uuid
const getCommentsByCommentUUID = async (req, res) => {
    const { comment_uuid } = req.params;

    if (!comment_uuid) {
        return res.status(400).json({ success: false, message: 'Comment UUID is required.' });
    }

    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;
        const commentsByCommentUUID = await comments.getCommentsByCommentUUID(comment_uuid);
        if (commentsByCommentUUID.length > 0) {
            return res.status(200).json({ success: true, data: commentsByCommentUUID });
        } else {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }
    } catch (error) {
        console.error('Error fetching comments by comment_uuid:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const deleteCommentByCommentUUID = async (req, res) => {
    const { comment_uuid } = req.params;

    if (!comment_uuid) {
        return res.status(400).json({ success: false, message: 'Comment UUID is required.' });
    }

    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;
        const isDeleted = await comments.deleteCommentByCommentUUID(comment_uuid);
        console.log(isDeleted)
        if (!isDeleted) {
            return res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
        } else {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }
    } catch (error) {
        console.error('Error deleting comment by comment_uuid:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}



export { createComment, getAllComments, getCommentByUUID, getCommentsByPostUUID, getCommentsByCommentUUID, deleteCommentByCommentUUID };

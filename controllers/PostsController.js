import fs from 'fs';
import path from 'path';
import { validateToken } from "./DonorMeal.js";
import multer from 'multer';
import Post from '../Models/PostModel.js';
import { v4 as uuidv4 } from 'uuid';


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
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage }).single('post_url');


const createPost = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(500).json({ success: false, message: 'Error uploading file.' });
        }

        const {
            uuid, post_uuid, title, description, post_date, post_time, type, likes,
        } = req.body;

        try {
            const decodedDonor = await validateToken(req, res);
            if (!decodedDonor) return;
            const post_url = req.file ? `uploads/${req.file.filename}` : '';
            await Post.createPostTable();

            const missingFields = [];
            if (!uuid) missingFields.push('uuid');
            if (!title) missingFields.push('title');
            if (!description) missingFields.push('description');
            if (!post_date) missingFields.push('post_date');
            if (!post_time) missingFields.push('post_time');
            if (!type) missingFields.push('type');
            if (likes === undefined) missingFields.push('likes');

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            const post_uuid = uuidv4();

            await Post.postDataToPosts(
                uuid,
                post_uuid,
                post_url,
                title,
                description,
                post_date,
                post_time,
                type,
                likes
            );

            res.status(201).json({ success: true, message: 'Post created successfully.' });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ success: false, message: 'Error occurred while creating post.', error: error.message });
        }
    });
};

const getAllPosts = async (req, res) => {
    try {

        const posts = await Post.getPostsData();
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Error occurred while fetching posts.', error: error.message });
    }
};

const getPostByUUID = async (req, res) => {
    const { uuid } = req.params;
    console.log(uuid)

    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;
        const post = await Post.getPostsDataByUUID(uuid);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error('Error fetching post by UUID:', error);
        res.status(500).json({ success: false, message: 'Error occurred while fetching post.', error: error.message });
    }
};

const getPostByPostUUID = async (req, res) => {
    const { post_uuid } = req.params;
    console.log(post_uuid)

    try {
        const decodedDonor = await validateToken(req, res);
        if (!decodedDonor) return;
        const post = await Post.getPostsDataByPostUUID(post_uuid);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error('Error fetching post by UUID:', error);
        res.status(500).json({ success: false, message: 'Error occurred while fetching post.', error: error.message });
    }
};


const updateLikesCount = async (req, res) => {
    const { post_uuid } = req.params;
    const { newLikes } = req.body;

    if (typeof newLikes !== 'number' || newLikes < 0) {
        return res.status(400).json({ success: false, message: 'Invalid likes count.' });
    }

    try {
        const postUpdated = await Post.updateLikesCount(post_uuid, newLikes);

        if (postUpdated) {
            res.status(200).json({ success: true, message: 'Likes count updated successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Post not found or no update performed.' });
        }
    } catch (error) {
        console.error("Error updating likes count:", error);
        res.status(500).json({ success: false, message: 'Error occurred while updating likes count.', error: error.message });
    }


};


const deletePostByUUID = async (req, res) => {
    const { uuid } = req.params;

    try {
        const result = await Post.deletePostByUUID(uuid);

        if (result) {
            return res.status(200).json({ message: 'Post deleted successfully' });
        } else {
            return res.status(404).json({ message: 'No matching post found to delete' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the post' });
    }
};

const deletePostByPostUUID = async (req, res) => {
    const { post_uuid } = req.params;

    try {
        const result = await Post.deletePostByPostUUID(post_uuid);

        if (result) {
            return res.status(200).json({ message: 'Post deleted successfully' });
        } else {
            return res.status(404).json({ message: 'No matching post found to delete' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the post' });
    }
};



export { validateToken, createPost, getAllPosts, getPostByUUID, getPostByPostUUID, updateLikesCount, deletePostByUUID, deletePostByPostUUID };

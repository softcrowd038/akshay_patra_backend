import mysqlPool from "../db.js";

const Post = {
    async createPostTable() {
        const createPostTable = `
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL,
                post_uuid VARCHAR(36) NOT NULL,
                post_url VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                post_date DATE NOT NULL,
                post_time TIME NOT NULL,
                type VARCHAR(255) NOT NULL,
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        try {
            await mysqlPool.query(createPostTable);
            console.log("Posts table created successfully.");
        } catch (err) {
            console.error("Error creating posts table:", err.message);
        }
    },

    async postDataToPosts(
        uuid,
        post_uuid,
        post_url,
        title,
        description,
        post_date,
        post_time,
        type,
        likes = 0
    ) {
        const postDataToPosts = `
            INSERT INTO posts (
                uuid,
                post_uuid,
                post_url,
                title,
                description,
                post_date,
                post_time,
                type,
                likes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            uuid,
            post_uuid,
            post_url,
            title,
            description,
            post_date,
            post_time,
            type,
            likes,
        ];

        try {
            await mysqlPool.query(postDataToPosts, values);
            console.log("Post added successfully.");
            return uuid;
        } catch (err) {
            console.error("Error inserting post data:", err.message);
            throw err;
        }
    },

    async getPostsDataByUUID(uuid) {
        const getPostsDataByUUID = `SELECT * FROM posts WHERE uuid = ?`;
        try {
            const [rows] = await mysqlPool.query(getPostsDataByUUID, [uuid]);
            if (rows.length === 0) {
                console.log("No post found for the given UUID.");
                return null;
            }
            return rows;
        } catch (err) {
            console.error("Error fetching posts by UUID:", err.message);
            throw err;
        }
    },

    async getPostsDataByPostUUID(post_uuid) {
        const getPostsDataByPostUUID = `SELECT * FROM posts WHERE post_uuid = ?`;
        try {
            const [rows] = await mysqlPool.query(getPostsDataByPostUUID, [post_uuid]);
            if (rows.length === 0) {
                console.log("No post found for the given UUID.");
                return null;
            }
            return rows;
        } catch (err) {
            console.error("Error fetching posts by UUID:", err.message);
            throw err;
        }
    },

    async getPostsData() {
        const getPostsData = `SELECT * FROM posts`;
        try {
            const [rows] = await mysqlPool.query(getPostsData);
            return rows;
        } catch (err) {
            console.error("Error fetching all posts:", err.message);
            throw err;
        }
    },

    async updateLikesCount(post_uuid, newLikes) {
        const updateLikesQuery = `
        UPDATE posts 
        SET likes = ? 
        WHERE post_uuid = ?
    `;

        try {
            const [result] = await mysqlPool.query(updateLikesQuery, [newLikes, post_uuid]);
            if (result.affectedRows > 0) {
                console.log("Likes count updated successfully.");
                return true;
            } else {
                console.log("No matching record found for update.");
                return false;
            }
        } catch (error) {
            console.error("Error updating likes count:", error);
            throw error;
        }
    },

    async deletePostByUUID(uuid) {
        const deletePostQuery = `
        DELETE FROM posts 
        WHERE uuid = ?
    `;

        try {
            const [result] = await mysqlPool.query(deletePostQuery, [uuid]);
            if (result.affectedRows > 0) {
                console.log("Post deleted successfully.");
                return true;
            } else {
                console.log("No matching post found to delete.");
                return false;
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    },

    async deletePostByPostUUID(post_uuid) {
        const deletePostQuery = `
        DELETE FROM posts 
        WHERE post_uuid = ?
    `;

        try {
            const [result] = await mysqlPool.query(deletePostQuery, [post_uuid]);
            if (result.affectedRows > 0) {
                console.log("Post deleted successfully.");
                return true;
            } else {
                console.log("No matching post found to delete.");
                return false;
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    }



};

export default Post;

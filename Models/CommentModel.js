import mysqlPool from "../db.js";

const comments = {

    async createCommentTable() {
        const commentTable = `CREATE TABLE IF NOT EXISTS comments(
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_uuid VARCHAR(36),
            comment_uuid VARCHAR(36) NOT NULL,
            user_uuid VARCHAR(36) NOT NULL,
            comment TEXT,
            comment_date DATE,
            comment_time TIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        try {
            await mysqlPool.query(commentTable);
            console.log("Comments table created or already exists.");
        } catch (error) {
            console.error("Error creating comments table:", error);
            throw error;
        }
    },


    async postComment(post_uuid, comment_uuid, user_uuid, comment, comment_date, comment_time) {
        const postCommentQuery = `
            INSERT INTO comments (post_uuid, comment_uuid, user_uuid, comment, comment_date, comment_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        try {
            await mysqlPool.query(postCommentQuery, [
               post_uuid, comment_uuid, user_uuid, comment, comment_date, comment_time
            ]);
            console.log("Comment posted successfully.");
        } catch (error) {
            console.error("Error posting comment:", error);
            throw error;
        }
    },


    async getAllComments() {
        const getAllCommentsQuery = `SELECT * FROM comments`;
        try {
            const [comments] = await mysqlPool.query(getAllCommentsQuery);
            return comments;
        } catch (error) {
            console.error("Error fetching all comments:", error);
            throw error;
        }
    },


    async getCommentByUUID(uuid) {
        const getCommentByUUIDQuery = `SELECT * FROM comments WHERE uuid = ?`;
        try {
            const [comment] = await mysqlPool.query(getCommentByUUIDQuery, [uuid]);
            return comment[0];
        } catch (error) {
            console.error("Error fetching comment by UUID:", error);
            throw error;
        }
    },


    async getCommentsByPostUUID(post_uuid) {
        const getCommentsByPostUUIDQuery = `SELECT * FROM comments WHERE post_uuid = ?`;
        try {
            const [comments] = await mysqlPool.query(getCommentsByPostUUIDQuery, [post_uuid]);
            return comments;
        } catch (error) {
            console.error("Error fetching comments by post_uuid:", error);
            throw error;
        }
    },


    async getCommentsByCommentUUID(comment_uuid) {
        const getCommentsByCommentUUIDQuery = `SELECT * FROM comments WHERE comment_uuid = ?`;
        try {
            const [comments] = await mysqlPool.query(getCommentsByCommentUUIDQuery, [comment_uuid]);
            return comments;
        } catch (error) {
            console.error("Error fetching comments by comment_uuid:", error);
            throw error;
        }
    },

    async deleteCommentByCommentUUID(comment_uuid) {
        const deleteCommentByCommentUUIDQuery = `DELETE FROM comments WHERE comment_uuid = ?`;
        try {
            const result = await mysqlPool.query(deleteCommentByCommentUUIDQuery, [comment_uuid]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting comment by comment_uuid:", error);
            throw error;
        }
    }
};

export default comments;

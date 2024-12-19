import mysqlPool from "../db.js";

const Likes = {
    async createPostLikeStatusTable() {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS likestatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36),
    post_uuid VARCHAR(36),
    status VARCHAR(36),
    likes INT DEFAULT 0,
    like_date DATE,
    like_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (uuid, post_uuid) -- Enforces uniqueness
)

    `;
        try {
            await mysqlPool.query(createTableQuery);
            console.log("Likes table created or already exists.");
        } catch (error) {
            console.error("Error creating the 'likestatus' table:", error);
            throw error;
        }
    },

    async postLikeStatus(uuid, post_uuid, status, likes, like_date, like_time) {
        const checkQuery = `
      SELECT COUNT(*) AS count
      FROM likestatus
      WHERE uuid = ? AND post_uuid = ?
    `;
        const insertQuery = `
      INSERT INTO likestatus (
        uuid, post_uuid, status, likes, like_date, like_time
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

        try {
            const [results] = await mysqlPool.query(checkQuery, [uuid, post_uuid]);
            if (results[0].count > 0) {
                console.log("Duplicate like status detected. Skipping insert.");
                return { success: false, message: "Duplicate like status." };
            }

            // Proceed to insert if no duplicate exists
            await mysqlPool.query(insertQuery, [uuid, post_uuid, status, likes, like_date, like_time]);
            console.log("Like status posted successfully.");
            return { success: true, message: "Like status posted successfully." };
        } catch (error) {
            console.error("Error inserting like status:", error);
            throw error;
        }
    },


    async getLikeStatusByUUIDAndPostUUID(uuid, post_uuid) {
        const selectQuery = `
      SELECT * FROM likestatus 
      WHERE uuid = ? AND post_uuid = ?
    `;
        try {
            const [likesStatus] = await mysqlPool.query(selectQuery, [uuid, post_uuid]);
            console.log("Like status retrieved successfully.");
            return likesStatus;
        } catch (error) {
            console.error("Error retrieving like status:", error);
            throw error;
        }
    },

    async getLikeStatusByPostUUID(post_uuid) {
        const selectQuery = `
      SELECT * FROM likestatus WHERE post_uuid = ?
    `;
        try {
            const [likes] = await mysqlPool.query(selectQuery, [uuid, post_uuid]);
            console.log("Like status retrieved successfully.");
            return likes;
        } catch (error) {
            console.error("Error retrieving like status:", error);
            throw error;
        }
    },

    async updateStatusByUUIDAndPostUUID(uuid, post_uuid, status, likes) {
        const updateQuery = `
      UPDATE likestatus 
      SET status = ?, likes = ?
      WHERE uuid = ? AND post_uuid = ?
    `;
        try {
            const [result] = await mysqlPool.query(updateQuery, [status, likes, uuid, post_uuid]);
            if (result.affectedRows > 0) {
                console.log("Status updated successfully.");
                return true;
            } else {
                console.log("No matching record found for update.");
                return false;
            }
        } catch (error) {
            console.error("Error updating status:", error);
            throw error;
        }
    },

    async getSumOfLikesByPostUuid(postUuid) {
        const selectQuery = `
        SELECT CAST(SUM(likes) AS SIGNED) AS totalLikes
        FROM likestatus
        WHERE post_uuid = ?
        GROUP BY post_uuid
    `;

        try {
            const [results] = await mysqlPool.query(selectQuery, [postUuid]);
            const totalLikes = results[0]?.totalLikes ? parseInt(results[0].totalLikes, 10) : 0;
            console.log("Total Likes:", totalLikes);
            console.log("Total Likes Type:", typeof totalLikes); // Confirm it's an integer
            return totalLikes;
        } catch (error) {
            console.error("Error fetching sum of likes:", error);
            throw error;
        }
    },

    async deleteLikeStatus(uuid) {
        const deleteQuery = `
      DELETE FROM likestatus 
      WHERE uuid = ?
    `;
        try {
            const [result] = await mysqlPool.query(deleteQuery, [uuid]);
            if (result.affectedRows > 0) {
                console.log("Like status deleted successfully.");
                return { success: true, message: "Like status deleted successfully." };
            } else {
                console.log("No matching record found to delete.");
                return { success: false, message: "No matching record found to delete." };
            }
        } catch (error) {
            console.error("Error deleting like status:", error);
            throw error;
        }
    }
};


export default Likes;

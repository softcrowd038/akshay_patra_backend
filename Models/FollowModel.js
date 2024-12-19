import mysqlPool from "../db.js";

const FollowAccount = {
    async createAccountFollowTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS followaccount (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_uuid VARCHAR(36),
                followed_by_uuid VARCHAR(36),
                status VARCHAR(36),
                follower INT DEFAULT 0,
                following INT DEFAULT 0,
                follow_date DATE,
                follow_time TIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (followed_by_uuid, account_uuid)
            )
        `;
        try {
            await mysqlPool.query(createTableQuery);
            console.log("followaccount table created or already exists.");
        } catch (error) {
            console.error("Error creating the 'followaccount' table:", error);
            throw error;
        }
    },

    async addFollow(account_uuid, followed_by_uuid, status, follower, following, follow_date, follow_time) {
        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM followaccount
            WHERE account_uuid = ? AND followed_by_uuid = ?
        `;
        const insertQuery = `
            INSERT INTO followaccount (
                account_uuid, followed_by_uuid, status, follower, following, follow_date, follow_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const [results] = await mysqlPool.query(checkQuery, [account_uuid, followed_by_uuid]);
            if (results[0].count > 0) {
                console.log("Duplicate follow entry detected. Skipping insert.");
                return { success: false, message: "Duplicate follow entry." };
            }

            await mysqlPool.query(insertQuery, [account_uuid, followed_by_uuid, status, follower, following, follow_date, follow_time]);
            console.log("Follow added successfully.");
            return { success: true, message: "Follow added successfully." };
        } catch (error) {
            console.error("Error adding follow:", error);
            throw error;
        }
    },

    async getFollowStatusByAcoountUUIDAndFollowUUID(account_uuid, followed_by_uuid) {
        const selectQuery = `
            SELECT * FROM followaccount 
            WHERE account_uuid = ? AND followed_by_uuid = ?
        `;
        try {
            const [followStatus] = await mysqlPool.query(selectQuery, [account_uuid, followed_by_uuid]);
            console.log("Follow status retrieved successfully.");
            return followStatus;
        } catch (error) {
            console.error("Error retrieving follow status:", error);
            throw error;
        }
    },

    async getFollowersByAccountUUID(account_uuid) {
        const selectQuery = `
            SELECT * FROM followaccount 
            WHERE account_uuid = ? AND status = 'follow'
        `;
        try {
            const [followers] = await mysqlPool.query(selectQuery, [account_uuid]);
            console.log("Followers retrieved successfully.");
            return followers;
        } catch (error) {
            console.error("Error retrieving followers:", error);
            throw error;
        }
    },

    async updateFollowStatus(account_uuid, followed_by_uuid, updates) {

        const setClause = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");

        const queryParams = [...Object.values(updates), account_uuid, followed_by_uuid];

        const updateQuery = `
        UPDATE followaccount 
        SET ${setClause} 
        WHERE account_uuid = ? AND followed_by_uuid = ?
    `;

        try {
            const [result] = await mysqlPool.query(updateQuery, queryParams);
            if (result.affectedRows > 0) {
                console.log("Follow status updated successfully.");
                return true;
            } else {
                console.log("No matching record found for update.");
                return false;
            }
        } catch (error) {
            console.error("Error updating follow status:", error);
            throw error;
        }
    },


    async getFollowStats(account_uuid) {
        const selectQuery = `
        SELECT 
            CAST(SUM(follower) AS SIGNED) AS total_followers
        FROM followaccount
        WHERE account_uuid = ? AND status = 'follow'
    `;

        try {
            const [results] = await mysqlPool.query(selectQuery, [account_uuid]);
            const stats = {
                total_followers: results[0]?.total_followers || 0,
            };
            console.log("Follow stats retrieved successfully.", stats);
            return stats;
        } catch (error) {
            console.error("Error fetching follow stats:", error);
            throw error;
        }
    },


    async getFollowingStats(followed_by_uuid) {
        const selectQuery = `
        SELECT 
            CAST(SUM(follower) AS SIGNED) AS total_following
        FROM followaccount
        WHERE followed_by_uuid = ? AND status = 'follow'
    `;

        try {
            const [results] = await mysqlPool.query(selectQuery, [followed_by_uuid]);
            const stats = {
                total_following: results[0]?.total_following || 0,
            };
            console.log("Follow stats retrieved successfully.", stats);
            return stats;
        } catch (error) {
            console.error("Error fetching follow stats:", error);
            throw error;
        }
    },

    async deleteFollowByAccountUUID(account_uuid) {
        const deleteQuery = `
            DELETE FROM followaccount 
            WHERE account_uuid = ? OR followed_by_uuid = ?
        `;
        try {
            const [result] = await mysqlPool.query(deleteQuery, [account_uuid, account_uuid]);
            if (result.affectedRows > 0) {
                console.log(`Follow relationships for account ${account_uuid} deleted successfully.`);
                return { success: true, message: `Follow relationships for account ${account_uuid} deleted successfully.` };
            } else {
                console.log(`No follow relationships found for account ${account_uuid}.`);
                return { success: false, message: `No follow relationships found for account ${account_uuid}.` };
            }
        } catch (error) {
            console.error("Error deleting follow by account UUID:", error);
            throw error;
        }
    },


};

export default FollowAccount;

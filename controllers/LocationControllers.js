import db from "../db.js"; 


const getLatLong = async (req, res) => {
    try {
        const data = await db.query("SELECT * FROM lat_long");
        if (!data.length) { 
            return res.status(404).send({
                success: false,
                message: "No data Found",
            });
        }
        res.status(200).send({
            success: true,
            message: "Get all data",
            data: data,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in fetching Latlong",
            error: error.message,
        });
    }
};


const getLatLongByID = async (req, res) => {
    try {
        const latLongId = req.params.id;

       
        if (!latLongId) {
            return res.status(404).send({
                success: false,
                message: "No ID provided",
            });
        }

      
        const [data] = await db.query("SELECT * FROM lat_long WHERE latlong_id = ?", [latLongId]);

       
        if (!data || data.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No data found with the given ID",
            });
        }

       
        res.status(200).send({
            success: true,
            message: `Data fetched successfully for ID ${latLongId}`,
            data: data[0], 
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error occurred while fetching data",
            error: error.message,
        });
    }
};


const createLatLong = async (req, res) => {
    try {
       
        const { latitude, longitude } = req.body;

       
        if (!latitude || !longitude) {
            return res.status(400).send({
                success: false,
                message: "Please provide both latitude and longitude",
            });
        }

     
        const [result] = await db.query(
            `INSERT INTO lat_long (latitude, longitude) VALUES (?, ?)`,
            [latitude, longitude]
        );

        if (result.affectedRows === 0) {
            return res.status(500).send({
                success: false,
                message: "Error occurred while inserting data",
            });
        }


        res.status(201).send({
            success: true,
            message: "Data stored successfully",
            data: {
                id: result.insertId, 
                latitude,
                longitude,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error occurred while storing data",
            error: error.message,
        });
    }
};


const deleteLatLongById = async (req, res) => {
    try {
        const latLongId = req.params.id;

        if (!latLongId) {
            return res.status(404).send({
                success: false,
                message: "Enter valid required ID",
            });
        }

        const result = await db.query("DELETE FROM lat_long WHERE latlong_id = ?", [latLongId]);
        if (result.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: `Data is not available at provided ID ${latLongId}`,
            });
        }

        res.status(200).send({
            success: true,
            message: `Data at ID ${latLongId} deleted successfully`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error occurred during deleting data",
            error: error.message,
        });
    }
};


export { getLatLong, getLatLongByID, createLatLong, deleteLatLongById };

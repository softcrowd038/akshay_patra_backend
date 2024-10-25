import bcrypt from 'bcrypt'; 
import User from '../Models/UserModel.js';
import { v4 as uuidv4 } from 'uuid';  

const registerUser = async (req, res) => {
  try {
    const { username, email, password, rePassword } = req.body;

    console.log("Incoming registration data:", req.body);

    if (!username || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide username, email, password",
      });
    }
    


    await User.createUsersTable(); 

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Email is already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const uuid = uuidv4();
    const userId = await User.createUser(uuid, username, email, passwordHash);
    

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      data: {
        id: userId,
        uuid,
        username,
        email,
        passwordHash
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send({
      success: false,
      message: "Error occurred during registration",
      error: error.message,
    });
  }
};






export default registerUser;

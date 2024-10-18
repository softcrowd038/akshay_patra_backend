import bcrypt from 'bcrypt'; 
import User from '../Models/UserModel.js';  

const registerUser = async (req, res) => {
  try {
    const { username, email, password, rePassword } = req.body;

    console.log("Incoming registration data:", req.body);

    if (!username || !email || !password || !rePassword) {
      return res.status(400).send({
        success: false,
        message: "Please provide username, email, password, and re-entered password",
      });
    }
    
    if (password !== rePassword) {
      return res.status(400).send({
        success: false,
        message: "Passwords do not match",
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
    const userId = await User.createUser(username, email, passwordHash);

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      data: {
        id: userId,
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

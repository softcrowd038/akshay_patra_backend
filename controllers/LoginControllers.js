import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/UserModel.js';

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Incoming login data:", req.body);


    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }


    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }


    let uniqueId = user.id;
    if (!uniqueId) {
      uniqueId = uuidv4();
      user.uuid = uniqueId;
      await user.save();
    }
    const token = jwt.sign(
      { id: uniqueId, uuid: user.uuid, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '10d' }
    );

    const username = user.username;
    const uuid = user.uuid;
    res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      username,
      email,
      uuid
    });
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).send({
      success: false,
      message: "Error occurred during login",
      error: error.message,
    });
  }
};

export default loginUser;

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

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).send({
      success: true,
      message: "Login successful",
      token, 
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
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

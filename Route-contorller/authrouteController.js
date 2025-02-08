import User from '../Models/user.js';
import bcryptjs from 'bcryptjs';
import jwtToken from '../Util/jwtToken.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error });
  }
};

// Register
export const userRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation for required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Check if user already exists with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Hash password before saving to the database
    const hashPassword = bcryptjs.hashSync(password, 10);

    // Create and save new user
    const newUser = await User.create({ name, email, password: hashPassword, role });

    // Generate a JWT token for the user for future authentication
    jwtToken(newUser._id, res);

    // Send response with user data and JWT token
    res.status(201).send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      msg: 'User created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation for required fields
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Compare password with hashed password
    const isMatch = bcryptjs.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    // Generate JWT token for the user
    jwtToken(user._id, res);

    // Send response with user data and JWT token
    res.status(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      msg: 'Login successful',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Logout
export const userLogout = async (req, res) => {
  try {
    // Clear the JWT token cookie to log the user out
    res.clearCookie('jwt', ''); // Clears the cookie containing the JWT token

    // Send response confirming the user is logged out
    res.status(200).send({ msg: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};
 
export const userDelete=async(req,res)=>{
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (user) {
        return res.status(200).json({ success: true, message: 'The user is deleted!' });
    } else {
        return res.status(404).json({ success: false, message: 'User not found!' });
    }
} catch (error) {
    return res.status(500).json({ success: false, error: error.message });
}
}
import User from '../Models/user.js';
import bcryptjs from 'bcryptjs';
import jwtToken from '../Util/jwtToken.js';

// Register
export const userRegister = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists with the same email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }

        // Hash password before saving to the database for security
        const hashPassword = bcryptjs.hashSync(password, 10);

        //   const user = await User.create({ name, email, password, role });
        // Create a new user with provided data and default profile picture
        const newUser = new User({
            name,

            email,
            password: hashPassword,
            role
        });
        // Save the new user to the database
        await newUser.save();

        // Generate a JWT token for the user for future authentication
        jwtToken(newUser._id, res)
        // Send a response with user data and the JWT token
        res.status(200).send({
            _id: newUser._id,
            name: newUser.name,

            email: newUser.email,
            role: newUser.role,


            msg: "User created successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// Login
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if username or email is provided and find the user accordingly
        //   const user = await User.findOne({ email });
        let user;
        if (email) {
            user = await User.findOne({ email });
        }
        // If user not found, return an error message
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }
        const isMatch = bcryptjs.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid password" });
        }
        // Generate a JWT token for the user
        jwtToken(user._id, res);
        // Send a response with user data and the JWT token
        res.status(200).send({
            _id: user._id,
            name: user.name,

            email: user.email,
            role: user.role,


            msg: "Login successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

export const userLogout = async (req, res) => {
    try {
        // Clear the JWT token cookie to log the user out
        res.clearCookie('jwt', '');  // Clears the cookie containing the JWT token

        // Send response confirming the user is logged out
        res.status(200).send({ msg: "Logged out successfully" });
    } catch (error) {
        console.error(error);

        // Send error response in case of failure
        res.status(500).send({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

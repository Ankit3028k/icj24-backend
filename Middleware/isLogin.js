import jwt from 'jsonwebtoken';
import User from '../Models/user.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
          token = req.headers.authorization.split(' ')[1]; // Get token from header
          const decoded = jwt.verify(token, process.env.SECRET_KEY);
          req.user = await User.findById(decoded.id).select('-password');
          next();
      } catch (error) {
          res.status(401).json({ message: 'user Not authorized, token failed', error: error.message });
      }
  }
  if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
  }
};


export { protect };

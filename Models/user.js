import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Editor', 'Author', 'Modaretor', 'Analyst'],
        required: true
    },
},{Timestamp:true});
const User = mongoose.model("User", userSchema);
export default User;
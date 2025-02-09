import mongoose from 'mongoose';

const featuredVideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    
    video: {  // Changed 'image' to 'video'
        type: String,
        default: '',
        required: true,
    },
});

featuredVideoSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

featuredVideoSchema.set('toJSON', {
    virtuals: true,
});

const videoNews = mongoose.model('News', featuredVideoSchema);

export default videoNews;

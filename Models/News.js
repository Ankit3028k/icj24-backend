import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        // required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    // images: [{
    //     type: String
    // }],
    author: [{
        type: String,
        default: ''
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    datePosted: {
        type: Date,
        default: Date.now,
    },
    // New fields added
    isDrafted: {
        type: Boolean,
        default: false // Default value is false (not drafted)
    },
    isFeatured: {
        type: Boolean,
        default: false // Default value is false (not featured)
    },
});

newsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

newsSchema.set('toJSON', {
    virtuals: true,
});

const news = mongoose.model('News', newsSchema);

export default news;

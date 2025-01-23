import mongoose from 'mongoose';



const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
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
   
   
   
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    
  
    datePosted: {
        type: Date,
        default: Date.now,
    },
});

newsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

newsSchema.set('toJSON', {
    virtuals: true,
});

const news = mongoose.model('Category', newsSchema);

export default news;

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

// Check if the model already exists to avoid redefining it
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;

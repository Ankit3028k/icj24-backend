import express from 'express';
import Category from '../Models/Categories.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const categoryList = await Category.find();
        if (!categoryList) {
            res.status(500).json({ success: false });
        } else {
            res.status(200).send(categoryList);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a specific category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'The category with the given ID was not found.' });
        } else {
            res.status(200).send(category);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new category
router.post('/', async (req, res) => {
    try {
        const { name, img, color } = req.body;
        const category = new Category({
            name,
            img,
            color
        });
        const savedCategory = await category.save();
        res.status(201).send(savedCategory);
    } catch (error) {
        res.status(400).send('The category cannot be created: ' + error.message);
    }
});

// PUT to update a category by ID
router.put('/:id', async (req, res) => {
    try {
        const { name, img } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, img },
            { new: true }
        );
        if (!updatedCategory) {
            res.status(404).send('The category with the given ID was not found.');
        } else {
            res.status(200).send(updatedCategory);
        }
    } catch (error) {
        res.status(400).send('The category cannot be updated: ' + error.message);
    }
});

// DELETE a category by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndRemove(req.params.id);
        if (deletedCategory) {
            res.status(200).json({ success: true, message: 'The category is deleted!' });
        } else {
            res.status(404).json({ success: false, message: 'Category not found!' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

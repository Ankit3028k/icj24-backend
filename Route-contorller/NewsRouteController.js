import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import News from '../Models/News.js';
import Category from '../Models/Categories.js';
import mongoose from 'mongoose';

const router = Router();

// Multer setup to store files in memory
const storage = multer.memoryStorage();
const uploadOptions = multer({ storage });

// POST a new news with a single image upload
router.post('/',
    //  uploadOptions.single('image'),
      async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        // const file = req.file;
        // if (!file) return res.status(400).send('No image in the request');

        // // Upload image to Cloudinary
        // const result = await new Promise((resolve, reject) => {
        //     const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        //         if (error) reject(error);
        //         else resolve(result);
        //     });
        //     streamifier.createReadStream(file.buffer).pipe(uploadStream);
        // });

        // const imageUrl = result.secure_url;

        const news = new News({
            title: req.body.title,
            content: req.body.content,
            richDescription: req.body.richDescription,
            // image: imageUrl,
            category: req.body.category,
            datePosted: req.body.datePosted
        });

        await news.save();
        res.send(news);
    } catch (error) {
        res.status(500).send('Error creating news: ' + error.message);
    }
});

// PUT to update a news with a new image upload if provided
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid news Id');
        }

        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        let imageUrl = req.body.image;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            imageUrl = result.secure_url;
        }

        const news = await News.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                content: req.body.content,
                richDescription: req.body.richDescription,
                image: imageUrl,
                category: req.body.category,
                datePosted: req.body.datePosted
            },
            { new: true }
        );

        if (!news) {
            return res.status(500).send('The news cannot be updated!');
        }
        res.send(news);
    } catch (error) {
        res.status(500).send('Error updating news: ' + error.message);
    }
});

// DELETE a news by ID
router.delete('/:id', async (req, res) => {
    try {
        const news = await News.findByIdAndRemove(req.params.id);
        if (news) {
            return res.status(200).json({ success: true, message: 'The news is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'News not found!' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT to upload multiple gallery images for a news
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid news Id');
        }

        const files = req.files;
        let imagesPaths = [];

        if (files) {
            for (let file of files) {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });
                    streamifier.createReadStream(file.buffer).pipe(uploadStream);
                });
                imagesPaths.push(result.secure_url);
            }
        }

        const news = await News.findByIdAndUpdate(
            req.params.id,
            { images: imagesPaths },
            { new: true }
        );

        if (!news) return res.status(500).send('The gallery cannot be updated!');
        res.send(news);
    } catch (error) {
        res.status(500).send('Error updating gallery: ' + error.message);
    }
});

export default router;

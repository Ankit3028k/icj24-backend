import News from '../Models/News.js';
import express from 'express';
import Category from '../Models/Categories.js';
import mongoose from 'mongoose';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup to store files in memory
const storage = multer.memoryStorage();
const uploadOptions = multer({ storage: storage });

// Routes

// GET all news, with optional category filter
router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const newsList = await News.find(filter).populate('category');

    if (!newsList) {
        res.status(500).json({ success: false });
    }
    res.send(newsList);
});

// GET a single news by ID
router.get(`/:id`, async (req, res) => {
    const news = await News.findById(req.params.id).populate('category');

    if (!news) {
        res.status(500).json({ success: false });
    }
    res.send(news);
});

// POST a new news with a single image upload
router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    // Upload image to Cloudinary
    let imageUrl;
    try {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
        imageUrl = result.secure_url;
    } catch (error) {
        return res.status(500).send('Image upload failed');
    }

    let news = new News({
        title: req.body.title,
        content: req.body.content,
        richDescription: req.body.richDescription,
        category: req.body.category,
        image: imageUrl,  // Set the image URL from Cloudinary
        author: req.body.author,
        isDrafted: req.body.isDrafted || false,  // Set isDrafted, defaulting to false if not provided
        isFeatured: req.body.isFeatured || false,  // Set isFeatured, defaulting to false if not provided
    });

    news = await news.save();
    if (!news) return res.status(500).send('The news cannot be created');
    res.send(news);
});

// PUT to update a news with a new image upload if provided
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid news Id');
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    let imageUrl = req.body.image;
    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            imageUrl = result.secure_url;
        } catch (error) {
            return res.status(500).send('Image upload failed');
        }
    }

    const news = await News.findByIdAndUpdate(
        req.params.id,
        {
            title: req.body.title,
            content: req.body.content,
            richDescription: req.body.richDescription,
            image: imageUrl,  // Update the image URL from Cloudinary if provided
            author: req.body.author,
            category: req.body.category,
            isDrafted: req.body.isDrafted || false,  // Update isDrafted
            isFeatured: req.body.isFeatured || false,  // Update isFeatured
        },
        { new: true }
    );

    if (!news) {
        return res.status(500).send('The news cannot be updated!');
    }
    res.send(news);
});

// DELETE a news by ID
router.delete('/:id', async (req, res) => {
    News.findByIdAndDelete(req.params.id).then(news => {
        if (news) {
            return res.status(200).json({ success: true, message: 'The news is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: "news not found!" });
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err });
    });
});

// GET news count
router.get(`/get/count`, async (req, res) => {
    const newsCount = await News.countDocuments((count) => count);

    if (!newsCount) {
        res.status(500).json({ success: false });
    }
    res.send({ newsCount });
});

// GET featured news with optional limit
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const newses = await News.find({ isFeatured: true }).limit(+count);

    if (!newses) {
        res.status(500).json({ success: false });
    }
    res.send(newses);
});

// PUT to upload multiple gallery images for a news article
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid news Id');
    }

    const files = req.files;
    let imagesPaths = [];

    if (files) {
        try {
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
        } catch (error) {
            return res.status(500).send('Gallery upload failed');
        }
    }

    const news = await News.findByIdAndUpdate(
        req.params.id,
        { images: imagesPaths },
        { new: true }
    );

    if (!news) return res.status(500).send('The gallery cannot be updated!');
    res.send(news);
});

router.patch('/:id', async (req, res) => {
    const newsId = req.params.id;
    const { isFeatured, isDrafted } = req.body;
  
    // Ensure both fields are boolean values
    if (typeof isFeatured !== 'boolean' || typeof isDrafted !== 'boolean') {
      return res.status(400).json({ message: 'Both isFeatured and isDrafted must be boolean values.' });
    }
  
    try {
      const updatedNews = await News.findByIdAndUpdate(
        newsId,
        { isFeatured: isFeatured, isDrafted: isDrafted }, // Include isDrafted here as well
        { new: true }
      );
  
      if (!updatedNews) {
        return res.status(404).json({ message: 'News not found' });
      }
  
      res.status(200).json(updatedNews);
    } catch (error) {
      console.error('Error updating news:', error);
      res.status(500).json({ message: 'Failed to update news' });
    }
  });
   
export default router;

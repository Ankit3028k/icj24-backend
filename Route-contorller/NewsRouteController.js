// import { Router } from 'express';
// import { v2 as cloudinary } from 'cloudinary';
// import multer from 'multer';
// import streamifier from 'streamifier';
// import News from '../Models/News.js';
// import Category from '../Models/Categories.js';
// import mongoose from 'mongoose';

// const router = Router();

// // Multer setup to store files in memory
// const storage = multer.memoryStorage();
// const uploadOptions = multer({ storage });

// // POST a new news with a single image upload
// router.post('/',
//     //  uploadOptions.single('image'),
//       async (req, res) => {
//     try {
//         const category = await Category.findById(req.body.category);
//         if (!category) return res.status(400).send('Invalid Category');

//         // const file = req.file;
//         // if (!file) return res.status(400).send('No image in the request');

//         // // Upload image to Cloudinary
//         // const result = await new Promise((resolve, reject) => {
//         //     const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
//         //         if (error) reject(error);
//         //         else resolve(result);
//         //     });
//         //     streamifier.createReadStream(file.buffer).pipe(uploadStream);
//         // });

//         // const imageUrl = result.secure_url;

//         const news = new News({
//             title: req.body.title,
//             content: req.body.content,
//             richDescription: req.body.richDescription,
//             // image: imageUrl,
//             category: req.body.category,
//             datePosted: req.body.datePosted
//         });

//         await news.save();
//         res.send(news);
//     } catch (error) {
//         res.status(500).send('Error creating news: ' + error.message);
//     }
// });

// // PUT to update a news with a new image upload if provided
// router.put('/:id', uploadOptions.single('image'), async (req, res) => {
//     try {
//         if (!mongoose.isValidObjectId(req.params.id)) {
//             return res.status(400).send('Invalid news Id');
//         }

//         const category = await Category.findById(req.body.category);
//         if (!category) return res.status(400).send('Invalid Category');

//         let imageUrl = req.body.image;
//         if (req.file) {
//             const result = await new Promise((resolve, reject) => {
//                 const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
//                     if (error) reject(error);
//                     else resolve(result);
//                 });
//                 streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//             });
//             imageUrl = result.secure_url;
//         }

//         const news = await News.findByIdAndUpdate(
//             req.params.id,
//             {
//                 title: req.body.title,
//                 content: req.body.content,
//                 richDescription: req.body.richDescription,
//                 image: imageUrl,
//                 category: req.body.category,
//                 datePosted: req.body.datePosted
//             },
//             { new: true }
//         );

//         if (!news) {
//             return res.status(500).send('The news cannot be updated!');
//         }
//         res.send(news);
//     } catch (error) {
//         res.status(500).send('Error updating news: ' + error.message);
//     }
// });

// // DELETE a news by ID
// router.delete('/:id', async (req, res) => {
//     try {
//         const news = await News.findByIdAndRemove(req.params.id);
//         if (news) {
//             return res.status(200).json({ success: true, message: 'The news is deleted!' });
//         } else {
//             return res.status(404).json({ success: false, message: 'News not found!' });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// // PUT to upload multiple gallery images for a news
// router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
//     try {
//         if (!mongoose.isValidObjectId(req.params.id)) {
//             return res.status(400).send('Invalid news Id');
//         }

//         const files = req.files;
//         let imagesPaths = [];

//         if (files) {
//             for (let file of files) {
//                 const result = await new Promise((resolve, reject) => {
//                     const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
//                         if (error) reject(error);
//                         else resolve(result);
//                     });
//                     streamifier.createReadStream(file.buffer).pipe(uploadStream);
//                 });
//                 imagesPaths.push(result.secure_url);
//             }
//         }

//         const news = await News.findByIdAndUpdate(
//             req.params.id,
//             { images: imagesPaths },
//             { new: true }
//         );

//         if (!news) return res.status(500).send('The gallery cannot be updated!');
//         res.send(news);
//     } catch (error) {
//         res.status(500).send('Error updating gallery: ' + error.message);
//     }
// });

// export default router;


import  News  from '../Models/News.js';
import express from 'express';
import  Category  from '../Models/Categories.js';
import mongoose from 'mongoose';
import multer from 'multer';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();
                        
// Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup to store files in memory
const storage = multer.memoryStorage();
const uploadOptions = multer({ storage: storage });

const router = express.Router();

// Routes

// GET all Newss, with optional category filter
router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    try {
        const newsList = await News.find(filter).populate('category');
        if (!newsList) {
            return res.status(500).json({ success: false });
        }
        res.send(newsList);
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

// GET a single news by ID
router.get(`/:id`, async (req, res) => {
    try {
        const news = await News.findById(req.params.id).populate('category');
        if (!news) {
            return res.status(500).json({ success: false });
        }
        res.send(news);
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

// POST a new news with a single image upload
router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    let imageUrl;
    try {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
        imageUrl = result.secure_url;
    } catch (error) {
        return res.status(500).send('Image upload failed');
    }

    const news = new News({
        title: req.body.title,
        content: req.body.content,
        richDescription: req.body.richDescription,
        image: imageUrl,
        category: req.body.category,
        datePosted: req.body.datePosted,
    });

    try {
        const savedNews = await news.save();
        res.send(savedNews);
    } catch (error) {
        res.status(500).send('The News cannot be created');
    }
});

// PUT to update a News with a new image upload if provided
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid News Id');
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    let imageUrl;
    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.v2.uploader.upload_stream((error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            imageUrl = result.secure_url;
        } catch (error) {
            return res.status(500).send('Image upload failed');
        }
    } else {
        imageUrl = req.body.image;
    }

    try {
        const updatedNews = await News.findByIdAndUpdate(
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
        res.send(updatedNews);
    } catch (error) {
        res.status(500).send('The News cannot be updated!');
    }
});

// DELETE a News by ID
router.delete('/:id', async (req, res) => {
    try {
        const news = await News.findByIdAndRemove(req.params.id);
        if (news) {
            return res.status(200).json({ success: true, message: 'The news is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: "news not found!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
});

// GET news count
router.get(`/get/count`, async (req, res) => {
    try {
        const newsCount = await News.countDocuments();
        res.send({ newsCount });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

// GET featured newss with optional limit
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? parseInt(req.params.count) : 0;
    try {
        const newss = await News.find({ isFeatured: true }).limit(count);
        res.send(newss);
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

// PUT to upload multiple gallery images for a news
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid news Id');
    }

    const files = req.files;
    let imagesPaths = [];

    if (files) {
        try {
            for (const file of files) {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.v2.uploader.upload_stream((error, result) => {
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

    try {
        const news = await News.findByIdAndUpdate(
            req.params.id,
            { images: imagesPaths },
            { new: true }
        );
        res.send(news);
    } catch (error) {
        return res.status(500).send('The gallery cannot be updated!');
    }
});

export default router;

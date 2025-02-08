import express from 'express';
import multer from 'multer';
import { newsPull ,newsDelete ,newsUpdateGallery, getNews, getNewsById, createNews} from '../Route-contorller/NewsRouteController.js';
// Multer setup to store files in memory
const storage = multer.memoryStorage();
const uploadOptions = multer({ storage: storage });

// 
const router = express.Router();
router.get('/get-news',getNews)
router.get('/get-news/:id',getNewsById)
router.post('/post-news',uploadOptions.single('image'), createNews);
router.put('/put-news/:id', uploadOptions.single('image'), newsPull);
router.delete('/delete-news/:id', newsDelete);
router.put('/news/gallery/:id', newsUpdateGallery);

export default router;
 
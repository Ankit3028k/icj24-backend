import express from 'express';
import { createNewsVideo, deleteNewsVideo, getNewsVideos } from '../Route-contorller/FeaturedVideoController.js';

const router = express.Router();

// Route to create a news video
router.post('/FeaturedVideo', createNewsVideo);

// Route to get all news videos
router.get('/FeaturedVideo', getNewsVideos);

router.delete('/FeaturedVideo/:id',deleteNewsVideo)

export default router;

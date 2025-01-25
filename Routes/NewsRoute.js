import express from 'express';
import { newsPull ,newsDelete ,newsUpdateGallery} from '../Route-contorller/NewsRouteController.js';
const router = express.Router();
// router.post('/news', newsPost);
router.put('/news/:id', newsPull);
router.delete('/news/:id', newsDelete);
router.put('/news/gallery/:id', newsUpdateGallery);

export default router;

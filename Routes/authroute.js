import express from 'express';
import { userRegister, userLogin, userLogout } from '../Route-contorller/authrouteController.js';

const router = express.Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/logout', userLogout);

export default router;
